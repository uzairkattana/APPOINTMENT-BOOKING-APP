-- UNIFIED GROUP CHAT SYSTEM
-- Single group for admin + staff with full admin control

-- Drop existing chat tables to start fresh
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS group_chat_settings CASCADE;

-- Create unified group chat messages table
CREATE TABLE chat_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL CHECK (sender_role IN ('admin', 'staff')),
    message TEXT NOT NULL,
    message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'system', 'notification')),
    
    -- Admin control fields
    deleted_by TEXT NULL, -- Admin who deleted this message
    deleted_at TIMESTAMPTZ NULL, -- When message was deleted
    is_deleted BOOLEAN DEFAULT FALSE, -- Soft delete flag
    
    -- Message status
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ NULL,
    delivered BOOLEAN DEFAULT TRUE,
    delivered_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadata
    edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMPTZ NULL,
    original_message TEXT NULL
);

-- Group chat settings (admin controlled)
CREATE TABLE group_chat_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    setting_key TEXT NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    updated_by TEXT NOT NULL, -- Admin who updated setting
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Common settings
    CONSTRAINT valid_setting_key CHECK (setting_key IN (
        'group_name',
        'allow_staff_messages',
        'message_retention_days',
        'auto_clear_enabled',
        'last_cleared_by',
        'last_cleared_at'
    ))
);

-- Insert default group settings
INSERT INTO group_chat_settings (setting_key, setting_value, updated_by) VALUES
('group_name', 'Medical Team Communication', 'system'),
('allow_staff_messages', 'true', 'system'),
('message_retention_days', '30', 'system'),
('auto_clear_enabled', 'false', 'system'),
('last_cleared_by', 'none', 'system'),
('last_cleared_at', 'never', 'system');

-- Create indexes for performance
CREATE INDEX idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX idx_chat_messages_is_deleted ON chat_messages(is_deleted);
CREATE INDEX idx_chat_messages_deleted_at ON chat_messages(deleted_at);
CREATE INDEX idx_chat_messages_read ON chat_messages(read);

-- Enable Row Level Security
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_chat_settings ENABLE ROW LEVEL SECURITY;

-- Chat Messages Policies
-- All authenticated users can view non-deleted messages
CREATE POLICY "View active messages" ON chat_messages
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    is_deleted = FALSE
  );

-- Admin can view all messages (including deleted ones for management)
CREATE POLICY "Admin view all messages" ON chat_messages
  FOR SELECT USING (
    auth.role() = 'authenticated' AND 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Users can insert messages (if staff messages are allowed)
CREATE POLICY "Insert messages" ON chat_messages
  FOR INSERT WITH CHECK (
    auth.role() = 'authenticated' AND
    auth.uid()::text = sender_id
  );

-- Admin can delete any message
CREATE POLICY "Admin delete messages" ON chat_messages
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Admin can clear all messages (update all messages)
CREATE POLICY "Admin clear all messages" ON chat_messages
  FOR UPDATE USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Group Chat Settings Policies (admin only)
CREATE POLICY "Admin manage settings" ON group_chat_settings
  FOR ALL USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.uid() = id AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Grant permissions
GRANT ALL ON chat_messages TO authenticated;
GRANT ALL ON group_chat_settings TO authenticated;
GRANT SELECT ON chat_messages TO anon;
GRANT SELECT ON group_chat_settings TO anon;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER update_chat_messages_updated_at
    BEFORE UPDATE ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_group_chat_settings_updated_at
    BEFORE UPDATE ON group_chat_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Admin function to delete a specific message
CREATE OR REPLACE FUNCTION delete_message(message_id UUID, admin_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    admin_role TEXT;
BEGIN
    -- Verify admin role
    SELECT raw_user_meta_data->>'role' INTO admin_role
    FROM auth.users 
    WHERE id = auth.uid()::text;
    
    IF admin_role != 'admin' THEN
        RETURN FALSE;
    END IF;
    
    -- Soft delete the message
    UPDATE chat_messages 
    SET 
        is_deleted = TRUE,
        deleted_by = admin_id,
        deleted_at = NOW()
    WHERE id = message_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admin function to clear all messages
CREATE OR REPLACE FUNCTION clear_all_messages(admin_id TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    admin_role TEXT;
BEGIN
    -- Verify admin role
    SELECT raw_user_meta_data->>'role' INTO admin_role
    FROM auth.users 
    WHERE id = auth.uid()::text;
    
    IF admin_role != 'admin' THEN
        RETURN FALSE;
    END IF;
    
    -- Soft delete all messages
    UPDATE chat_messages 
    SET 
        is_deleted = TRUE,
        deleted_by = admin_id,
        deleted_at = NOW()
    WHERE is_deleted = FALSE;
    
    -- Update settings
    UPDATE group_chat_settings 
    SET setting_value = admin_id, updated_at = NOW()
    WHERE setting_key = 'last_cleared_by';
    
    UPDATE group_chat_settings 
    SET setting_value = NOW()::text, updated_at = NOW()
    WHERE setting_key = 'last_cleared_at';
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

SELECT 'Unified group chat system created successfully!' as result;

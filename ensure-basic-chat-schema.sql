-- Ensure basic chat schema exists for production

-- Step 1: Check if chat_messages table exists, create if not
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL,
    receiver_id TEXT NOT NULL,
    receiver_role TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    delivered BOOLEAN DEFAULT false,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Add optional columns if they don't exist
DO $$
BEGIN
    -- Add expires_at column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' AND column_name = 'expires_at'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN expires_at TIMESTAMPTZ;
    END IF;

    -- Add chat_type column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' AND column_name = 'chat_type'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN chat_type VARCHAR(20) DEFAULT 'individual';
    END IF;
END $$;

-- Step 3: Check if user_status table exists, create if not
CREATE TABLE IF NOT EXISTS user_status (
    user_id TEXT PRIMARY KEY,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    is_online BOOLEAN DEFAULT false,
    last_seen TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 4: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver_id ON chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_type ON chat_messages(chat_type);

-- Step 5: Enable RLS if not already enabled
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_status ENABLE ROW LEVEL SECURITY;

-- Step 6: Add basic RLS policies (if they don't exist)
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own messages" ON chat_messages;
    DROP POLICY IF EXISTS "Users can insert their own messages" ON chat_messages;
    DROP POLICY IF EXISTS "Users can update their own messages" ON chat_messages;
    DROP POLICY IF EXISTS "Users can view user status" ON user_status;
    DROP POLICY IF EXISTS "Users can update their own status" ON user_status;
    
    -- Create new policies
    CREATE POLICY "Users can view their own messages" ON chat_messages
        FOR SELECT USING (
            auth.uid()::text = sender_id OR 
            auth.uid()::text = receiver_id
        );
    
    CREATE POLICY "Users can insert their own messages" ON chat_messages
        FOR INSERT WITH CHECK (
            auth.uid()::text = sender_id
        );
    
    CREATE POLICY "Users can update their own messages" ON chat_messages
        FOR UPDATE USING (
            auth.uid()::text = sender_id
        );
    
    CREATE POLICY "Users can view user status" ON user_status
        FOR SELECT USING (true);
    
    CREATE POLICY "Users can update their own status" ON user_status
        FOR UPDATE USING (
            auth.uid()::text = user_id
        );
END $$;

-- Step 7: Verification
SELECT 'Basic chat schema ensured successfully!' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chat_messages' 
ORDER BY ordinal_position;

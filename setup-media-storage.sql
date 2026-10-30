-- Setup Media Storage for WhatsApp-like Chat System

-- Step 1: Create media_files table
CREATE TABLE IF NOT EXISTS media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('voice', 'video', 'image', 'file')),
    mime_type TEXT NOT NULL,
    size BIGINT NOT NULL,
    url TEXT NOT NULL,
    duration INTEGER, -- For audio/video in seconds
    thumbnail TEXT, -- For video thumbnails
    user_id TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours')
);

-- Step 2: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_media_files_user_id ON media_files(user_id);
CREATE INDEX IF NOT EXISTS idx_media_files_created_at ON media_files(created_at);
CREATE INDEX IF NOT EXISTS idx_media_files_type ON media_files(type);
CREATE INDEX IF NOT EXISTS idx_media_files_expires_at ON media_files(expires_at);

-- Step 3: Add media columns to chat_messages table if they don't exist
DO $$
BEGIN
    -- Add media_url column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' AND column_name = 'media_url'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN media_url TEXT;
    END IF;

    -- Add media_type column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' AND column_name = 'media_type'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN media_type VARCHAR(20);
    END IF;

    -- Add media_name column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' AND column_name = 'media_name'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN media_name TEXT;
    END IF;

    -- Add media_size column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' AND column_name = 'media_size'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN media_size BIGINT;
    END IF;

    -- Add media_duration column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' AND column_name = 'media_duration'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN media_duration INTEGER;
    END IF;

    -- Make message column optional (nullable)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' AND column_name = 'message' AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE chat_messages ALTER COLUMN message DROP NOT NULL;
    END IF;
END $$;

-- Step 4: Enable RLS on media_files
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;

-- Step 5: Add RLS policies for media_files
DO $$
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own media" ON media_files;
    DROP POLICY IF EXISTS "Users can upload their own media" ON media_files;
    DROP POLICY IF EXISTS "Users can delete their own media" ON media_files;
    
    -- Create new policies
    CREATE POLICY "Users can view their own media" ON media_files
        FOR SELECT USING (
            auth.uid()::text = user_id
        );
    
    CREATE POLICY "Users can upload their own media" ON media_files
        FOR INSERT WITH CHECK (
            auth.uid()::text = user_id
        );
    
    CREATE POLICY "Users can delete their own media" ON media_files
        FOR DELETE USING (
            auth.uid()::text = user_id
        );
END $$;

-- Step 6: Create storage bucket for media files (run this in Supabase dashboard)
-- Storage bucket name: "chat-media"
-- Public access: Yes
-- File size limit: 100MB

-- Step 7: Add sample media messages for testing
INSERT INTO chat_messages (
    id, sender_id, sender_name, sender_role,
    receiver_id, receiver_role,
    message, media_url, media_type, media_name, media_size, media_duration,
    read, delivered, created_at, expires_at, chat_type
) VALUES
(
    gen_random_uuid(), 
    'admin-user', 
    'Dr. Bashir Khan', 
    'admin',
    'group',
    'staff',
    NULL, -- No text message for media
    'https://picsum.photos/seed/whatsapp1/400/300.jpg',
    'image',
    'sample-image.jpg',
    45000,
    NULL,
    false, 
    true, 
    NOW() - INTERVAL '2 hours', 
    NOW() + INTERVAL '24 hours',
    'group'
),
(
    gen_random_uuid(), 
    'staff-user-2', 
    'Dr. Sarah Johnson', 
    'staff',
    'group',
    'staff',
    'Check out this patient X-ray image!',
    'https://picsum.photos/seed/whatsapp2/400/300.jpg',
    'image',
    'patient-xray.jpg',
    52000,
    NULL,
    false, 
    true, 
    NOW() - INTERVAL '1 hour', 
    NOW() + INTERVAL '24 hours',
    'group'
),
(
    gen_random_uuid(), 
    'staff-user-3', 
    'Nurse Michael Chen', 
    'staff',
    'admin-user',
    'admin',
    'Voice note: Patient John Doe is ready for his appointment',
    'https://www.soundhelix.com/examples/mp3/SampleAudio_0.4mb.mp3',
    'voice',
    'voice-note.mp3',
    400000,
    15,
    false, 
    true, 
    NOW() - INTERVAL '30 minutes', 
    NOW() + INTERVAL '24 hours',
    'individual'
);

-- Step 8: Verification
SELECT 'Media storage setup completed!' as status;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'chat_messages' 
AND column_name LIKE 'media_%'
ORDER BY ordinal_position;

SELECT COUNT(*) as sample_media_messages FROM chat_messages WHERE media_url IS NOT NULL;
SELECT COUNT(*) as media_files FROM media_files;

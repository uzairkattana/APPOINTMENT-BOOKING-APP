-- Quick fix for chat error - ensure basic chat setup works

-- Step 1: Check if chat_messages table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'chat_messages') THEN
        RAISE NOTICE 'chat_messages table exists';
    ELSE
        RAISE NOTICE 'chat_messages table does not exist - please run setup-chat-enhanced.sql first';
    END IF;
END $$;

-- Step 2: Check if user_status table exists
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_status') THEN
        RAISE NOTICE 'user_status table exists';
    ELSE
        RAISE NOTICE 'user_status table does not exist - please run setup-chat-enhanced.sql first';
    END IF;
END $$;

-- Step 3: Add chat_type column if it doesn't exist (safe addition)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'chat_messages' AND column_name = 'chat_type'
    ) THEN
        ALTER TABLE chat_messages ADD COLUMN chat_type VARCHAR(20) DEFAULT 'individual';
        RAISE NOTICE 'Added chat_type column';
    ELSE
        RAISE NOTICE 'chat_type column already exists';
    END IF;
END $$;

-- Step 4: Ensure admin user exists
INSERT INTO user_status (user_id, user_name, user_role, is_online, last_seen, updated_at) VALUES
('admin-user', 'Dr. Bashir Khan', 'admin', false, NOW(), NOW())
ON CONFLICT (user_id) DO UPDATE SET 
  user_name = EXCLUDED.user_name,
  user_role = EXCLUDED.user_role,
  updated_at = EXCLUDED.updated_at;

-- Step 5: Ensure test staff exists
INSERT INTO user_status (user_id, user_name, user_role, is_online, last_seen, updated_at) VALUES
('staff-user', 'Staff Member', 'staff', true, NOW(), NOW())
ON CONFLICT (user_id) DO UPDATE SET 
  user_name = EXCLUDED.user_name,
  user_role = EXCLUDED.user_role,
  is_online = EXCLUDED.is_online,
  updated_at = EXCLUDED.updated_at;

-- Step 6: Add a simple test message if none exist
INSERT INTO chat_messages (
  id, sender_id, sender_name, sender_role,
  receiver_id, receiver_role,
  message, read, delivered, created_at, expires_at, chat_type
) VALUES
(
  gen_random_uuid(), 
  'admin-user', 
  'Dr. Bashir Khan', 
  'admin',
  'staff-user',
  'staff',
  'Test message - chat system is working!',
  false, 
  true, 
  NOW(), 
  NOW() + INTERVAL '24 hours',
  'individual'
) ON CONFLICT DO NOTHING;

-- Step 7: Verification
SELECT 'Chat error fix completed!' as status;
SELECT COUNT(*) as message_count FROM chat_messages;
SELECT user_id, user_name, user_role, is_online FROM user_status ORDER BY user_role, user_name;

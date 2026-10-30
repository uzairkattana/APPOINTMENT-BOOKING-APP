-- Add group chat support to existing chat system

-- Step 1: Add chat_type column if it doesn't exist
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS chat_type VARCHAR(20) DEFAULT 'individual';

-- Step 2: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_type ON chat_messages(chat_type);

-- Step 3: Add some sample group messages
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
  'group',
  'group',
  'Welcome everyone to the team group chat! This is where we can all communicate together.',
  true, 
  true, 
  NOW() - INTERVAL '2 hours', 
  NOW() + INTERVAL '24 hours',
  'group'
),
(
  gen_random_uuid(), 
  'staff-user', 
  'Staff Member', 
  'staff',
  'group',
  'group',
  'Thank you Dr. Bashir! Great to have this group chat feature.',
  true, 
  true, 
  NOW() - INTERVAL '1 hour', 
  NOW() + INTERVAL '24 hours',
  'group'
),
(
  gen_random_uuid(), 
  'staff-user-2', 
  'Dr. Sarah Johnson', 
  'staff',
  'group',
  'group',
  'This will make team coordination much easier!',
  true, 
  true, 
  NOW() - INTERVAL '30 minutes', 
  NOW() + INTERVAL '24 hours',
  'group'
);

-- Step 4: Verification
SELECT 'Group chat support added successfully!' as status;
SELECT COUNT(*) as group_messages FROM chat_messages WHERE chat_type = 'group';
SELECT chat_type, COUNT(*) as message_count FROM chat_messages GROUP BY chat_type;

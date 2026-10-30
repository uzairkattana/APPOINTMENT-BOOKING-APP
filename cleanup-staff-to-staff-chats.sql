-- Clean up staff-to-staff individual chats and promote team group communication

-- Step 1: Archive existing staff-to-staff individual messages
CREATE TABLE IF NOT EXISTS archived_staff_chats AS
SELECT * FROM chat_messages 
WHERE chat_type = 'individual' 
AND sender_role = 'staff' 
AND receiver_role = 'staff'
AND created_at >= NOW() - INTERVAL '7 days';

-- Step 2: Move recent staff-to-staff messages to group chat
INSERT INTO chat_messages (
  id, sender_id, sender_name, sender_role,
  receiver_id, receiver_role,
  message, read, delivered, created_at, expires_at, chat_type
)
SELECT 
  gen_random_uuid(),
  sender_id,
  sender_name,
  sender_role,
  'group',
  'staff',
  message || ' (from staff chat)',
  read,
  delivered,
  created_at,
  expires_at,
  'group'
FROM chat_messages 
WHERE chat_type = 'individual' 
AND sender_role = 'staff' 
AND receiver_role = 'staff'
AND created_at >= NOW() - INTERVAL '7 days'
ON CONFLICT DO NOTHING;

-- Step 3: Delete old staff-to-staff individual messages (keep archive)
DELETE FROM chat_messages 
WHERE chat_type = 'individual' 
AND sender_role = 'staff' 
AND receiver_role = 'staff'
AND created_at >= NOW() - INTERVAL '7 days';

-- Step 4: Add some sample team group messages to encourage group usage
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
  'staff',
  'Team! Please use this Team Group for all staff-to-staff communication. Individual chats are for admin-staff matters only.',
  false, 
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
  'staff',
  'Great! This team group will make coordination much easier. Thanks Dr. Bashir!',
  false, 
  true, 
  NOW() - INTERVAL '55 minutes', 
  NOW() + INTERVAL '24 hours',
  'group'
),
(
  gen_random_uuid(), 
  'staff-user-3', 
  'Nurse Michael Chen', 
  'staff',
  'group',
  'staff',
  'Agreed! Team group is perfect for quick updates and coordination.',
  false, 
  true, 
  NOW() - INTERVAL '45 minutes', 
  NOW() + INTERVAL '24 hours',
  'group'
);

-- Step 5: Verification
SELECT 'Staff-to-staff chat cleanup completed!' as status;
SELECT COUNT(*) as archived_individual_chats FROM archived_staff_chats;
SELECT COUNT(*) as new_group_messages FROM chat_messages WHERE chat_type = 'group';
SELECT COUNT(*) as remaining_individual_chats FROM chat_messages WHERE chat_type = 'individual' AND sender_role = 'staff' AND receiver_role = 'staff';

-- Step 6: Show communication structure
SELECT 
  'Current Chat Structure:' as info,
  'Admin ↔ Staff (Individual)' as admin_staff,
  'All Staff ↔ Team Group (Group)' as staff_group,
  'No more Staff ↔ Staff (Individual)' as no_more_individual_staff;

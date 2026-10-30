-- Add additional staff users for testing staff-to-staff communication

-- Step 1: Insert additional staff users in user_status
INSERT INTO user_status (user_id, user_name, user_role, is_online) VALUES
('staff-user-2', 'Dr. Sarah Johnson', 'staff', true),
('staff-user-3', 'Nurse Michael Chen', 'staff', false),
('staff-user-4', 'Dr. Emily Davis', 'staff', true)
ON CONFLICT (user_id) DO UPDATE SET 
  is_online = EXCLUDED.is_online,
  updated_at = NOW();

-- Step 2: Insert test messages between staff members
INSERT INTO chat_messages (
  sender_id, sender_name, sender_role, 
  receiver_id, receiver_role, 
  message, read, delivered, created_at, expires_at
) VALUES
-- Staff-to-Staff messages
('staff-user', 'Staff Member', 'staff', 'staff-user-2', 'staff', 'Hi Dr. Johnson, can you help with patient assessment?', false, true, NOW() - INTERVAL '2 hours', NOW() + INTERVAL '24 hours'),
('staff-user-2', 'Dr. Sarah Johnson', 'staff', 'staff-user', 'staff', 'Sure! I''ll be right there. Which patient?', true, true, NOW() - INTERVAL '1 hour', NOW() + INTERVAL '24 hours'),
('staff-user-3', 'Nurse Michael Chen', 'staff', 'staff-user-4', 'staff', 'Dr. Davis, the lab results are ready for review', false, true, NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '24 hours'),
('staff-user-4', 'Dr. Emily Davis', 'staff', 'staff-user-3', 'staff', 'Thank you! I''ll check them now', true, true, NOW() - INTERVAL '15 minutes', NOW() + INTERVAL '24 hours'),

-- Admin-to-Staff messages
('admin-user', 'Admin', 'admin', 'staff-user-2', 'staff', 'Dr. Johnson, please review the schedule for tomorrow', false, true, NOW() - INTERVAL '3 hours', NOW() + INTERVAL '24 hours'),
('admin-user', 'Admin', 'admin', 'staff-user-3', 'staff', 'Michael, can you update patient records?', false, true, NOW() - INTERVAL '4 hours', NOW() + INTERVAL '24 hours'),
('admin-user', 'Admin', 'admin', 'staff-user-4', 'staff', 'Dr. Davis, meeting at 3 PM today', false, true, NOW() - INTERVAL '1 hour', NOW() + INTERVAL '24 hours'),

-- Staff-to-Admin messages
('staff-user-2', 'Dr. Sarah Johnson', 'staff', 'admin-user', 'admin', 'Admin, I need the key to room 203', true, true, NOW() - INTERVAL '2 hours', NOW() + INTERVAL '24 hours'),
('staff-user-3', 'Nurse Michael Chen', 'staff', 'admin-user', 'admin', 'Admin, supplies are running low', true, true, NOW() - INTERVAL '1 hour', NOW() + INTERVAL '24 hours'),
('staff-user-4', 'Dr. Emily Davis', 'staff', 'admin-user', 'admin', 'Admin, patient John Doe needs follow-up', false, true, NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '24 hours');

-- Step 3: Verification
SELECT 'Additional staff users and messages added!' as status;
SELECT user_id, user_name, user_role, is_online FROM user_status ORDER BY user_role, user_name;
SELECT COUNT(*) as total_messages FROM chat_messages;
SELECT COUNT(*) as staff_to_staff_messages FROM chat_messages WHERE sender_role = 'staff' AND receiver_role = 'staff';

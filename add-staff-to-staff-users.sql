-- Add additional staff users for staff-to-staff communication testing

-- Step 1: Add more staff users to user_status table
INSERT INTO user_status (user_id, user_name, user_role, is_online, last_seen, updated_at) VALUES
('staff-user-2', 'Dr. Sarah Johnson', 'staff', true, NOW(), NOW()),
('staff-user-3', 'Nurse Michael Chen', 'staff', false, NOW() - INTERVAL '30 minutes', NOW()),
('staff-user-4', 'Dr. Emily Davis', 'staff', true, NOW() - INTERVAL '10 minutes', NOW())
ON CONFLICT (user_id) DO UPDATE SET 
  user_name = EXCLUDED.user_name,
  user_role = EXCLUDED.user_role,
  is_online = EXCLUDED.is_online,
  last_seen = EXCLUDED.last_seen,
  updated_at = EXCLUDED.updated_at;

-- Step 2: Add some sample staff-to-staff messages
INSERT INTO chat_messages (
  id, sender_id, sender_name, sender_role,
  receiver_id, receiver_role,
  message, read, delivered, created_at, expires_at, chat_type
) VALUES
(
  gen_random_uuid(), 
  'staff-user-2', 
  'Dr. Sarah Johnson', 
  'staff',
  'staff-user-3',
  'staff',
  'Hey Michael, can you help me with patient John Doe''s medication schedule?',
  false, 
  true, 
  NOW() - INTERVAL '1 hour', 
  NOW() + INTERVAL '24 hours',
  'individual'
),
(
  gen_random_uuid(), 
  'staff-user-3', 
  'Nurse Michael Chen', 
  'staff',
  'staff-user-2',
  'staff',
  'Sure Dr. Johnson! I''ll check the schedule and get back to you in 5 minutes.',
  false, 
  true, 
  NOW() - INTERVAL '55 minutes', 
  NOW() + INTERVAL '24 hours',
  'individual'
),
(
  gen_random_uuid(), 
  'staff-user-4', 
  'Dr. Emily Davis', 
  'staff',
  'staff-user-2',
  'staff',
  'Sarah, did you review the lab results for the new patient?',
  true, 
  true, 
  NOW() - INTERVAL '30 minutes', 
  NOW() + INTERVAL '24 hours',
  'individual'
),
(
  gen_random_uuid(), 
  'staff-user-2', 
  'Dr. Sarah Johnson', 
  'staff',
  'staff-user-4',
  'staff',
  'Yes Emily, everything looks normal. I''ll send you my notes shortly.',
  false, 
  true, 
  NOW() - INTERVAL '25 minutes', 
  NOW() + INTERVAL '24 hours',
  'individual'
);

-- Step 3: Add some staff-to-admin messages to show normal communication
INSERT INTO chat_messages (
  id, sender_id, sender_name, sender_role,
  receiver_id, receiver_role,
  message, read, delivered, created_at, expires_at, chat_type
) VALUES
(
  gen_random_uuid(), 
  'staff-user-2', 
  'Dr. Sarah Johnson', 
  'staff',
  'admin-user',
  'admin',
  'Dr. Bashir, I need to discuss the treatment plan for patient Mary Smith.',
  false, 
  true, 
  NOW() - INTERVAL '45 minutes', 
  NOW() + INTERVAL '24 hours',
  'individual'
),
(
  gen_random_uuid(), 
  'staff-user-3', 
  'Nurse Michael Chen', 
  'staff',
  'admin-user',
  'admin',
  'Admin, the new medical supplies have arrived and been inventoried.',
  true, 
  true, 
  NOW() - INTERVAL '2 hours', 
  NOW() + INTERVAL '24 hours',
  'individual'
);

-- Step 4: Verification
SELECT 'Staff-to-staff communication setup completed!' as status;
SELECT user_id, user_name, user_role, is_online FROM user_status WHERE user_role = 'staff' ORDER BY user_name;
SELECT COUNT(*) as staff_to_staff_messages FROM chat_messages WHERE chat_type = 'individual' AND sender_role = 'staff' AND receiver_role = 'staff';
SELECT COUNT(*) as staff_to_admin_messages FROM chat_messages WHERE chat_type = 'individual' AND sender_role = 'staff' AND receiver_role = 'admin';

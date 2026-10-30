-- Ensure admin user exists in user_status table for chat functionality

INSERT INTO user_status (user_id, user_name, user_role, is_online, last_seen, updated_at) VALUES
('admin-user', 'Admin', 'admin', false, NOW(), NOW())
ON CONFLICT (user_id) DO UPDATE SET 
  user_name = EXCLUDED.user_name,
  user_role = EXCLUDED.user_role,
  updated_at = EXCLUDED.updated_at;

-- Verification
SELECT 'Admin user ensured in user_status table' as status;
SELECT user_id, user_name, user_role, is_online FROM user_status WHERE user_role = 'admin';

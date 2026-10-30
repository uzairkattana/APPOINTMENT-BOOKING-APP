-- Fix group chat constraints to allow 'group' as receiver role

-- Step 1: Check existing constraints
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'chat_messages'::regclass 
AND contype = 'c';

-- Step 2: Drop the existing receiver_role check constraint if it exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'chat_messages'::regclass 
        AND conname = 'chat_messages_receiver_role_check'
    ) THEN
        ALTER TABLE chat_messages DROP CONSTRAINT chat_messages_receiver_role_check;
        RAISE NOTICE 'Dropped existing receiver_role constraint';
    END IF;
END $$;

-- Step 3: Add new constraint that allows 'admin', 'staff', and 'group' as receiver roles
ALTER TABLE chat_messages 
ADD CONSTRAINT chat_messages_receiver_role_check 
CHECK (receiver_role IN ('admin', 'staff', 'group'));

-- Step 4: Also check and update sender_role constraint if needed
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'chat_messages'::regclass 
        AND conname = 'chat_messages_sender_role_check'
    ) THEN
        ALTER TABLE chat_messages DROP CONSTRAINT chat_messages_sender_role_check;
        RAISE NOTICE 'Dropped existing sender_role constraint';
    END IF;
END $$;

-- Step 5: Add new constraint for sender_role that allows 'admin', 'staff', and 'group'
ALTER TABLE chat_messages 
ADD CONSTRAINT chat_messages_sender_role_check 
CHECK (sender_role IN ('admin', 'staff', 'group'));

-- Step 6: Verification
SELECT 'Group chat constraints updated successfully!' as status;
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'chat_messages'::regclass 
AND contype = 'c'
AND conname LIKE '%role_check%';

-- Step 7: Test insert (this should work now)
DO $$
BEGIN
    INSERT INTO chat_messages (
      id, sender_id, sender_name, sender_role,
      receiver_id, receiver_role,
      message, read, delivered, created_at, expires_at, chat_type
    ) VALUES
    (
      gen_random_uuid(), 
      'test-user', 
      'Test User', 
      'staff',
      'group',
      'group',
      'Test group message after constraint fix',
      false, 
      true, 
      NOW(), 
      NOW() + INTERVAL '24 hours',
      'group'
    );
    
    -- Clean up test message
    DELETE FROM chat_messages WHERE sender_id = 'test-user';
    
    RAISE NOTICE 'Group message test successful!';
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Group message test failed: %', SQLERRM;
END $$;

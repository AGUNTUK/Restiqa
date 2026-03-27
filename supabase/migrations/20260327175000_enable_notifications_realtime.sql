-- Enable Realtime for the notifications table
-- This allows client-side subscriptions to pick up new inserts instantly.

BEGIN;
  -- Add the notifications table to the supabase_realtime publication
  -- Check if it's already there first to be idempotent
  DO $$ 
  BEGIN
    IF NOT EXISTS (
      SELECT 1 
      FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'notifications'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
    END IF;
  END $$;
COMMIT;

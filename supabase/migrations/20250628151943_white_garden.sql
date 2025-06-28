/*
  # Fix user signup trigger function

  This migration fixes the handle_new_user() function to handle cases where
  raw_user_meta_data might be null or missing, which was causing signup failures.

  1. Updates
    - Improve handle_new_user() function to handle null metadata gracefully
    - Add better error handling and logging
    - Ensure the function works even when metadata is missing
*/

-- Drop and recreate the function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into profiles with null checks for metadata
  INSERT INTO profiles (
    id, 
    full_name, 
    avatar_url
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error (this will appear in Supabase logs)
    RAISE LOG 'Error in handle_new_user(): %', SQLERRM;
    -- Re-raise the exception to prevent user creation if profile creation fails
    RAISE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure the trigger exists and is properly configured
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
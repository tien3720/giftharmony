/*
  # Fix profiles table INSERT policy

  1. Security Updates
    - Drop existing INSERT policy that may be using incorrect function
    - Create new INSERT policy using correct auth.uid() function
    - Ensure users can create their own profile during signup

  This fixes the "Database error saving new user" issue during signup.
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create a new INSERT policy with correct auth function
CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
/*
  # Fix user signup trigger

  1. Database Functions
    - Create or replace `handle_new_user()` function to automatically create user profiles
    - Function creates a profile record when a new user signs up

  2. Triggers
    - Ensure trigger exists to call the function on user creation

  3. Security
    - Function runs with security definer to bypass RLS during profile creation
*/

-- Create or replace the function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(
      new.raw_user_meta_data->>'avatar_url',
      'https://ui-avatars.com/api/?name=' || encode(COALESCE(new.raw_user_meta_data->>'full_name', new.email), 'escape') || '&background=49bbbd&color=fff'
    )
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the trigger if it exists and recreate it
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
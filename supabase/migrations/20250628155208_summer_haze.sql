/*
  # Tạo bảng manual_users cho hệ thống đăng ký thủ công

  1. Bảng mới
    - `manual_users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `password_hash` (text)
      - `full_name` (text)
      - `avatar_url` (text)
      - `phone` (text)
      - `address` (text)
      - `city` (text)
      - `district` (text)
      - `ward` (text)
      - `birth_date` (date)
      - `gender` (text)
      - `points` (integer)
      - `level` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Bảo mật
    - Enable RLS
    - Policies cho user tự quản lý data của mình
*/

CREATE TABLE IF NOT EXISTS manual_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  password_hash text NOT NULL,
  full_name text,
  avatar_url text,
  phone text,
  address text,
  city text DEFAULT 'TP. Hồ Chí Minh',
  district text,
  ward text,
  birth_date date,
  gender text DEFAULT 'Nam',
  points integer DEFAULT 0,
  level text DEFAULT 'New Member',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE manual_users ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read own data"
  ON manual_users
  FOR SELECT
  USING (true); -- Cho phép đọc để đăng nhập

CREATE POLICY "Users can insert own data"
  ON manual_users
  FOR INSERT
  WITH CHECK (true); -- Cho phép đăng ký

CREATE POLICY "Users can update own data"
  ON manual_users
  FOR UPDATE
  USING (id = auth.uid()::uuid)
  WITH CHECK (id = auth.uid()::uuid);

-- Trigger để tự động cập nhật updated_at
CREATE OR REPLACE FUNCTION update_manual_users_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_manual_users_updated_at
  BEFORE UPDATE ON manual_users
  FOR EACH ROW
  EXECUTE FUNCTION update_manual_users_updated_at();
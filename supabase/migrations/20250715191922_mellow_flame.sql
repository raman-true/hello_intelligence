\n\n-- Drop all existing policies on officers table\nDROP POLICY IF EXISTS "Admin full access - delete" ON officers
\nDROP POLICY IF EXISTS "Admin full access - insert" ON officers
\nDROP POLICY IF EXISTS "Admin full access - select" ON officers
\nDROP POLICY IF EXISTS "Admin full access - update" ON officers
\nDROP POLICY IF EXISTS "Officers can read own data" ON officers
\nDROP POLICY IF EXISTS "Officers can update own data" ON officers
\n\n-- Create comprehensive admin policies\nCREATE POLICY "Admins can select all officers"\n  ON officers\n  FOR SELECT\n  TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 FROM admin_users \n      WHERE admin_users.id = auth.uid()\n    )\n  )
\n\nCREATE POLICY "Admins can insert officers"\n  ON officers\n  FOR INSERT\n  TO authenticated\n  WITH CHECK (\n    EXISTS (\n      SELECT 1 FROM admin_users \n      WHERE admin_users.id = auth.uid()\n    )\n  )
\n\nCREATE POLICY "Admins can update officers"\n  ON officers\n  FOR UPDATE\n  TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 FROM admin_users \n      WHERE admin_users.id = auth.uid()\n    )\n  )\n  WITH CHECK (\n    EXISTS (\n      SELECT 1 FROM admin_users \n      WHERE admin_users.id = auth.uid()\n    )\n  )
\n\nCREATE POLICY "Admins can delete officers"\n  ON officers\n  FOR DELETE\n  TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 FROM admin_users \n      WHERE admin_users.id = auth.uid()\n    )\n  )
\n\n-- Create officer self-access policies\nCREATE POLICY "Officers can read own profile"\n  ON officers\n  FOR SELECT\n  TO authenticated\n  USING (auth.uid()::text = id::text)
\n\nCREATE POLICY "Officers can update own profile"\n  ON officers\n  FOR UPDATE\n  TO authenticated\n  USING (auth.uid()::text = id::text)\n  WITH CHECK (auth.uid()::text = id::text)
\n\n-- Ensure RLS is enabled\nALTER TABLE officers ENABLE ROW LEVEL SECURITY

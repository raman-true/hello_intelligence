\n\n-- Drop all existing policies for officers table\nDROP POLICY IF EXISTS "Admins can delete officers" ON officers
\nDROP POLICY IF EXISTS "Admins can insert officers" ON officers
\nDROP POLICY IF EXISTS "Admins can select officers" ON officers
\nDROP POLICY IF EXISTS "Admins can update officers" ON officers
\nDROP POLICY IF EXISTS "Officers can read own data" ON officers
\nDROP POLICY IF EXISTS "Officers can update own data" ON officers
\n\n-- Create comprehensive admin policies with full access\nCREATE POLICY "Admin full access - select"\n  ON officers\n  FOR SELECT\n  TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 FROM admin_users \n      WHERE admin_users.id = auth.uid()\n    )\n  )
\n\nCREATE POLICY "Admin full access - insert"\n  ON officers\n  FOR INSERT\n  TO authenticated\n  WITH CHECK (\n    EXISTS (\n      SELECT 1 FROM admin_users \n      WHERE admin_users.id = auth.uid()\n    )\n  )
\n\nCREATE POLICY "Admin full access - update"\n  ON officers\n  FOR UPDATE\n  TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 FROM admin_users \n      WHERE admin_users.id = auth.uid()\n    )\n  )\n  WITH CHECK (\n    EXISTS (\n      SELECT 1 FROM admin_users \n      WHERE admin_users.id = auth.uid()\n    )\n  )
\n\nCREATE POLICY "Admin full access - delete"\n  ON officers\n  FOR DELETE\n  TO authenticated\n  USING (\n    EXISTS (\n      SELECT 1 FROM admin_users \n      WHERE admin_users.id = auth.uid()\n    )\n  )
\n\n-- Maintain officer self-access policies\nCREATE POLICY "Officers can read own data"\n  ON officers\n  FOR SELECT\n  TO authenticated\n  USING (auth.uid()::text = id::text)
\n\nCREATE POLICY "Officers can update own data"\n  ON officers\n  FOR UPDATE\n  TO authenticated\n  USING (auth.uid()::text = id::text)\n  WITH CHECK (auth.uid()::text = id::text)

-- =============================================
-- WilDev Finance — Supabase Database Schema
-- =============================================

-- 1. PROFILES
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  full_name TEXT DEFAULT 'Wildan & Deva',
  avatar_url TEXT,
  currency TEXT DEFAULT 'IDR',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner" ON profiles FOR ALL USING (auth.uid() = id);

-- 2. WALLETS
CREATE TABLE wallets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('cash','bank','ewallet','investment','other')),
  balance DECIMAL(15,2) DEFAULT 0,
  color TEXT DEFAULT '#10B981',
  icon TEXT DEFAULT '💳',
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner" ON wallets FOR ALL USING (auth.uid() = user_id);

-- 3. CATEGORIES
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('income','expense')),
  icon TEXT,
  color TEXT,
  is_default BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner" ON categories FOR ALL USING (auth.uid() = user_id);

-- 4. TRANSACTIONS
CREATE TABLE transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  to_wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  type TEXT CHECK (type IN ('income','expense','transfer')),
  amount DECIMAL(15,2) NOT NULL,
  note TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  receipt_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner" ON transactions FOR ALL USING (auth.uid() = user_id);

-- 5. BUDGETS
CREATE TABLE budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  amount DECIMAL(15,2) NOT NULL,
  period TEXT CHECK (period IN ('monthly','weekly','yearly')) DEFAULT 'monthly',
  month INTEGER CHECK (month BETWEEN 1 AND 12),
  year INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner" ON budgets FOR ALL USING (auth.uid() = user_id);

-- 6. SAVINGS GOALS
CREATE TABLE savings_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  wallet_id UUID REFERENCES wallets(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  target_amount DECIMAL(15,2) NOT NULL,
  current_amount DECIMAL(15,2) DEFAULT 0,
  deadline DATE,
  icon TEXT DEFAULT '🎯',
  color TEXT DEFAULT '#10B981',
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner" ON savings_goals FOR ALL USING (auth.uid() = user_id);

-- 7. NOTIFICATION SETTINGS
CREATE TABLE notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  budget_alert BOOLEAN DEFAULT TRUE,
  budget_threshold INTEGER DEFAULT 80,
  daily_reminder BOOLEAN DEFAULT FALSE,
  reminder_time TIME DEFAULT '20:00',
  goal_alert BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner" ON notification_settings FOR ALL USING (auth.uid() = user_id);

-- 8. RECEIPT SCANS
CREATE TABLE receipt_scans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  image_url TEXT,
  raw_ai_result JSONB,
  merchant_name TEXT,
  total_amount DECIMAL(15,2),
  scan_date TIMESTAMPTZ DEFAULT NOW(),
  confidence TEXT CHECK (confidence IN ('high','medium','low')),
  is_applied BOOLEAN DEFAULT FALSE
);
ALTER TABLE receipt_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner" ON receipt_scans FOR ALL USING (auth.uid() = user_id);

-- =============================================
-- HELPER FUNCTION: Increment wallet balance
-- =============================================
CREATE OR REPLACE FUNCTION increment_wallet_balance(wallet_uuid UUID, amount_val DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE wallets SET balance = balance + amount_val WHERE id = wallet_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- SEED DATA
-- =============================================

-- Profile (run AFTER creating user in Supabase Auth Dashboard)
INSERT INTO profiles (id, full_name, currency)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'wildandeva@wildevfinance.app'),
  'Wildan & Deva',
  'IDR'
);

-- Default Categories
INSERT INTO categories (user_id, name, type, icon, color, is_default) VALUES
  ((SELECT id FROM auth.users WHERE email='wildandeva@wildevfinance.app'),'Gaji','income','💼','#34D399',true),
  ((SELECT id FROM auth.users WHERE email='wildandeva@wildevfinance.app'),'Bonus','income','🎁','#60A5FA',true),
  ((SELECT id FROM auth.users WHERE email='wildandeva@wildevfinance.app'),'Investasi','income','📈','#FBBF24',true),
  ((SELECT id FROM auth.users WHERE email='wildandeva@wildevfinance.app'),'Lainnya','income','💰','#A78BFA',true),
  ((SELECT id FROM auth.users WHERE email='wildandeva@wildevfinance.app'),'Makanan & Minuman','expense','🍜','#F87171',true),
  ((SELECT id FROM auth.users WHERE email='wildandeva@wildevfinance.app'),'Belanja','expense','🛍️','#FB923C',true),
  ((SELECT id FROM auth.users WHERE email='wildandeva@wildevfinance.app'),'Transportasi','expense','🚗','#FBBF24',true),
  ((SELECT id FROM auth.users WHERE email='wildandeva@wildevfinance.app'),'Kesehatan','expense','🏥','#34D399',true),
  ((SELECT id FROM auth.users WHERE email='wildandeva@wildevfinance.app'),'Hiburan','expense','🎬','#60A5FA',true),
  ((SELECT id FROM auth.users WHERE email='wildandeva@wildevfinance.app'),'Tagihan','expense','📱','#A78BFA',true),
  ((SELECT id FROM auth.users WHERE email='wildandeva@wildevfinance.app'),'Pendidikan','expense','📚','#F472B6',true),
  ((SELECT id FROM auth.users WHERE email='wildandeva@wildevfinance.app'),'Lainnya','expense','💸','#64748B',true);

-- Default Notification Settings
INSERT INTO notification_settings (user_id)
VALUES ((SELECT id FROM auth.users WHERE email='wildandeva@wildevfinance.app'));

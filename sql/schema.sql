-- ===========================================
-- Personal Finance Tracker - Database Schema
-- ===========================================

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_categories_type ON categories(user_id, type);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_date ON transactions(user_id, date);
CREATE INDEX idx_transactions_type ON transactions(user_id, type);
CREATE INDEX idx_transactions_month ON transactions(user_id, (EXTRACT(YEAR FROM date)), (EXTRACT(MONTH FROM date)));

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    opening_balance NUMERIC(12,2) DEFAULT 0,
    budget_percentage NUMERIC(5,2) DEFAULT 50 CHECK (budget_percentage >= 0 AND budget_percentage <= 100),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_settings_user_id ON settings(user_id);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

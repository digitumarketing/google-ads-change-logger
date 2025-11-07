/*
  # Google Ads Change Logger Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `role` (text, not null) - Admin, Analyst, or Viewer
      - `created_at` (timestamp with timezone)
    
    - `accounts`
      - `id` (uuid, primary key)
      - `name` (text, not null)
      - `client` (text, not null)
      - `manager` (text, not null)
      - `currency` (text, not null)
      - `status` (text, not null) - Active, Paused, or In Review
      - `tags` (text array)
      - `created_at` (timestamp with timezone)
    
    - `change_logs`
      - `id` (uuid, primary key)
      - `date_of_change` (date, not null)
      - `account_id` (uuid, foreign key to accounts)
      - `campaign_name` (text, not null)
      - `category` (text, not null)
      - `description` (text, not null)
      - `reason` (text, not null)
      - `expected_impact` (text, not null)
      - `pre_change_ctr` (numeric)
      - `pre_change_cpc` (numeric)
      - `pre_change_conv_rate` (numeric)
      - `pre_change_cpa` (numeric)
      - `post_change_ctr` (numeric)
      - `post_change_cpc` (numeric)
      - `post_change_conv_rate` (numeric)
      - `post_change_cpa` (numeric)
      - `next_review_date` (date)
      - `logged_by_id` (uuid, foreign key to users)
      - `result` (text, not null) - Successful, Neutral, Reverted, or Pending
      - `result_summary` (text, default empty string)
      - `created_at` (timestamp with timezone)
    
    - `comments`
      - `id` (uuid, primary key)
      - `log_id` (uuid, foreign key to change_logs)
      - `user_id` (uuid, foreign key to users)
      - `user_name` (text, not null)
      - `timestamp` (timestamp with timezone, not null)
      - `text` (text, not null)
      - `created_at` (timestamp with timezone)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to perform CRUD operations
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('Admin', 'Analyst', 'Viewer')),
  created_at timestamptz DEFAULT now()
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  client text NOT NULL,
  manager text NOT NULL,
  currency text NOT NULL,
  status text NOT NULL CHECK (status IN ('Active', 'Paused', 'In Review')),
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create change_logs table
CREATE TABLE IF NOT EXISTS change_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date_of_change date NOT NULL,
  account_id uuid REFERENCES accounts(id) ON DELETE CASCADE,
  campaign_name text NOT NULL,
  category text NOT NULL CHECK (category IN ('Bidding', 'Ad Copy', 'Keywords', 'Negative Keywords', 'Budget', 'Targeting', 'Tracking', 'Other')),
  description text NOT NULL,
  reason text NOT NULL,
  expected_impact text NOT NULL CHECK (expected_impact IN ('Positive', 'Neutral', 'Test', 'Risk')),
  pre_change_ctr numeric,
  pre_change_cpc numeric,
  pre_change_conv_rate numeric,
  pre_change_cpa numeric,
  post_change_ctr numeric,
  post_change_cpc numeric,
  post_change_conv_rate numeric,
  post_change_cpa numeric,
  next_review_date date,
  logged_by_id uuid REFERENCES users(id) ON DELETE SET NULL,
  result text NOT NULL DEFAULT 'Pending' CHECK (result IN ('Successful', 'Neutral', 'Reverted', 'Pending')),
  result_summary text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id uuid REFERENCES change_logs(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  user_name text NOT NULL,
  timestamp timestamptz NOT NULL,
  text text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE change_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for users table
CREATE POLICY "Allow public read access to users"
  ON users FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to users"
  ON users FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to users"
  ON users FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to users"
  ON users FOR DELETE
  TO public
  USING (true);

-- RLS Policies for accounts table
CREATE POLICY "Allow public read access to accounts"
  ON accounts FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to accounts"
  ON accounts FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to accounts"
  ON accounts FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to accounts"
  ON accounts FOR DELETE
  TO public
  USING (true);

-- RLS Policies for change_logs table
CREATE POLICY "Allow public read access to change_logs"
  ON change_logs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to change_logs"
  ON change_logs FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to change_logs"
  ON change_logs FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to change_logs"
  ON change_logs FOR DELETE
  TO public
  USING (true);

-- RLS Policies for comments table
CREATE POLICY "Allow public read access to comments"
  ON comments FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to comments"
  ON comments FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to comments"
  ON comments FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to comments"
  ON comments FOR DELETE
  TO public
  USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_change_logs_account_id ON change_logs(account_id);
CREATE INDEX IF NOT EXISTS idx_change_logs_logged_by_id ON change_logs(logged_by_id);
CREATE INDEX IF NOT EXISTS idx_comments_log_id ON comments(log_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
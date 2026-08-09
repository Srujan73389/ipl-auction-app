-- Create core tables for IPL auction app
CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT,
  light TEXT,
  emoji TEXT,
  budget NUMERIC(10,2) DEFAULT 100
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL,
  team_id TEXT,
  name TEXT
);

CREATE TABLE IF NOT EXISTS players (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  country TEXT,
  base_price NUMERIC(10,2),
  data JSONB
);

CREATE TABLE IF NOT EXISTS bids (
  id SERIAL PRIMARY KEY,
  player_id INT,
  team_id TEXT,
  amount NUMERIC(10,2),
  ts TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sold_players (
  id SERIAL PRIMARY KEY,
  player_id INT,
  sold_to TEXT,
  sold_price NUMERIC(10,2),
  sold_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auction_state (
  key TEXT PRIMARY KEY,
  value JSONB
);

-- Users table for TailorApply MVP
-- Simple user management with GitHub auth, subscription tracking, and token system

CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    github_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    image_url TEXT,
    is_premium BOOLEAN DEFAULT FALSE,
    subscription_expires TIMESTAMP WITH TIME ZONE,
    stripe_customer_id VARCHAR(255) UNIQUE,
    tokens_remaining INTEGER DEFAULT 100 CHECK (tokens_remaining >= 0),
    tokens_used_total INTEGER DEFAULT 0 CHECK (tokens_used_total >= 0),
    tokens_purchased_total INTEGER DEFAULT 0 CHECK (tokens_purchased_total >= 0),
    last_token_refill_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    github_username VARCHAR(100),
    github_profile_url TEXT,
    total_resumes_tailored INTEGER DEFAULT 0,
    total_api_calls INTEGER DEFAULT 0,
    last_activity_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT token_balance_valid CHECK (tokens_used_total <= tokens_purchased_total + 100)
);

CREATE INDEX idx_users_email ON users(email);
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    subscription_expires TIMESTAMP WITH TIME ZONE,
    stripe_customer_id VARCHAR(255) UNIQUE,
    stripe_subscription_id VARCHAR(255) UNIQUE, -- NEW: Required for subscription operations
    subscription_status VARCHAR(50) DEFAULT 'inactive', -- NEW: active, canceled, past_due, etc.
    subscription_plan_id VARCHAR(255),
    subscription_current_period_start TIMESTAMP WITH TIME ZONE,
    subscription_current_period_end TIMESTAMP WITH TIME ZONE,
    tokens_remaining INTEGER,
    tokens_used_total INTEGER,
    tokens_purchased_total INTEGER,
    last_token_refill_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
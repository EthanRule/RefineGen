-- Transactions table for TailorApply MVP
-- Simple payment tracking for token purchases via Stripe

CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL,
    tokens_purchased INTEGER DEFAULT 0,
    stripe_payment_intent_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
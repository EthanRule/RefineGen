-- Resumes table for TailorApply MVP
-- Simple file storage for uploaded resumes with parsed content

CREATE TABLE resumes (
    resume_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    parsed_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE tailoring_sessions (
    session_id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    resume_id INTEGER NOT NULL REFERENCES resumes(resume_id) ON DELETE CASCADE,
    job_description TEXT NOT NULL,
    tailored_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
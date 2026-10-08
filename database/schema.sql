-- CareerOS PostgreSQL / SQLite Schema

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL DEFAULT 'Rudra Padhy',
    email VARCHAR(255) UNIQUE NOT NULL DEFAULT 'rudra@example.com',
    hashed_password VARCHAR(255),
    role VARCHAR(50) DEFAULT 'student',
    degree VARCHAR(100) DEFAULT 'B.Tech CSE',
    semester VARCHAR(50) DEFAULT 'Semester 3',
    target_role VARCHAR(100) DEFAULT 'AI/ML Engineer',
    learning_xp INTEGER DEFAULT 4250,
    skill_confidence INTEGER DEFAULT 78,
    career_readiness INTEGER DEFAULT 72,
    streak_days INTEGER DEFAULT 12,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS skills (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    progress_percentage INTEGER DEFAULT 0,
    confidence VARCHAR(20) DEFAULT '0%',
    evidence VARCHAR(255) DEFAULT 'Coursework',
    status VARCHAR(50) DEFAULT 'Developing'
);

CREATE TABLE IF NOT EXISTS challenges (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    difficulty VARCHAR(50) DEFAULT 'Easy',
    xp_reward INTEGER DEFAULT 100,
    description TEXT,
    status VARCHAR(50) DEFAULT 'Active'
);

CREATE TABLE IF NOT EXISTS career_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    ats_readiness INTEGER DEFAULT 84,
    resume_skills TEXT DEFAULT 'Python, Git, DSA, React',
    github_evidence TEXT DEFAULT '5 Python repos • 2 React repos • Good documentation',
    github_strength VARCHAR(50) DEFAULT 'High',
    gap_priorities JSONB,
    roadmap_steps JSONB
);

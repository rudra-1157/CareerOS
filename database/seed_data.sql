-- CareerOS Initial Demo Seed Data

INSERT INTO users (id, name, email, role, degree, semester, target_role, learning_xp, skill_confidence, career_readiness, streak_days)
VALUES (1, 'Rudra Padhy', 'rudra@example.com', 'student', 'B.Tech CSE', 'Semester 3', 'AI/ML Engineer', 4250, 78, 72, 12)
ON CONFLICT (id) DO NOTHING;

INSERT INTO skills (user_id, name, progress_percentage, confidence, evidence, status)
VALUES 
(1, 'Python', 88, '88%', 'Coding • GitHub • Projects', 'Verified'),
(1, 'Git & GitHub', 82, '82%', 'Repositories • Activity', 'Verified'),
(1, 'DSA', 68, '68%', 'Coding Challenges', 'Developing'),
(1, 'Machine Learning', 52, '52%', 'Limited project evidence', 'Needs Work');

INSERT INTO challenges (id, title, difficulty, xp_reward, description, status)
VALUES (1, 'Two Sum', 'Easy', 100, 'Find two indices whose values add up to a target.', 'Active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO career_profiles (id, user_id, ats_readiness, resume_skills, github_evidence, github_strength)
VALUES (1, 1, 84, 'Python, Git, DSA, React', '5 Python repos • 2 React repos • Good documentation', 'High')
ON CONFLICT (id) DO NOTHING;

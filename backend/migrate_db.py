import sqlite3
from app.database import engine, Base
import app.models  # ensure all models are imported

# Re-create tables if missing
Base.metadata.create_all(bind=engine)

conn = sqlite3.connect('careeros.db')
cursor = conn.cursor()

def add_col(table, col, col_type):
    try:
        cursor.execute(f"ALTER TABLE {table} ADD COLUMN {col} {col_type}")
        print(f"Added {col} to {table}")
    except Exception as e:
        print(f"Skipped {table}.{col}: {e}")

add_col('users', 'learning_xp', 'INTEGER DEFAULT 0')
add_col('users', 'streak_days', 'INTEGER DEFAULT 0')

add_col('github_profiles', 'user_id', 'INTEGER')
add_col('github_profiles', 'avatar_url', 'TEXT')
add_col('github_profiles', 'bio', 'TEXT')
add_col('github_profiles', 'public_repos', 'INTEGER DEFAULT 0')
add_col('github_profiles', 'total_stars', 'INTEGER DEFAULT 0')
add_col('github_profiles', 'github_score', 'INTEGER DEFAULT 50')
add_col('github_profiles', 'evidence_strength', 'TEXT DEFAULT "Developing"')
add_col('github_profiles', 'languages', 'JSON')
add_col('github_profiles', 'top_repositories', 'JSON')

add_col('resumes', 'user_id', 'INTEGER')
add_col('resumes', 'file_name', 'TEXT')
add_col('resumes', 'raw_text', 'TEXT')
add_col('resumes', 'ats_score', 'INTEGER')
add_col('resumes', 'match_rating', 'TEXT')
add_col('resumes', 'detected_skills', 'JSON')
add_col('resumes', 'strengths', 'JSON')
add_col('resumes', 'weaknesses', 'JSON')
add_col('resumes', 'suggestions', 'JSON')
add_col('resumes', 'uploaded_at', 'DATETIME')

add_col('projects', 'user_id', 'INTEGER')
add_col('projects', 'category', 'TEXT DEFAULT "Full-Stack Dev"')
add_col('projects', 'tech_stack', 'JSON')
add_col('projects', 'github_url', 'TEXT')
add_col('projects', 'demo_url', 'TEXT')
add_col('projects', 'verified_status', 'TEXT DEFAULT "Pending Review"')
add_col('projects', 'verified_by', 'TEXT')
add_col('projects', 'evidence_score', 'TEXT DEFAULT "80/100"')
add_col('projects', 'metrics', 'TEXT')
add_col('projects', 'created_at', 'DATETIME')

add_col('skills', 'user_id', 'INTEGER')
add_col('skills', 'percentage', 'INTEGER DEFAULT 50')
add_col('skills', 'status', 'TEXT DEFAULT "Developing"')
add_col('skills', 'evidence', 'TEXT')

add_col('coding_submissions', 'user_id', 'INTEGER')
add_col('coding_submissions', 'challenge_id', 'TEXT')
add_col('coding_submissions', 'challenge_title', 'TEXT')
add_col('coding_submissions', 'status', 'TEXT DEFAULT "Pending"')
add_col('coding_submissions', 'runtime', 'TEXT')
add_col('coding_submissions', 'memory', 'TEXT')
add_col('coding_submissions', 'xp_awarded', 'INTEGER DEFAULT 0')
add_col('coding_submissions', 'submitted_at', 'DATETIME')

conn.commit()
conn.close()
print("Database schema updated successfully!")

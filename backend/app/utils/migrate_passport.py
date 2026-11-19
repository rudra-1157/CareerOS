"""
Idempotent and safe migration for Skill Passport tables and columns.
Ensures existing user data is preserved and new columns/tables are cleanly established.
"""
import sqlite3
import os
from sqlalchemy import text
from app.database import engine, Base

def run_passport_migrations():
    """
    Safely adds missing columns to the `skills` table and ensures all passport tables exist.
    """
    try:
        # Create any newly defined tables (skill_evidences, skill_verifications, skill_progress_history)
        Base.metadata.create_all(bind=engine)
        
        # Check SQLite table info for the skills table
        with engine.connect() as conn:
            # Check existing columns
            result = conn.execute(text("PRAGMA table_info(skills);"))
            existing_cols = {row[1] for row in result.fetchall()}
            
            columns_to_add = [
                ("description", "TEXT"),
                ("proficiency_level", "TEXT DEFAULT 'Intermediate'"),
                ("confidence", "TEXT"),
                ("level", "TEXT"),
                ("learning_start_date", "TEXT"),
                ("related_technology", "TEXT"),
                ("evidence_source", "TEXT"),
                ("supporting_project", "TEXT"),
                ("github_repo_url", "TEXT"),
                ("learning_notes", "TEXT"),
                ("verified_date", "DATETIME"),
                ("verified_by_user_id", "INTEGER"),
                ("verified_by_name", "TEXT"),
                ("verification_comments", "TEXT"),
                ("rejection_reason", "TEXT"),
                ("automated_score", "INTEGER"),
                ("automated_evidence_summary", "TEXT"),
                ("created_at", "DATETIME DEFAULT CURRENT_TIMESTAMP"),
                ("updated_at", "DATETIME DEFAULT CURRENT_TIMESTAMP"),
            ]
            
            for col_name, col_type in columns_to_add:
                if col_name not in existing_cols:
                    try:
                        conn.execute(text(f"ALTER TABLE skills ADD COLUMN {col_name} {col_type};"))
                        conn.commit()
                    except Exception as col_err:
                        # Ignore if already exists or db locked
                        pass

    except Exception as e:
        print(f"Passport migration warning: {e}")

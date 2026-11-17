"""
CareerOS Database Migration v2
Adds tables and columns for:
- Profile picture & external handles (avatar_url, codeforces_handle, theme_preference, is_demo)
- Friendships & Friend Requests (friendships table)
- Challenge Battles & 1v1 Rooms (coding_battles, battle_submissions tables)
- Rich In-App Notifications (type, title, link, is_read columns)
Safe & idempotent: checks if columns/tables exist before creating.
"""
import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "careeros.db")

def migrate():
    print(f"Connecting to {DB_PATH}...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    def get_columns(table_name):
        try:
            cursor.execute(f"PRAGMA table_info({table_name});")
            return [row[1] for row in cursor.fetchall()]
        except sqlite3.OperationalError:
            return []

    # 1. Update student_profiles columns
    sp_cols = get_columns("student_profiles")
    if "avatar_url" not in sp_cols:
        cursor.execute("ALTER TABLE student_profiles ADD COLUMN avatar_url TEXT;")
        print("Added avatar_url to student_profiles")
    if "codeforces_handle" not in sp_cols:
        cursor.execute("ALTER TABLE student_profiles ADD COLUMN codeforces_handle TEXT;")
        print("Added codeforces_handle to student_profiles")
    if "theme_preference" not in sp_cols:
        cursor.execute("ALTER TABLE student_profiles ADD COLUMN theme_preference TEXT DEFAULT 'teal-aqua';")
        print("Added theme_preference to student_profiles")
    if "is_demo" not in sp_cols:
        cursor.execute("ALTER TABLE student_profiles ADD COLUMN is_demo BOOLEAN DEFAULT 0;")
        print("Added is_demo to student_profiles")
    if "privacy_settings" not in sp_cols:
        cursor.execute("ALTER TABLE student_profiles ADD COLUMN privacy_settings TEXT DEFAULT '{\"public_stats\":true,\"show_activity\":true}';")
        print("Added privacy_settings to student_profiles")

    # 2. Update users columns
    u_cols = get_columns("users")
    if "is_demo" not in u_cols:
        cursor.execute("ALTER TABLE users ADD COLUMN is_demo BOOLEAN DEFAULT 0;")
        print("Added is_demo to users")
    if "avatar_url" not in u_cols:
        cursor.execute("ALTER TABLE users ADD COLUMN avatar_url TEXT;")
        print("Added avatar_url to users")

    # 3. Update notifications columns
    notif_cols = get_columns("notifications")
    if "type" not in notif_cols:
        cursor.execute("ALTER TABLE notifications ADD COLUMN type TEXT DEFAULT 'general';")
        print("Added type to notifications")
    if "title" not in notif_cols:
        cursor.execute("ALTER TABLE notifications ADD COLUMN title TEXT DEFAULT 'Notification';")
        print("Added title to notifications")
    if "link" not in notif_cols:
        cursor.execute("ALTER TABLE notifications ADD COLUMN link TEXT;")
        print("Added link to notifications")
    if "is_read" not in notif_cols:
        cursor.execute("ALTER TABLE notifications ADD COLUMN is_read BOOLEAN DEFAULT 0;")
        print("Added is_read to notifications")

    # 4. Create friendships table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS friendships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        friend_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'accepted',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, friend_id)
    );
    """)
    print("Checked friendships table")

    # 5. Create coding_battles table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS coding_battles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        room_code TEXT UNIQUE NOT NULL,
        creator_id INTEGER NOT NULL,
        opponent_id INTEGER,
        challenge_id TEXT,
        challenge_title TEXT,
        category TEXT DEFAULT 'Algorithms',
        difficulty TEXT DEFAULT 'Medium',
        language TEXT DEFAULT 'python',
        duration_mins INTEGER DEFAULT 30,
        status TEXT DEFAULT 'lobby',
        creator_ready BOOLEAN DEFAULT 0,
        opponent_ready BOOLEAN DEFAULT 0,
        winner_id INTEGER,
        creator_score INTEGER DEFAULT 0,
        opponent_score INTEGER DEFAULT 0,
        started_at DATETIME,
        ended_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)
    print("Checked coding_battles table")

    # 6. Create battle_submissions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS battle_submissions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        battle_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        code TEXT NOT NULL,
        language TEXT NOT NULL,
        tests_passed INTEGER DEFAULT 0,
        total_tests INTEGER DEFAULT 0,
        runtime_ms REAL DEFAULT 0,
        status TEXT DEFAULT 'Submitted',
        submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)
    print("Checked battle_submissions table")

    conn.commit()
    conn.close()
    print("Migration v2 completed successfully!")

if __name__ == "__main__":
    migrate()

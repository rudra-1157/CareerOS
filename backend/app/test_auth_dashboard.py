"""
Comprehensive Phase 2 verification tests for CareerOS backend.
Tests: Registration, Authentication, Dashboard calculations,
       Data isolation, Persistence, and Security.
"""
import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000/api/v1"
results = {"passed": 0, "failed": 0, "details": []}

def test(name, passed, detail=""):
    status = "PASS" if passed else "FAIL"
    results["passed" if passed else "failed"] += 1
    results["details"].append({"name": name, "status": status, "detail": detail})
    print(f"  {'[PASS]' if passed else '[FAIL]'} {name}" + (f" -- {detail}" if detail else ""))


# ============================================================
# 1. NEW USER REGISTRATION
# ============================================================
print("\n=== 1. New User Registration ===")

resp = requests.post(f"{BASE_URL}/auth/register", json={
    "name": "Alice Test",
    "email": "alice_test@careeros.dev",
    "password": "securePass1!",
    "role": "STUDENT"
})
test("Register student returns 200", resp.status_code == 200, f"status={resp.status_code}")
if resp.status_code == 200:
    reg_data = resp.json()
    test("Register returns user id", "id" in reg_data)
    test("Register stores correct name", reg_data.get("name") == "Alice Test")
    test("Register stores correct email", reg_data.get("email") == "alice_test@careeros.dev")
    test("Register stores correct role", reg_data.get("role") == "STUDENT")
    test("No fabricated bio in response", reg_data.get("bio") in [None, ""])
    test("No fabricated university in response", reg_data.get("university") in [None, ""])

# Duplicate email rejected
resp_dup = requests.post(f"{BASE_URL}/auth/register", json={
    "name": "Alice Dup", "email": "alice_test@careeros.dev", "password": "x", "role": "STUDENT"
})
test("Duplicate email rejected", resp_dup.status_code == 400)


# ============================================================
# 2. AUTHENTICATION
# ============================================================
print("\n=== 2. Authentication ===")

# Correct login
resp_login = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "alice_test@careeros.dev", "password": "securePass1!"
})
test("Login with correct creds returns 200", resp_login.status_code == 200)
token_alice = resp_login.json().get("access_token") if resp_login.status_code == 200 else None
test("Login returns access_token", token_alice is not None)
test("Login returns token_type bearer", resp_login.json().get("token_type") == "bearer" if resp_login.status_code == 200 else False)

# Wrong password
resp_wrong = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "alice_test@careeros.dev", "password": "WRONG"
})
test("Wrong password returns 401", resp_wrong.status_code == 401)

# Non-existent user
resp_nouser = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "nonexistent@careeros.dev", "password": "anything"
})
test("Non-existent user returns 401", resp_nouser.status_code == 401)

# Invalid token
resp_badtoken = requests.get(f"{BASE_URL}/student/dashboard",
    headers={"Authorization": "Bearer totallyinvalidtoken"})
test("Invalid token returns 401", resp_badtoken.status_code == 401)

# Missing token
resp_notoken = requests.get(f"{BASE_URL}/student/dashboard")
test("Missing token returns 401", resp_notoken.status_code in [401, 403])

# /auth/me
if token_alice:
    resp_me = requests.get(f"{BASE_URL}/auth/me",
        headers={"Authorization": f"Bearer {token_alice}"})
    test("/auth/me returns 200", resp_me.status_code == 200)
    if resp_me.status_code == 200:
        me = resp_me.json()
        test("/auth/me returns correct email", me.get("email") == "alice_test@careeros.dev")


# ============================================================
# 3. DASHBOARD CALCULATIONS (Empty user)
# ============================================================
print("\n=== 3. Dashboard Calculations (Empty User) ===")

if token_alice:
    headers_a = {"Authorization": f"Bearer {token_alice}"}
    resp_dash = requests.get(f"{BASE_URL}/student/dashboard", headers=headers_a)
    test("Dashboard returns 200", resp_dash.status_code == 200)

    if resp_dash.status_code == 200:
        d = resp_dash.json()
        student = d.get("student", {})
        stats = d.get("stats", {})
        skills = d.get("skills", [])
        activity = d.get("recent_activity", [])
        journey = d.get("journey_steps", [])
        recs = d.get("ai_recommendations", {})

        # Student fields should be empty, not fabricated
        test("Name matches registered name", student.get("name") == "Alice Test")
        test("Email matches registered email", student.get("email") == "alice_test@careeros.dev")
        test("University is empty string", student.get("university") == "")
        test("Degree is empty string", student.get("degree") == "")
        test("Semester is empty string", student.get("semester") == "")
        test("Department is empty string", student.get("department") == "")
        test("Target role is empty string", student.get("target_role") == "")
        test("Bio is empty string", student.get("bio") == "")
        test("GitHub username is empty string", student.get("github_username") == "")
        test("Resume name is null", student.get("resume_name") is None)
        test("Resume ATS score is null", student.get("resume_ats_score") is None)

        # Stats should all be zero/empty
        test("Learning XP is 0", stats.get("learning_xp") == 0)
        test("Skill confidence is 0%", stats.get("skill_confidence") == "0%")
        test("Career readiness is 0%", stats.get("career_readiness") == "0%")
        test("Coding score is 0%", stats.get("coding_score") == "0%")
        test("Verified projects is 0", stats.get("verified_projects") == 0)

        # Skills list should be empty
        test("Skills list is empty", len(skills) == 0)

        # Recent activity should be empty
        test("Recent activity is empty", len(activity) == 0)

        # AI recommendations should suggest setting career goal
        test("AI rec suggests setting goal", "Set Your Career Goal" in recs.get("headline", ""),
             recs.get("headline", ""))

        # Profile completion should be 30 (base 20 + name+email 10)
        test("Profile completion is 30%", student.get("profile_completion") == 30,
             f"actual={student.get('profile_completion')}")


# ============================================================
# 4. DATA ISOLATION
# ============================================================
print("\n=== 4. Data Isolation ===")

# Register Bob
requests.post(f"{BASE_URL}/auth/register", json={
    "name": "Bob Test", "email": "bob_test@careeros.dev",
    "password": "bobPass1!", "role": "STUDENT"
})
resp_bob = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "bob_test@careeros.dev", "password": "bobPass1!"
})
token_bob = resp_bob.json().get("access_token") if resp_bob.status_code == 200 else None
headers_b = {"Authorization": f"Bearer {token_bob}"} if token_bob else {}

# Update Bob's profile
if token_bob:
    requests.put(f"{BASE_URL}/student/profile", json={
        "university": "Stanford University",
        "career_goal": "ML Engineer",
        "bio": "Bob's bio"
    }, headers=headers_b)

    # Bob sees his own data
    bob_dash = requests.get(f"{BASE_URL}/student/dashboard", headers=headers_b).json()
    test("Bob sees his own university", bob_dash["student"]["university"] == "Stanford University")
    test("Bob sees his own career goal", bob_dash["student"]["target_role"] == "ML Engineer")

    # Alice does NOT see Bob's data
    if token_alice:
        alice_dash = requests.get(f"{BASE_URL}/student/dashboard", headers=headers_a).json()
        test("Alice does NOT see Bob's university",
             alice_dash["student"]["university"] != "Stanford University",
             f"alice_uni={alice_dash['student']['university']}")
        test("Alice does NOT see Bob's career goal",
             alice_dash["student"]["target_role"] != "ML Engineer")


# ============================================================
# 5. PERSISTENCE
# ============================================================
print("\n=== 5. Database Persistence ===")

if token_alice:
    # Update Alice's profile
    requests.put(f"{BASE_URL}/student/profile", json={
        "university": "IIT Bhubaneswar",
        "career_goal": "AI/ML Engineer",
        "bio": "Passionate about AI"
    }, headers=headers_a)

    # Re-login and check
    resp_relogin = requests.post(f"{BASE_URL}/auth/login", json={
        "email": "alice_test@careeros.dev", "password": "securePass1!"
    })
    new_token = resp_relogin.json().get("access_token")
    new_headers = {"Authorization": f"Bearer {new_token}"}
    alice_dash2 = requests.get(f"{BASE_URL}/student/dashboard", headers=new_headers).json()

    test("Profile persists after re-login: university",
         alice_dash2["student"]["university"] == "IIT Bhubaneswar")
    test("Profile persists after re-login: career_goal",
         alice_dash2["student"]["target_role"] == "AI/ML Engineer")
    test("Profile persists after re-login: bio",
         alice_dash2["student"]["bio"] == "Passionate about AI")

    # Check updated profile completion (base 20 + name/email 10 + bio 10 + career_goal 15 = 55)
    test("Profile completion updated to 55",
         alice_dash2["student"]["profile_completion"] == 55,
         f"actual={alice_dash2['student']['profile_completion']}")

    # Check stats now reflect target role
    test("Career subtitle reflects target role",
         "AI/ML Engineer" in alice_dash2["stats"]["career_subtitle"],
         alice_dash2["stats"]["career_subtitle"])
    test("AI rec headline reflects target role",
         "AI/ML Engineer" in alice_dash2["ai_recommendations"]["headline"],
         alice_dash2["ai_recommendations"]["headline"])


# ============================================================
# 6. ROLE ENFORCEMENT
# ============================================================
print("\n=== 6. Role Enforcement ===")

# Register a faculty user
requests.post(f"{BASE_URL}/auth/register", json={
    "name": "Prof Faculty", "email": "faculty_test@careeros.dev",
    "password": "facPass1!", "role": "FACULTY"
})
resp_fac = requests.post(f"{BASE_URL}/auth/login", json={
    "email": "faculty_test@careeros.dev", "password": "facPass1!"
})
if resp_fac.status_code == 200:
    token_fac = resp_fac.json().get("access_token")
    # Faculty should NOT access student dashboard
    resp_fac_dash = requests.get(f"{BASE_URL}/student/dashboard",
        headers={"Authorization": f"Bearer {token_fac}"})
    test("Faculty cannot access student dashboard", resp_fac_dash.status_code == 403,
         f"status={resp_fac_dash.status_code}")


# ============================================================
# SUMMARY
# ============================================================
print(f"\n{'='*60}")
print(f"RESULTS: {results['passed']} passed, {results['failed']} failed")
print(f"{'='*60}")

if results["failed"] > 0:
    print("\nFailed tests:")
    for t in results["details"]:
        if t["status"] == "FAIL":
            print(f"  - {t['name']}: {t['detail']}")

sys.exit(0 if results["failed"] == 0 else 1)

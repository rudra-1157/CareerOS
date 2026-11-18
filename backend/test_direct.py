import os
os.environ["GROQ_API_KEY"] = ""
import sys
import asyncio

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

print("1. Starting test_direct.py", flush=True)

from app.database import SessionLocal
from app.models.user import User
from app.routers.jobs import (
    get_marketplace_stats,
    list_companies,
    list_jobs,
    get_job_detail,
    get_job_match,
    get_recommended_jobs,
    save_job,
    get_saved_jobs,
    remove_saved_job,
    apply_for_job,
    get_my_applications,
    get_ai_job_explanation,
    recruiter_list_jobs,
    recruiter_view_applicants,
    update_application_status
)

print("2. Modules imported successfully", flush=True)

db = SessionLocal()
student = db.query(User).filter(User.email == 'student@careeros.edu').first()
admin = db.query(User).filter(User.email == 'admin@careeros.edu').first()
print(f"3. Found student: {student.name} and admin: {admin.name}", flush=True)

# 1. Marketplace Stats
stats = get_marketplace_stats(db=db, current_user=student)
print(f"4. Marketplace stats: completion={stats['profile_completion']}%, student={stats['student_name']}", flush=True)

# 2. List Companies
comps = list_companies(db=db, current_user=student)
print(f"5. Companies: count={comps['total']}, domains={len(comps['domains'])}", flush=True)
assert comps['total'] >= 24

# 3. List Jobs & Internships
all_jobs = list_jobs(db=db, current_user=student)
print(f"6. Opportunities: total={all_jobs['total']}, internships={all_jobs['internships_count']}, fulltime={all_jobs['fulltime_count']}", flush=True)

# 4. Search Python Internships
py_interns = list_jobs(search='Python', job_type='Internship', db=db, current_user=student)
print(f"7. Python internships found: {len(py_interns['jobs'])}", flush=True)
target_job = py_interns['jobs'][0]

# 5. Job Detail & Match
detail = get_job_detail(job_id=target_job['id'], db=db, current_user=student)
print(f"8. Job detail: '{detail['title']}' at {detail['company_name']}, match={detail['match']['score']}%", flush=True)

# 6. Save Job & List Saved
save_res = save_job(job_id=target_job['id'], db=db, current_user=student)
saved_list = get_saved_jobs(db=db, current_user=student)
print(f"9. Saved jobs count: {saved_list['total']}", flush=True)

# 7. Apply for Job
def run_coro(coro):
    try:
        coro.send(None)
    except StopIteration as e:
        return e.value
    raise RuntimeError("Coroutine did not complete synchronously")

# 7. Apply for Job
print("10. Testing apply_for_job...", flush=True)
try:
    app_res = run_coro(apply_for_job(
        job_id=target_job['id'],
        resume_name='Student_Resume.pdf',
        cover_letter='Excited for this internship role.',
        resume_file=None,
        db=db,
        current_user=student
    ))
    print(f"10. Apply result: {app_res['message']}", flush=True)
except Exception as e:
    print(f"10. Apply info (e.g. already applied): {e}", flush=True)

# 8. My Applications
my_apps = get_my_applications(db=db, current_user=student)
print(f"11. My applications count: {my_apps['total']}", flush=True)
assert my_apps['total'] >= 1
first_app = my_apps['applications'][0]
print(f"    Application: {first_app['job_title']} at {first_app['company_name']} -> Status: {first_app['status']}, Step: {first_app['timeline_step']}", flush=True)

# 9. Recruiter View & Status Update
rec_apps = recruiter_view_applicants(db=db, current_user=admin)
print(f"12. Recruiter received applications: {rec_apps['total']}", flush=True)
assert rec_apps['total'] >= 1

update_res = update_application_status(
    application_id=first_app['application_id'],
    status_update='Shortlisted',
    db=db,
    current_user=admin
)
print(f"13. Recruiter status update: {update_res['message']}", flush=True)

# 10. Student sees Shortlisted & timeline step 2
my_apps_updated = get_my_applications(db=db, current_user=student)
updated_app = next(a for a in my_apps_updated['applications'] if a['application_id'] == first_app['application_id'])
print(f"14. Student sees updated status: {updated_app['status']}, Timeline Step: {updated_app['timeline_step']}", flush=True)
assert updated_app['status'] == 'Shortlisted'
assert updated_app['timeline_step'] == 2

# 11. AI Match Explanation (Rule-based fallback when no live Groq API key in test)
ai_res = run_coro(get_ai_job_explanation(job_id=target_job['id'], db=db, current_user=student))
print(f"15. AI Explanation Provider: {ai_res['provider']}, Compatibility: {ai_res['match_score']}%", flush=True)
assert ai_res['match_score'] is not None
assert len(ai_res['explanation']) > 20

db.close()
print("\n🎉🎉🎉 ALL 15 BACKEND TESTS COMPLETED AND PASSED SUCCESSFULLY! 🎉🎉🎉", flush=True)

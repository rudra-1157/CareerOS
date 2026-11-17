import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText, Database, GraduationCap } from 'lucide-react';
import Button from '../components/common/Button';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Navigation & Header */}
        <div>
          <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to CareerOS</span>
          </Link>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Privacy Policy
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Last Updated: November 2026 • CareerOS Academic Project (Group SY207, MIT-ADT University)
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Database className="w-4 h-4 text-blue-600" />
              1. Information We Collect
            </h2>
            <p>
              CareerOS is an academic career operating system designed for engineering students. In order to provide personalized learning paths, coding challenges, resume diagnostics, and placement preparation, we collect the following data:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li><strong>Account Credentials:</strong> Full name, institutional email address, encrypted password hash (salted and hashed using bcrypt), institutional role (Student, Faculty, or Administrator).</li>
              <li><strong>Academic Profile:</strong> College or university name, department, degree program, current academic year or semester, and student target career role.</li>
              <li><strong>Coding Arena & Activity Data:</strong> Code submissions, programming language choices, test execution outcomes, calculated runtime/memory, earned XP, and activity streaks.</li>
              <li><strong>GitHub Integration (Opt-in):</strong> Public repository names, primary programming languages, star counts, commit counts, and public profile bio retrieved via the GitHub REST API.</li>
              <li><strong>Resume Documents (Opt-in):</strong> Uploaded PDF, DOCX, or text resume files parsed locally on the server to extract skill keywords and generate ATS readiness scores.</li>
              <li><strong>AI Mentor Inquiries:</strong> Technical and academic queries submitted to the AI Learning Mentor for syllabus assistance and interview preparation.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Eye className="w-4 h-4 text-blue-600" />
              2. How We Use Collected Data
            </h2>
            <p>We process student data strictly for legitimate educational and placement support purposes:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li>To compute evidence-based skill confidence ratings and placement readiness scores.</li>
              <li>To benchmark resume content against industry applicant tracking system (ATS) filters.</li>
              <li>To generate semester-wise, personalized learning roadmaps based on identified skill gaps.</li>
              <li>To power conversational syllabus assistance and mock interview question generation via Google Gemini API.</li>
              <li>To enable verified campus recruiters to view candidate dossiers solely when the student enables Recruiter Visibility in workspace settings.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              3. Data Security & Encryption
            </h2>
            <p>
              We prioritize the protection of student information:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li>Passwords are never stored in plain text. They are hashed using industry-standard bcrypt algorithms prior to database insertion.</li>
              <li>Session authentication is implemented using signed JSON Web Tokens (JWT) with strict expiration windows.</li>
              <li>Third-party API access tokens (such as GitHub or AI keys) remain encrypted on the backend and are never exposed to client browsers.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              4. Student Rights & Control
            </h2>
            <p>
              Every student maintains full control over their profile. You may update your academic information, delete uploaded resumes, disconnect your GitHub account, toggle recruiter visibility off, or delete your account at any time through the Settings page.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              5. Contact & Institutional Governance
            </h2>
            <p>
              CareerOS is maintained as an undergraduate project by Group SY207 within the Department of Computer Science & Engineering, School of Computing, MIT-ADT University, Pune. For inquiries regarding data handling or project details, contact the project team or academic guide Dr. Megha Wankhade.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500">
          <Link to="/" className="text-blue-600 hover:underline">Return to CareerOS Home</Link>
          <span className="mx-2">•</span>
          <Link to="/terms" className="text-blue-600 hover:underline">Read Terms and Conditions</Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;

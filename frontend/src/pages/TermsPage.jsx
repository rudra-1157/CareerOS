import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle2, AlertCircle, Scale, GraduationCap } from 'lucide-react';

const TermsPage = () => {
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
              <Scale className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Terms and Conditions
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Effective Date: November 2026 • CareerOS Academic Project (Group SY207, MIT-ADT University)
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 sm:p-8 shadow-sm space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, registering with, or utilizing CareerOS ("the Platform"), you agree to abide by these Terms and Conditions. CareerOS is developed for educational purposes to assist undergraduate and postgraduate students in learning, skill verification, and campus placement readiness.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" />
              2. Acceptable Use Policy
            </h2>
            <p>Users must adhere to standards of academic and technological integrity:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li><strong>Accurate Credentials:</strong> Students must provide authentic academic details, genuine enrollment status, and honest representation of project contributions.</li>
              <li><strong>Fair Coding Practice:</strong> Code submitted in the Coding Arena must represent your genuine problem-solving effort. The use of automated scripts to spoof runtime or XP benchmarks is prohibited.</li>
              <li><strong>Respectful Communication:</strong> All queries submitted to the AI Mentor and mock interview simulations must remain professional and compliant with institutional codes of conduct.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              3. AI Advice & Placement Disclaimers
            </h2>
            <p>
              CareerOS leverages artificial intelligence (including Google Gemini LLM and applicant tracking heuristics) to offer diagnostic feedback. Users acknowledge that:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs">
              <li>AI Learning Mentor answers, ATS resume diagnostic percentages, and mock interview suggestions are educational guides intended to support personal preparation.</li>
              <li>CareerOS does not guarantee employment offers, interview shortlists, or specific academic examination grades.</li>
              <li>Placement drive opportunities and selection criteria are governed by participating companies and institutional placement cells.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-blue-600" />
              4. Intellectual Property & Code Ownership
            </h2>
            <p>
              Students retain full intellectual property rights to the source code, repositories, capstone projects, and resume content uploaded to or linked within the Platform. CareerOS does not claim ownership over student creations.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600" />
              5. Modification & Governing Jurisdiction
            </h2>
            <p>
              The platform administrators reserve the right to refine or update platform features to improve educational efficacy. These terms are governed under the institutional guidelines of MIT-ADT University, School of Computing, Pune, Maharashtra, India.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-500">
          <Link to="/" className="text-blue-600 hover:underline">Return to CareerOS Home</Link>
          <span className="mx-2">•</span>
          <Link to="/privacy" className="text-blue-600 hover:underline">Read Privacy Policy</Link>
        </div>
      </div>
    </div>
  );
};

export default TermsPage;

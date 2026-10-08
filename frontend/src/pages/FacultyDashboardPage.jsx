import React, { useState, useEffect } from 'react';
import { facultyService } from '../services/api';
import { useAuth } from '../context/AuthContext';

const FacultyDashboardPage = () => {
  const { currentUser } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    stats: {
      total_students: 142,
      batches_assigned: 3,
      avg_skill_confidence: '81%',
      placement_ready_pct: '76%',
      pending_viva_reviews: 6,
    },
    assigned_classes: [
      { subject: 'Design & Analysis of Algorithms', code: 'CS-301', batch: 'CSE 3rd Year - A', students: 58, avg_score: '84%' },
      { subject: 'Machine Learning Systems', code: 'CS-504', batch: 'CSE 3rd Year - B', students: 46, avg_score: '78%' },
      { subject: 'Database Management Systems', code: 'CS-302', batch: 'CSE 2nd Year - C', students: 38, avg_score: '86%' },
    ],
    recent_submissions: [
      { student: 'Rudra Padhy', topic: 'DSA Two Sum Challenge', status: 'Verified', time: '2 hours ago', xp: '+100 XP' },
      { student: 'Sahil Shinde', topic: 'Graph Algorithms & BFS', status: 'Under Review', time: '5 hours ago', xp: '+120 XP' },
      { student: 'Ananya Roy', topic: 'Relational Indexing Lab', status: 'Verified', time: '1 day ago', xp: '+90 XP' },
      { student: 'Karan Mehta', topic: 'ML Regression Pipeline', status: 'Action Required', time: '2 days ago', xp: '+150 XP' },
    ],
    curriculum_recommendations: [
      'Increase practical lab assignments on Dynamic Programming for CS-301.',
      'Schedule guest seminar on Production ML Pipelines for CS-504.',
      'Verify remaining 6 viva submissions before weekly deadline.',
    ],
  });

  const [submissions, setSubmissions] = useState(dashboardData.recent_submissions);
  const [successToast, setSuccessToast] = useState('');

  useEffect(() => {
    facultyService.getDashboard().then((res) => {
      if (res) {
        setDashboardData(res);
        if (res.recent_submissions) {
          setSubmissions(res.recent_submissions);
        }
      }
    });
  }, []);

  const handleApprove = (index, studentName) => {
    setSubmissions((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, status: 'Verified' } : item))
    );
    setSuccessToast(`Verified submission & awarded XP to ${studentName}!`);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#10b981] text-white px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold flex items-center gap-2">
          <span>✓</span> {successToast}
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#101a3b] to-[#1c2e64] text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="inline-block px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold uppercase tracking-wider mb-2">
            👨‍🏫 Faculty Portal • Academic Mentorship
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome, {currentUser?.name || 'Dr. Arvind Sharma'}
          </h2>
          <p className="text-blue-100/80 text-sm mt-1 max-w-xl">
            {currentUser?.degree || 'Professor & HOD'} • {currentUser?.department || 'Department of CSE'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setSuccessToast('Batch performance report downloaded as PDF.');
              setTimeout(() => setSuccessToast(''), 3000);
            }}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            📊 Export Analytics
          </button>
          <button
            onClick={() => {
              setSuccessToast('Institutional AI Assessment initiated for all 3 batches.');
              setTimeout(() => setSuccessToast(''), 3000);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-sm"
          >
            ⚡ Run Cohort AI Check
          </button>
        </div>
      </div>

      {/* High-Level Faculty Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#e3e8f3] shadow-xs">
          <div className="text-xs text-[#68738a] font-medium uppercase tracking-wider">Total Students</div>
          <div className="text-2xl font-extrabold text-[#172033] mt-1">{dashboardData.stats.total_students}</div>
          <div className="text-[11px] text-[#10b981] font-semibold mt-1">Across 3 cohorts</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e3e8f3] shadow-xs">
          <div className="text-xs text-[#68738a] font-medium uppercase tracking-wider">Batches Mentored</div>
          <div className="text-2xl font-extrabold text-[#172033] mt-1">{dashboardData.stats.batches_assigned}</div>
          <div className="text-[11px] text-blue-600 font-semibold mt-1">CSE 2nd & 3rd Year</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e3e8f3] shadow-xs">
          <div className="text-xs text-[#68738a] font-medium uppercase tracking-wider">Avg Skill Confidence</div>
          <div className="text-2xl font-extrabold text-[#172033] mt-1">{dashboardData.stats.avg_skill_confidence}</div>
          <div className="text-[11px] text-[#10b981] font-semibold mt-1">▲ +4% this month</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e3e8f3] shadow-xs">
          <div className="text-xs text-[#68738a] font-medium uppercase tracking-wider">Placement Ready</div>
          <div className="text-2xl font-extrabold text-[#172033] mt-1">{dashboardData.stats.placement_ready_pct}</div>
          <div className="text-[11px] text-purple-600 font-semibold mt-1">108 qualified students</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e3e8f3] shadow-xs">
          <div className="text-xs text-[#68738a] font-medium uppercase tracking-wider">Pending Viva Reviews</div>
          <div className="text-2xl font-extrabold text-[#172033] mt-1 text-amber-600">{dashboardData.stats.pending_viva_reviews}</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">Requires your sign-off</div>
        </div>
      </div>

      {/* Main Grid: Assigned Classes & Submissions Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Assigned Batches (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-[#e3e8f3] shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-[#172033]">Assigned Classes & Batches</h3>
                <p className="text-xs text-[#68738a]">Active academic coursework and student cohort performance</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">
                Semester Active
              </span>
            </div>

            <div className="space-y-3">
              {dashboardData.assigned_classes.map((cls, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-[#eaf0fa] hover:border-blue-200 transition-colors bg-[#f8fafc] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#101a3b] text-white">
                        {cls.code}
                      </span>
                      <h4 className="text-sm font-bold text-[#172033]">{cls.subject}</h4>
                    </div>
                    <div className="text-xs text-[#68738a] mt-1">
                      Batch: <span className="font-semibold text-gray-700">{cls.batch}</span> • {cls.students} Enrolled Students
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="text-xs text-[#68738a]">Cohort Avg</div>
                      <div className="text-sm font-bold text-emerald-600">{cls.avg_score}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSuccessToast(`Opened cohort roster for ${cls.code}.`);
                        setTimeout(() => setSuccessToast(''), 2500);
                      }}
                      className="px-3 py-1.5 bg-white border border-gray-300 hover:border-blue-500 hover:text-blue-600 rounded-lg text-xs font-semibold text-gray-700 transition-colors cursor-pointer"
                    >
                      View Roster
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Submissions & Viva Verification Queue */}
          <div className="bg-white p-5 rounded-2xl border border-[#e3e8f3] shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-[#172033]">Student Submissions & Viva Queue</h3>
                <p className="text-xs text-[#68738a]">Practical challenges, lab projects & viva voce evaluations</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg">
                4 Recent Submissions
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-[#68738a] font-semibold">
                    <th className="pb-2.5">Student</th>
                    <th className="pb-2.5">Assessment Topic</th>
                    <th className="pb-2.5">Submitted</th>
                    <th className="pb-2.5">Status</th>
                    <th className="pb-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {submissions.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/70">
                      <td className="py-3 font-semibold text-[#172033]">{sub.student}</td>
                      <td className="py-3 text-gray-600">{sub.topic}</td>
                      <td className="py-3 text-gray-500">{sub.time}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                            sub.status === 'Verified'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sub.status === 'Under Review'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {sub.status !== 'Verified' ? (
                          <button
                            onClick={() => handleApprove(idx, sub.student)}
                            className="px-2.5 py-1 bg-[#10b981] hover:bg-emerald-600 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Verify & Award
                          </button>
                        ) : (
                          <span className="text-gray-400 font-mono text-[11px]">{sub.xp}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Column: Recommendations & AI Assistant */}
        <div className="space-y-6">
          {/* Institutional AI Curriculum Recommendations */}
          <div className="bg-white p-5 rounded-2xl border border-[#e3e8f3] shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🤖</span>
              <div>
                <h3 className="text-sm font-bold text-[#172033]">AI Curriculum Advisor</h3>
                <p className="text-[11px] text-[#68738a]">RAG-driven feedback on cohort weaknesses</p>
              </div>
            </div>

            <div className="space-y-2.5 mt-3">
              {dashboardData.curriculum_recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs text-blue-900 leading-relaxed"
                >
                  <div className="font-semibold text-blue-800 mb-0.5">Recommendation #{idx + 1}</div>
                  {rec}
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setSuccessToast('Requested updated syllabus gap report from AI Mentor.');
                setTimeout(() => setSuccessToast(''), 3000);
              }}
              className="w-full mt-4 py-2 border border-blue-500 text-blue-600 hover:bg-blue-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-center"
            >
              Analyze Batch Skill Gaps →
            </button>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-[#101a3b] to-[#203264] text-white p-5 rounded-2xl shadow-xs">
            <h3 className="text-sm font-bold mb-1">Faculty Quick Actions</h3>
            <p className="text-xs text-blue-200/80 mb-4">Fast shortcuts for daily academic workflows</p>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => {
                  setSuccessToast('New Viva Evaluation form opened.');
                  setTimeout(() => setSuccessToast(''), 2500);
                }}
                className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-left font-medium flex items-center justify-between cursor-pointer"
              >
                <span>🎙️ Conduct Online Viva Voce</span>
                <span>→</span>
              </button>
              <button
                onClick={() => {
                  setSuccessToast('Syncing class roster with College ERP...');
                  setTimeout(() => setSuccessToast(''), 2500);
                }}
                className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-left font-medium flex items-center justify-between cursor-pointer"
              >
                <span>🔄 Sync Attendance & ERP Data</span>
                <span>→</span>
              </button>
              <button
                onClick={() => {
                  setSuccessToast('Endorsed 12 students to Company Recruitment Portal.');
                  setTimeout(() => setSuccessToast(''), 3000);
                }}
                className="w-full py-2 px-3 bg-white/10 hover:bg-white/20 rounded-lg text-left font-medium flex items-center justify-between cursor-pointer"
              >
                <span>🌟 Endorse Top Performers to Companies</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FacultyDashboardPage;

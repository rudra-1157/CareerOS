import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  BarChart3, 
  Sparkles, 
  Bot, 
  Mic, 
  RefreshCw, 
  Award, 
  CheckCircle2, 
  Users, 
  Check, 
  BookOpen, 
  FileCheck,
  ChevronRight,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { facultyService, passportService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

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
  const [pendingSkills, setPendingSkills] = useState([]);
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

    passportService.getPendingVerifications().then((res) => {
      if (res && res.queue) {
        setPendingSkills(res.queue);
      }
    }).catch(() => {});
  }, []);

  const handleVerifySkill = async (skillId, studentName, action) => {
    try {
      await passportService.verifySkill(skillId, {
        action: action,
        comments: action === 'APPROVED' ? 'Attested by faculty guide based on repository evidence and viva evaluation.' : 'Needs additional lab work.',
        rejection_reason: action === 'REJECTED' ? 'Insufficient evidence' : ''
      });
      setPendingSkills(prev => prev.filter(s => s.skill_id !== skillId));
      setSuccessToast(`Skill attestation decision saved for ${studentName}: ${action}`);
      setTimeout(() => setSuccessToast(''), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleApprove = (index, studentName) => {
    setSubmissions((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, status: 'Verified' } : item))
    );
    setSuccessToast(`Verified submission & awarded XP to ${studentName}.`);
    setTimeout(() => setSuccessToast(''), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 border border-emerald-500">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-8 border border-slate-800 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 text-xs font-medium text-slate-200 mb-2">
            <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
            <span>Faculty Portal • Academic Mentorship</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Welcome, {currentUser?.name || 'Dr. Arvind Sharma'}
          </h1>
          <p className="text-slate-300 text-xs mt-1">
            {currentUser?.degree || 'Professor & HOD'} • {currentUser?.department || 'Department of CSE'}
          </p>
        </div>
        <div className="flex gap-2.5 shrink-0">
          <button
            onClick={() => {
              setSuccessToast('Batch performance report downloaded as PDF.');
              setTimeout(() => setSuccessToast(''), 3000);
            }}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer border border-slate-700 flex items-center gap-1.5"
          >
            <BarChart3 className="w-3.5 h-3.5 text-slate-400" />
            Export Analytics
          </button>
          <button
            onClick={() => {
              setSuccessToast('Institutional AI Assessment initiated for all cohorts.');
              setTimeout(() => setSuccessToast(''), 3000);
            }}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-200" />
            Run Cohort Check
          </button>
        </div>
      </div>

      {/* High-Level Faculty Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Total Students</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{dashboardData.stats.total_students}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">Across 3 cohorts</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Batches Mentored</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{dashboardData.stats.batches_assigned}</div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">CSE 2nd & 3rd Year</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Skill Confidence</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{dashboardData.stats.avg_skill_confidence}</div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">+4% this month</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Placement Ready</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{dashboardData.stats.placement_ready_pct}</div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">108 qualified students</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Pending Reviews</div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{dashboardData.stats.pending_viva_reviews}</div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">Requires your sign-off</div>
        </div>
      </div>

      {/* Main Grid: Assigned Classes & Submissions Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Assigned Batches (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card title="Assigned Classes & Batches" subtitle="Active academic coursework and student cohort performance">
            <div className="space-y-3">
              {dashboardData.assigned_classes.map((cls, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-900 dark:bg-slate-700 text-white">
                        {cls.code}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{cls.subject}</h4>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Batch: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{cls.batch}</strong> • {cls.students} Enrolled
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">Cohort Avg</div>
                      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{cls.avg_score}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSuccessToast(`Opened cohort roster for ${cls.code}.`);
                        setTimeout(() => setSuccessToast(''), 2500);
                      }}
                      className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    >
                      View Roster
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Student Submissions & Viva Verification Queue */}
          <Card title="Student Submissions & Viva Queue" subtitle="Practical challenges, lab projects & viva voce evaluations">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="pb-2.5">Student</th>
                    <th className="pb-2.5">Assessment Topic</th>
                    <th className="pb-2.5">Submitted</th>
                    <th className="pb-2.5">Status</th>
                    <th className="pb-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {submissions.map((sub, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3 font-semibold text-slate-900 dark:text-white">{sub.student}</td>
                      <td className="py-3 text-slate-600 dark:text-slate-300">{sub.topic}</td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">{sub.time}</td>
                      <td className="py-3">
                        <Badge variant={sub.status === 'Verified' ? 'success' : sub.status === 'Under Review' ? 'warning' : 'info'}>
                          {sub.status}
                        </Badge>
                      </td>
                      <td className="py-3 text-right">
                        {sub.status !== 'Verified' ? (
                          <button
                            onClick={() => handleApprove(idx, sub.student)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
                          >
                            Verify & Award
                          </button>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">{sub.xp}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Skill Passport Attestation Queue */}
          <Card 
            title="Skill Passport Attestation Queue" 
            subtitle="Student technical skills awaiting official faculty attestation and repository audit"
          >
            {pendingSkills.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-500">
                No pending skill passport submissions awaiting review. All student skills are up to date!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                      <th className="pb-2.5">Student</th>
                      <th className="pb-2.5">Skill & Domain</th>
                      <th className="pb-2.5">Level</th>
                      <th className="pb-2.5">Evidence</th>
                      <th className="pb-2.5 text-right">Faculty Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {pendingSkills.map((ps) => (
                      <tr key={ps.skill_id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                        <td className="py-3 font-semibold text-slate-900 dark:text-white">
                          {ps.student_name}
                          <span className="block text-[10px] text-slate-400 font-normal">{ps.student_degree}</span>
                        </td>
                        <td className="py-3">
                          <span className="font-bold text-blue-600 dark:text-blue-400 block">{ps.skill_name}</span>
                          <span className="text-[10px] text-slate-400">{ps.category}</span>
                        </td>
                        <td className="py-3 font-medium">
                          {ps.proficiency_level} ({ps.percentage}%)
                        </td>
                        <td className="py-3 text-slate-600 dark:text-slate-300">
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-200">
                            <FileCheck className="w-3.5 h-3.5 text-slate-400" />
                            {ps.evidence_count} Record{ps.evidence_count !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              onClick={() => handleVerifySkill(ps.skill_id, ps.student_name, 'APPROVED')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Approve and endorse skill"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleVerifySkill(ps.skill_id, ps.student_name, 'NEEDS_IMPROVEMENT')}
                              className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Request additional evidence"
                            >
                              Improve
                            </button>
                            <button
                              onClick={() => handleVerifySkill(ps.skill_id, ps.student_name, 'REJECTED')}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded text-[11px] font-semibold transition-colors cursor-pointer"
                              title="Reject attestation"
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Sidebar Column: Recommendations & AI Assistant */}
        <div className="space-y-6">
          {/* Institutional AI Curriculum Recommendations */}
          <Card title="AI Curriculum Advisor" subtitle="Curriculum RAG feedback on cohort weaknesses">
            <div className="space-y-2.5">
              {dashboardData.curriculum_recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-xl text-xs text-blue-900 dark:text-blue-200 leading-relaxed"
                >
                  <div className="font-semibold text-blue-800 dark:text-blue-300 mb-0.5">Recommendation #{idx + 1}</div>
                  {rec}
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setSuccessToast('Requested updated syllabus gap report from AI Mentor.');
                setTimeout(() => setSuccessToast(''), 3000);
              }}
              className="w-full mt-4 py-2 border border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-center"
            >
              Analyze Batch Skill Gaps
            </button>
          </Card>

          {/* Quick Actions */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold mb-1">Faculty Quick Actions</h3>
            <p className="text-xs text-slate-400 mb-4">Fast shortcuts for daily academic workflows</p>

            <div className="space-y-2 text-xs">
              <button
                onClick={() => {
                  setSuccessToast('New Viva Evaluation session initialized.');
                  setTimeout(() => setSuccessToast(''), 2500);
                }}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-left font-medium flex items-center justify-between cursor-pointer border border-slate-700/60"
              >
                <span className="flex items-center gap-2">
                  <Mic className="w-3.5 h-3.5 text-blue-400" />
                  Conduct Online Viva Voce
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => {
                  setSuccessToast('Syncing class roster with College ERP...');
                  setTimeout(() => setSuccessToast(''), 2500);
                }}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-left font-medium flex items-center justify-between cursor-pointer border border-slate-700/60"
              >
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  Sync Attendance & ERP Data
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => {
                  setSuccessToast('Endorsed students to Company Recruitment Portal.');
                  setTimeout(() => setSuccessToast(''), 3000);
                }}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-left font-medium flex items-center justify-between cursor-pointer border border-slate-700/60"
              >
                <span className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Endorse Candidates to Companies
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default FacultyDashboardPage;

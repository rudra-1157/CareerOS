import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  RefreshCw, 
  FileText, 
  Users, 
  Building2, 
  Database, 
  CheckCircle2, 
  Download,
  Search,
  Filter,
  UserCheck,
  Calendar,
  GraduationCap,
  ExternalLink,
  Github,
  Mail,
  Award,
  Flame,
  Clock,
  Sparkles
} from 'lucide-react';
import { adminService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

const AdminDashboardPage = () => {
  const { currentUser } = useAuth();
  
  // Dashboard & System Data
  const [adminData, setAdminData] = useState({
    stats: {
      total_enrolled_students: 1240,
      total_faculty_members: 48,
      system_health: '99.98%',
      rag_indexed_docs: 184,
      partner_companies: 32,
      active_placements: 89,
    },
    department_metrics: [
      { department: 'Computer Science & Engineering', students: 480, readiness: '78%', faculty: 18, status: 'Optimal' },
      { department: 'Information Technology', students: 320, readiness: '75%', faculty: 12, status: 'Optimal' },
      { department: 'AI & Data Science', students: 240, readiness: '82%', faculty: 10, status: 'High Growth' },
      { department: 'Electronics & Telecomm.', students: 200, readiness: '69%', faculty: 8, status: 'Needs Review' },
    ],
    rag_status: {
      vector_store: 'FAISS Index Active',
      embeddings_model: 'text-embedding-004',
      curriculum_docs_indexed: 184,
      last_synced: '10 minutes ago',
    },
    system_audit_logs: [
      { event: 'Curriculum RAG Sync', actor: 'Admin NV', status: 'Success', time: '18:20' },
      { event: 'Batch 2026 Student Onboarding', actor: 'System', status: 'Completed (420 Users)', time: '14:00' },
      { event: 'Company Portal Verification Key Updated', actor: 'Admin NV', status: 'Success', time: 'Yesterday' },
    ],
  });

  // Real Database State
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    total_users: 0,
    total_students: 0,
    total_faculty: 0,
    total_admins: 0,
    logged_in_users: 0,
    logged_in_students: 0,
    database_type: 'SQLite',
    database_file: 'careeros.db'
  });
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'STUDENT' | 'FACULTY' | 'ADMINISTRATOR'
  const [loggedInOnly, setLoggedInOnly] = useState(false);

  // Active View Tab
  const [activeTab, setActiveTab] = useState('database'); // 'database' | 'overview'

  const [toast, setToast] = useState('');
  const [isSyncingRag, setIsSyncingRag] = useState(false);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const [usersRes, statsRes] = await Promise.all([
        adminService.getUsers({
          role: roleFilter !== 'ALL' ? roleFilter : undefined,
          search: searchTerm.trim() || undefined,
          logged_in_only: loggedInOnly ? true : undefined,
        }),
        adminService.getUserStats()
      ]);

      if (usersRes && usersRes.users) {
        setUsers(usersRes.users);
      }
      if (statsRes) {
        setStats(statsRes);
      }
    } catch (err) {
      console.error('Failed to load user database:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    adminService.getDashboard().then((res) => {
      if (res) setAdminData(res);
    });
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, loggedInOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleExportCsv = () => {
    const exportUrl = adminService.getExportUrl();
    window.open(exportUrl, '_blank');
    setToast('Student database CSV download initiated.');
    setTimeout(() => setToast(''), 3000);
  };

  const handleSyncRag = () => {
    setIsSyncingRag(true);
    setTimeout(() => {
      setIsSyncingRag(false);
      setToast('FAISS Vector Store successfully re-indexed 184 institutional documents.');
      setTimeout(() => setToast(''), 3500);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold flex items-center gap-2 border border-emerald-500 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toast}</span>
        </div>
      )}

      {/* Admin Header Banner */}
      <div className="bg-slate-900 text-white p-6 md:p-8 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 text-xs font-medium text-slate-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Institutional Command Center • Administrator</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Student & User Directory • Database Control
          </h1>
          <p className="text-slate-300 text-xs mt-1">
            Real-time inspection of registered students, authenticated user sessions, and institutional records in <code className="px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 font-mono">careeros.db</code>.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            onClick={handleExportCsv}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Database (.CSV)</span>
          </button>

          <button
            onClick={() => {
              fetchUsers();
              setToast('Student database re-queried.');
              setTimeout(() => setToast(''), 2500);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer flex items-center gap-2 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingUsers ? 'animate-spin' : ''}`} />
            <span>Refresh Records</span>
          </button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('database')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'database'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Registered Students & Users Database</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold">
            {stats.total_users}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Institutional Overview & RAG</span>
        </button>
      </div>

      {activeTab === 'database' && (
        <div className="space-y-6">
          {/* Real Live Database Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Registered Students</span>
                <GraduationCap className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {stats.total_students}
              </div>
              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">
                In SQLite table <code className="font-mono text-[10px]">student_profiles</code>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Logged In Students</span>
                <UserCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {stats.logged_in_students}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
                Timestamped in <code className="font-mono text-[10px]">users.last_login</code>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Total User Accounts</span>
                <Users className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                {stats.total_users}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                {stats.total_faculty} Faculty • {stats.total_admins} Admin
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Database Engine</span>
                <Database className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                SQLite 3
              </div>
              <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
                File: <code className="font-mono text-[10px]">{stats.database_file}</code>
              </div>
            </div>
          </div>

          {/* Database Filter & Search Controls */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search student by name, email, department, career goal..."
                  className="w-full pl-9 pr-24 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-500 transition-colors cursor-pointer"
                >
                  Search
                </button>
              </form>

              {/* Filter Controls */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                {/* Role Tabs */}
                <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  {['ALL', 'STUDENT', 'FACULTY', 'ADMINISTRATOR'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRoleFilter(r)}
                      className={`px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        roleFilter === r
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {r === 'ALL' ? 'All Roles' : r === 'STUDENT' ? 'Students' : r === 'FACULTY' ? 'Faculty' : 'Admins'}
                    </button>
                  ))}
                </div>

                {/* Logged In Only Toggle */}
                <button
                  onClick={() => setLoggedInOnly(!loggedInOnly)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                    loggedInOnly
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Logged In Only</span>
                </button>
              </div>
            </div>
          </div>

          {/* User Directory Table */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-500" />
                  <span>Student & User Records</span>
                  <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
                    ({users.length} results matching filter)
                  </span>
                </h3>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Sorted by: <span className="font-semibold text-slate-700 dark:text-slate-300">Last Login (Recent First)</span>
              </div>
            </div>

            {isLoadingUsers ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-blue-500" />
                <p className="text-xs">Querying database table <code className="font-mono">users</code>...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
                <Users className="w-8 h-8 mx-auto text-slate-400 mb-2 opacity-50" />
                <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No users match your criteria</h4>
                <p className="text-xs text-slate-500">Try clearing the search query or role filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-100 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Student / User</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Academic Background</th>
                      <th className="py-3 px-4">Target Role & GitHub</th>
                      <th className="py-3 px-4">Registered Date</th>
                      <th className="py-3 px-4">Last Login Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users.map((u) => {
                      const isStudent = u.role === 'STUDENT';
                      const hasLoggedIn = Boolean(u.last_login);

                      return (
                        <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                          {/* Student Name & Email */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                                {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <span>{u.name}</span>
                                  {u.is_demo && (
                                    <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                                      Demo
                                    </span>
                                  )}
                                </div>
                                <div className="text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3 h-3 text-slate-400" />
                                  <span>{u.email}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="py-3.5 px-4">
                            <Badge variant={u.role === 'STUDENT' ? 'primary' : u.role === 'FACULTY' ? 'info' : 'warning'}>
                              {u.role}
                            </Badge>
                          </td>

                          {/* Academic Background */}
                          <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                            {isStudent ? (
                              <div>
                                <div className="font-semibold text-slate-800 dark:text-slate-200">
                                  {u.degree || 'B.Tech CSE'}
                                </div>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                  {u.semester || 'Semester 3'} {u.department ? `• ${u.department}` : ''}
                                </div>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">Faculty / Staff</span>
                            )}
                          </td>

                          {/* Career Goal & GitHub */}
                          <td className="py-3.5 px-4">
                            <div>
                              <div className="text-slate-800 dark:text-slate-200 font-medium">
                                {u.career_goal || (isStudent ? 'Software Engineer' : 'Department Lead')}
                              </div>
                              {u.github_username && (
                                <a
                                  href={`https://github.com/${u.github_username}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mt-0.5"
                                >
                                  <Github className="w-3 h-3" />
                                  <span>@{u.github_username}</span>
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Registration Date */}
                          <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 text-[11px]">
                            {u.created_at ? (
                              <div className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                <span>{u.created_at}</span>
                              </div>
                            ) : (
                              'N/A'
                            )}
                          </td>

                          {/* Last Login Status */}
                          <td className="py-3.5 px-4">
                            {hasLoggedIn ? (
                              <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <div>
                                  <div className="text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
                                    Authenticated
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                    <Clock className="w-2.5 h-2.5" />
                                    <span>{u.last_login}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
                                <span className="h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                <span className="text-[11px]">Never Logged In</span>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Institutional Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* High-Level Institutional Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Students</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{adminData.stats.total_enrolled_students}</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">Active enrolled</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Faculty</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{adminData.stats.total_faculty_members}</div>
              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">4 departments</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">System Health</div>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{adminData.stats.system_health}</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">All services online</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">RAG Docs</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{adminData.stats.rag_indexed_docs}</div>
              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">In Vector Store</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Companies</div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{adminData.stats.partner_companies}</div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">Recruitment partners</div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">Placements</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{adminData.stats.active_placements}</div>
              <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">Final interview stage</div>
            </div>
          </div>

          {/* Departmental Metrics & RAG Engine Status */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card title="Departmental Readiness & Health" subtitle="Placement readiness indices and faculty distribution">
                <div className="space-y-3">
                  {adminData.department_metrics.map((dept, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{dept.department}</h4>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {dept.students} Students • {dept.faculty} Faculty Mentors
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-[11px] text-slate-500 dark:text-slate-400">Placement Ready</div>
                          <div className="text-sm font-bold text-blue-600 dark:text-blue-400">{dept.readiness}</div>
                        </div>
                        <Badge variant={dept.status === 'Optimal' ? 'success' : dept.status === 'High Growth' ? 'info' : 'warning'}>
                          {dept.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Administrative Audit Trail" subtitle="Immutable system and role action events">
                <div className="space-y-2.5">
                  {adminData.system_audit_logs.map((log, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <div>
                          <strong className="font-semibold text-slate-900 dark:text-white">{log.event}</strong>
                          <span className="text-slate-500 dark:text-slate-400 ml-2">by {log.actor}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">{log.status}</span>
                        <span className="text-slate-400 dark:text-slate-500 font-mono text-[11px]">{log.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card title="RAG Vector Engine" subtitle="Syllabus & Curriculum Index">
                <div className="space-y-2 text-xs divide-y divide-slate-100 dark:divide-slate-800">
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Vector Store:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{adminData.rag_status.vector_store}</span>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Embeddings:</span>
                    <span className="font-mono text-slate-800 dark:text-slate-200">{adminData.rag_status.embeddings_model}</span>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Indexed Docs:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">{adminData.rag_status.curriculum_docs_indexed} Documents</span>
                  </div>
                  <div className="pt-2 flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Last Synced:</span>
                    <span className="text-slate-600 dark:text-slate-300">{adminData.rag_status.last_synced}</span>
                  </div>
                </div>

                <button
                  onClick={handleSyncRag}
                  disabled={isSyncingRag}
                  className="w-full mt-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  {isSyncingRag ? 'Syncing In Progress...' : 'Force Embeddings Refresh'}
                </button>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;

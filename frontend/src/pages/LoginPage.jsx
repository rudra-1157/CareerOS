import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Shield,
  User,
  School,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

const roleMeta = {
  student: {
    label: 'Student',
    roleTag: 'Undergraduate / PG',
    defaultEmail: 'student@careeros.edu',
    defaultPassword: 'password123',
    description: 'Track academic progress, practice in Coding Arena, build Skill Passport & prepare for placement drives.',
    redirectPath: '/dashboard',
  },
  faculty: {
    label: 'Faculty',
    roleTag: 'Mentor & Evaluator',
    defaultEmail: 'faculty@careeros.edu',
    defaultPassword: 'password123',
    description: 'Review student submissions, evaluate viva assessments, and endorse candidate Skill Passports.',
    redirectPath: '/faculty',
  },
  admin: {
    label: 'Administrator',
    roleTag: 'Institutional Lead',
    defaultEmail: 'admin@careeros.edu',
    defaultPassword: 'password123',
    description: 'Manage departmental curriculum indexing, institutional analytics, and campus placement pipelines.',
    redirectPath: '/admin',
  },
};

const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  const { login, isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && userRole) {
      if (userRole === 'faculty') navigate('/faculty', { replace: true });
      else if (userRole === 'admin') navigate('/admin', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, userRole, navigate]);

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setErrorMessage('');
  };

  const handleDemoFill = (roleKey) => {
    setSelectedRole(roleKey);
    setEmail(roleMeta[roleKey].defaultEmail);
    setPassword(roleMeta[roleKey].defaultPassword);
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your institutional email address.');
      return;
    }
    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsSubmitting(true);
    const result = await login({
      email,
      password,
      role: selectedRole,
      rememberMe,
    });
    setIsSubmitting(false);

    if (result.success) {
      const actualRole = result.user?.role?.toLowerCase();
      let destination = roleMeta[selectedRole]?.redirectPath || '/dashboard';
      if (actualRole === 'faculty') destination = '/faculty';
      else if (actualRole === 'administrator' || actualRole === 'admin') destination = '/admin';
      else if (actualRole === 'student') destination = '/dashboard';

      const searchParams = new URLSearchParams(location.search);
      const redirectParam = searchParams.get('redirect');
      const targetDestination = location.state?.from?.pathname || redirectParam || destination;

      navigate(targetDestination, { replace: true });
    } else {
      setErrorMessage(result.error);
    }
  };

  const handleForgotPasswordSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    setForgotSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans">
      
      {/* Container Box */}
      <div className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Side: Brand & Product Value */}
        <div className="lg:col-span-5 bg-slate-900 text-white p-6 sm:p-8 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
          <div>
            <Link to="/" className="inline-flex items-center gap-2.5 mb-6 group">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                Career<span className="text-blue-400">OS</span>
              </span>
            </Link>

            <div className="space-y-2 mb-6">
              <span className="inline-block px-2.5 py-0.5 rounded text-[10px] font-semibold bg-blue-950 text-blue-300 border border-blue-900">
                MIT-ADT University • CSE
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                One Platform. One Journey.
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                Continuous career development connecting foundational coursework, coding benchmarks, GitHub evidence, and campus placement preparation.
              </p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>AI Learning Mentor for university syllabus & viva</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Algorithmic coding arena with test case validation</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Verified Skill Passport for campus recruiters</span>
              </div>
            </div>
          </div>

          {/* Evaluator Demo Quick Access */}
          <div className="pt-6 mt-6 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
              Evaluator Demo Accounts:
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.keys(roleMeta).map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleDemoFill(key)}
                  className="px-2 py-1.5 text-center rounded bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-[11px] font-medium text-slate-200 transition-colors"
                >
                  {roleMeta[key].label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Sign in to your account
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Enter your institutional credentials to access your CareerOS workspace.
              </p>
            </div>

            {/* Role Tabs */}
            <div className="mb-5">
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                Select Portal Role
              </label>
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-700/60">
                {Object.entries(roleMeta).map(([roleKey, data]) => {
                  const isSelected = selectedRole === roleKey;
                  return (
                    <button
                      key={roleKey}
                      type="button"
                      onClick={() => handleRoleSelect(roleKey)}
                      className={`py-2 px-3 rounded-md text-xs font-medium text-center transition-colors ${
                        isSelected
                          ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {data.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error Notification Alert */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 rounded-lg text-red-700 dark:text-red-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                <div className="flex-1 leading-relaxed">
                  <strong className="block font-semibold mb-0.5">Authentication Failed</strong>
                  {errorMessage}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Institutional Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={roleMeta[selectedRole].defaultEmail}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotSubmitted(false);
                      setShowForgotPasswordModal(true);
                    }}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-10 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-600 dark:text-slate-400">
                  Keep me signed in on this workstation
                </label>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                loading={isSubmitting}
              >
                Sign In to {roleMeta[selectedRole].label} Portal
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </form>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              New to CareerOS?{' '}
              <Link to="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Create a student account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setShowForgotPasswordModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-1">
              Account Password Recovery
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
              Enter your registered institutional email to initiate password recovery.
            </p>

            {forgotSubmitted ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs text-emerald-700 dark:text-emerald-300 space-y-2">
                <div className="flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Recovery Instructions Sent</span>
                </div>
                <p>
                  If an account exists for <strong>{forgotEmail}</strong>, an academic reset link has been dispatched. For immediate lab assistance, contact your CSE departmental administrator.
                </p>
                <div className="pt-2">
                  <Button variant="outline" size="sm" onClick={() => setShowForgotPasswordModal(false)}>
                    Return to Sign In
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="student@careeros.edu"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowForgotPasswordModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" size="sm">
                    Send Reset Link
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Institutional Legal Footer Links */}
      <div className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500">
        <Link to="/privacy" className="hover:underline">Privacy Policy</Link>
        <span className="mx-2">•</span>
        <Link to="/terms" className="hover:underline">Terms of Service</Link>
        <span className="mx-2">•</span>
        <span>MIT-ADT University CSE</span>
      </div>
    </div>
  );
};

export default LoginPage;

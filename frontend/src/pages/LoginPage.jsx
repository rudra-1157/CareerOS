import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleMeta = {
  student: {
    label: 'Student',
    icon: '🎓',
    badge: 'Undergraduate / PG',
    defaultEmail: 'student@careeros.edu',
    name: 'Rudra Padhy',
    description: 'Track academic progress, practice in Coding Arena, build Skill Passport & get hired.',
    redirectPath: '/dashboard',
  },
  faculty: {
    label: 'Faculty',
    icon: '👨‍🏫',
    badge: 'Mentor & Evaluator',
    defaultEmail: 'faculty@careeros.edu',
    name: 'Dr. Arvind Sharma',
    description: 'Evaluate student submissions, review viva exams, monitor batch performance.',
    redirectPath: '/faculty',
  },
  admin: {
    label: 'Administrator',
    icon: '🛡️',
    badge: 'Institutional Dean',
    defaultEmail: 'admin@careeros.edu',
    name: 'Dr. Neha Varma',
    description: 'Manage departmental analytics, curriculum RAG indexing & placement pipelines.',
    redirectPath: '/admin',
  },
};

const LoginPage = () => {
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('student@careeros.edu');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // If already authenticated, redirect to appropriate role dashboard
  useEffect(() => {
    if (isAuthenticated && userRole) {
      if (userRole === 'faculty') navigate('/faculty', { replace: true });
      else if (userRole === 'admin') navigate('/admin', { replace: true });
      else navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, userRole, navigate]);

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    setEmail(roleMeta[roleKey].defaultEmail);
    setPassword('password123');
    setErrorMessage('');
  };

  const handleDemoFill = (roleKey) => {
    setSelectedRole(roleKey);
    setEmail(roleMeta[roleKey].defaultEmail);
    setPassword('password123');
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your institutional email or ID.');
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
      // Determine destination
      const destination = location.state?.from?.pathname || roleMeta[selectedRole].redirectPath;
      navigate(destination, { replace: true });
    } else {
      setErrorMessage(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a1020] text-white flex flex-col justify-center items-center p-4 relative overflow-hidden select-none font-sans">
      {/* Background ambient glow shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Brand Header */}
      <div className="text-center mb-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#172554] border border-blue-500/30 text-blue-300 text-xs font-semibold tracking-wide uppercase mb-3 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
          AI-Powered Career Operating System
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-1">
          Career<span className="text-blue-400">OS</span>
        </h1>
        <p className="text-gray-400 text-sm max-w-sm mx-auto">
          One Unified Journey: First Year Enrollment → Campus Placement.
        </p>
      </div>

      {/* Main Auth Container */}
      <div className="w-full max-w-[460px] bg-[#111a30]/90 backdrop-blur-xl border border-[#23335c] rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10 transition-all duration-300">
        
        {/* Role Selector Tabs */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2.5">
            Select Your Role
          </label>
          <div className="grid grid-cols-3 gap-2 p-1 bg-[#0a1122] rounded-xl border border-[#1e2c4d]">
            {Object.entries(roleMeta).map(([roleKey, data]) => {
              const isSelected = selectedRole === roleKey;
              return (
                <button
                  key={roleKey}
                  type="button"
                  onClick={() => handleRoleSelect(roleKey)}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg text-center transition-all duration-200 cursor-pointer ${
                    isSelected
                      ? 'bg-[#2563eb] text-white shadow-md font-semibold ring-1 ring-blue-300/40'
                      : 'text-gray-400 hover:text-white hover:bg-[#162241]'
                  }`}
                >
                  <span className="text-xl mb-1">{data.icon}</span>
                  <span className="text-xs">{data.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Role Description Banner */}
        <div className="bg-[#172344]/60 border border-[#233560] rounded-lg p-2.5 mb-5 text-xs text-blue-200/90 flex items-center gap-2.5">
          <span className="text-lg">{roleMeta[selectedRole].icon}</span>
          <div>
            <div className="font-semibold text-white">
              {roleMeta[selectedRole].label} Portal
            </div>
            <div className="text-[11px] text-gray-400">
              {roleMeta[selectedRole].description}
            </div>
          </div>
        </div>

        {/* Error Notification Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-950/80 border border-red-500/50 rounded-xl text-red-200 text-xs flex items-start gap-2.5 animate-shake">
            <span className="text-base text-red-400">⚠️</span>
            <div className="flex-1 leading-relaxed">
              <strong className="block text-red-300 font-semibold mb-0.5">Authentication Error</strong>
              {errorMessage}
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Email / Institutional ID
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={roleMeta[selectedRole].defaultEmail}
                className="w-full bg-[#0a1122] border border-[#23335c] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors"
              />
              <span className="absolute right-3.5 top-2.5 text-gray-400 text-sm pointer-events-none">
                ✉️
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#0a1122] border border-[#23335c] focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 outline-none transition-colors pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-white text-sm transition-colors cursor-pointer"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '👁️' : '🔒'}
              </button>
            </div>
          </div>

          {/* Remember Me & Assistance */}
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#23335c] bg-[#0a1122] text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
              />
              <span>Remember session</span>
            </label>
            <span className="text-gray-400 hover:text-blue-400 cursor-pointer transition-colors">
              Institutional SSO
            </span>
          </div>

          {/* Submit Button with Loading State */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-2.5 px-4 mt-2 rounded-xl text-sm font-semibold tracking-wide text-white transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              isSubmitting
                ? 'bg-blue-600/70 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 active:scale-[0.99] shadow-lg shadow-blue-600/20'
            }`}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>Authenticating with JWT...</span>
              </>
            ) : (
              <>
                <span>Sign in as {roleMeta[selectedRole].label}</span>
                <span>→</span>
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts Quick-Select Section */}
        <div className="mt-6 pt-5 border-t border-[#1c2948]">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-2.5 text-center">
            One-Click Demo Accounts
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {Object.entries(roleMeta).map(([roleKey, data]) => (
              <button
                key={roleKey}
                type="button"
                onClick={() => handleDemoFill(roleKey)}
                className={`flex items-center justify-between w-full px-3 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                  selectedRole === roleKey
                    ? 'bg-[#18264a] border-blue-500/40 text-blue-200'
                    : 'bg-[#0b1224] border-[#1e2a47] text-gray-400 hover:border-gray-600 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{data.icon}</span>
                  <span className="font-semibold text-white">{data.name}</span>
                  <span className="text-[10px] text-gray-400">({data.label})</span>
                </div>
                <span className="text-[10px] bg-[#1a2544] px-1.5 py-0.5 rounded text-blue-300 font-mono">
                  Autofill
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Register Account Link */}
        <div className="mt-5 text-center text-xs text-gray-400">
          New to CareerOS?{' '}
          <Link to="/register" className="text-blue-400 font-bold hover:underline">
            Create an Account
          </Link>
        </div>

      </div>

      {/* Footer Info */}
      <div className="text-center text-xs text-gray-500 mt-6 relative z-10">
        CareerOS v1.0 • College PBL Implementation • FastAPI + JWT + React
      </div>
    </div>
  );
};

export default LoginPage;

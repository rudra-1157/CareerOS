import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [selectedRole, setSelectedRole] = useState('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    university: 'National Institute of Technology',
    degree: 'B.Tech Computer Science',
    semester: 'Semester 3',
    targetRole: 'AI/ML Engineer',
    termsAccepted: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const roleOptions = [
    { id: 'student', label: 'Student', icon: '🎓', desc: 'AI mentor, coding arena & skill passport' },
    { id: 'faculty', label: 'Faculty', icon: '👨‍🏫', desc: 'Curriculum RAG, class monitoring & endorsements' },
    { id: 'admin', label: 'Administrator', icon: '🛡️', desc: 'University intelligence & placement oversight' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password.trim(),
        role: selectedRole,
        university: formData.university?.trim() || null,
        degree: formData.degree?.trim() || null,
        semester: formData.semester || null,
        career_goal: formData.targetRole?.trim() || null,
      });

      if (result.success) {
        if (selectedRole === 'student') navigate('/dashboard', { replace: true });
        else if (selectedRole === 'faculty') navigate('/faculty', { replace: true });
        else navigate('/admin', { replace: true });
      } else {
        setError(result.error || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1527] bg-radial-gradient flex items-center justify-center p-4 md:p-8 font-sans">
      <div className="w-full max-w-2xl bg-[#101a3b] border border-[#233567] rounded-3xl p-6 md:p-10 shadow-2xl text-white">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl">🚀</span>
            <span className="text-2xl font-black tracking-tight text-white">Career<span className="text-[#4f78ff]">OS</span></span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-2">Create Your Account</h1>
          <p className="text-sm text-[#9eb0d7]">One unified platform from your 1st year foundation to placement.</p>
        </div>

        {/* Role Selector */}
        <div className="mb-8">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#9eb0d7] mb-3">
            Select Your Institution Role
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {roleOptions.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                  selectedRole === role.id
                    ? 'bg-[#1b2b5a] border-[#4f78ff] shadow-lg shadow-[#315bdc]/20 ring-1 ring-[#4f78ff]'
                    : 'bg-[#142045] border-[#203058] hover:border-[#334b82] opacity-80 hover:opacity-100'
                }`}
              >
                <div>
                  <span className="text-2xl block mb-2">{role.icon}</span>
                  <div className="font-bold text-sm text-white">{role.label}</div>
                  <div className="text-[11px] text-[#9eb0d7] mt-1 leading-snug">{role.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-950/60 border border-red-500/50 rounded-xl text-red-200 text-xs font-medium flex items-center gap-2">
            <span>⚠️</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#b8c7e6] mb-1.5">Full Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Rudra Padhy"
                required
                className="w-full bg-[#162248] border border-[#263765] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#687a9e] focus:outline-none focus:border-[#4f78ff] focus:ring-1 focus:ring-[#4f78ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#b8c7e6] mb-1.5">Institutional Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="rudra@careeros.edu"
                required
                className="w-full bg-[#162248] border border-[#263765] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#687a9e] focus:outline-none focus:border-[#4f78ff] focus:ring-1 focus:ring-[#4f78ff]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#b8c7e6] mb-1.5">University / College</label>
              <input
                type="text"
                name="university"
                value={formData.university}
                onChange={handleChange}
                className="w-full bg-[#162248] border border-[#263765] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#687a9e] focus:outline-none focus:border-[#4f78ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#b8c7e6] mb-1.5">Degree / Branch</label>
              <input
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                placeholder="B.Tech CSE"
                className="w-full bg-[#162248] border border-[#263765] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#687a9e] focus:outline-none focus:border-[#4f78ff]"
              />
            </div>
          </div>

          {selectedRole === 'student' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#b8c7e6] mb-1.5">Current Semester</label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full bg-[#162248] border border-[#263765] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#4f78ff]"
                >
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                  <option value="Semester 3">Semester 3</option>
                  <option value="Semester 4">Semester 4</option>
                  <option value="Semester 5">Semester 5</option>
                  <option value="Semester 6">Semester 6</option>
                  <option value="Semester 7">Semester 7</option>
                  <option value="Semester 8">Semester 8</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#b8c7e6] mb-1.5">Target Career Goal</label>
                <input
                  type="text"
                  name="targetRole"
                  value={formData.targetRole}
                  onChange={handleChange}
                  placeholder="e.g. AI/ML Engineer, Full-Stack"
                  className="w-full bg-[#162248] border border-[#263765] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#687a9e] focus:outline-none focus:border-[#4f78ff]"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#b8c7e6] mb-1.5">Password *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                  required
                  className="w-full bg-[#162248] border border-[#263765] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#687a9e] focus:outline-none focus:border-[#4f78ff]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-xs text-[#9eb0d7] hover:text-white"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#b8c7e6] mb-1.5">Confirm Password *</label>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-type password"
                required
                className="w-full bg-[#162248] border border-[#263765] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#687a9e] focus:outline-none focus:border-[#4f78ff]"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={loading}
              className="bg-[#315bdc] hover:bg-[#2547b7] text-white py-3 font-bold text-sm shadow-lg shadow-[#315bdc]/30"
            >
              {loading ? 'Creating Your Account...' : `Register as ${selectedRole.toUpperCase()}`}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-[#9eb0d7]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#4f78ff] font-bold hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

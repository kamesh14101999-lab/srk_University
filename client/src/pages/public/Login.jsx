import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errors';
import { inputClass } from '../../components/FormField';

const TABS = [
  { role: 'student', label: 'Student' },
  { role: 'teacher', label: 'Teacher' },
  { role: 'admin', label: 'Admin' },
];

export default function Login() {
  const { user, login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState('student');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgot, setShowForgot] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={`/${user.role}`} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const loggedInUser = await login({ identifier, password, role, rememberMe });
      showToast(`Welcome back, ${loggedInUser.name}`);
      navigate(`/${loggedInUser.role}`);
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Image side */}
      <div className="relative hidden overflow-hidden lg:block">
        <img src="/images/campus-hero.jpg" alt="SKR University campus" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 via-primary-900/40 to-primary-800/20" />
        <div className="absolute inset-0 flex flex-col justify-between p-10">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gold-400">SKR</span>
            <span className="text-sm font-medium text-white/90">University</span>
          </Link>
          <div>
            <p className="max-w-md text-3xl font-semibold leading-tight text-white">
              Manage academics, attendance, and results — all in one portal.
            </p>
            <p className="mt-3 max-w-md text-sm text-white/70">
              Visakhapatnam, Andhra Pradesh, India
            </p>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center bg-surface px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary-700">SKR</span>
              <span className="text-sm font-medium text-gray-600">University</span>
            </Link>
          </div>

          <div className="rounded-xl bg-white p-8 shadow-md ring-1 ring-black/5">
            <h1 className="text-center text-xl font-semibold text-primary-800">Sign in to SKR University</h1>
            <p className="mt-1 text-center text-sm text-gray-500">Welcome back! Please enter your details.</p>

            <div className="mt-6 flex rounded-md bg-gray-100 p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.role}
                  type="button"
                  onClick={() => setRole(tab.role)}
                  className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
                    role === tab.role ? 'bg-white text-primary-700 shadow' : 'text-gray-500'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  {role === 'student' ? 'Student ID or Email' : role === 'teacher' ? 'Employee ID or Email' : 'Email'}
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className={inputClass}
                  placeholder={role === 'student' ? 'SKR24CSE001 or email' : role === 'teacher' ? 'SKRT001 or email' : 'admin@skruniversity.edu'}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-gray-600">
                  <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                  Remember me
                </label>
                <button type="button" onClick={() => setShowForgot((s) => !s)} className="text-primary-600 hover:underline">
                  Forgot password?
                </button>
              </div>

              {showForgot && (
                <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  Contact the university office / Admin to reset your password.
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-md bg-primary-600 py-2.5 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
              >
                {submitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            <Link to="/" className="text-primary-600 hover:underline">
              ← Back to homepage
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

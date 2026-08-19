import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { ShieldCheck, HeartPulse, Lock, Mail, ArrowRight } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { RecoveraLogo } from '../components/common/RecoveraLogo';
import { ECGBackgroundAnimation } from '../components/common/ECGBackgroundAnimation';

export const LoginPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role')?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'PATIENT';
  const [activeTab, setActiveTab] = useState<'PATIENT' | 'ADMIN'>(initialRole);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleTabChange = (tab: 'PATIENT' | 'ADMIN') => {
    setActiveTab(tab);
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      const msg = 'Please enter both your email address and password.';
      setErrorMsg(msg);
      error(msg, 'Validation Error');
      return;
    }

    setLoading(true);

    try {
      const user = await login(email.trim().toLowerCase(), password);
      success(`Welcome back, ${user.name}!`, 'Authentication Successful');

      const redirectParam = searchParams.get('redirect');

      if (user.role === 'ADMIN' || user.role === 'COORDINATOR') {
        if (redirectParam && redirectParam.startsWith('/admin')) {
          navigate(redirectParam);
        } else {
          navigate('/admin/dashboard');
        }
      } else {
        if (redirectParam && redirectParam.startsWith('/patient')) {
          navigate(redirectParam);
        } else {
          navigate('/patient/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Login error:', err);

      let msg = 'Invalid email address or password. Please try again.';

      if (!err.response) {
        msg =
          'Unable to connect to Recovera services. Please make sure the backend server is running on port 5000.';
      } else if (err.response.status === 401) {
        msg = 'Invalid email address or password. Please try again.';
      } else if (err.response.data?.message) {
        msg = err.response.data.message;
      }

      setErrorMsg(msg);
      error(msg, 'Authentication Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 overflow-hidden">
      {/* Subtle Red Animated ECG Background */}
      <ECGBackgroundAnimation opacity={0.16} color="#DC2626" />

      <div className="relative z-10 max-w-md w-full mx-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <Link to="/" className="inline-block mb-3 hover:opacity-90 transition-opacity">
            <RecoveraLogo size="lg" />
          </Link>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
            {activeTab === 'ADMIN' ? 'Hospital Care Management Portal' : 'Patient Self-Service Portal'}
          </h2>
          <p className="text-xs text-slate-500 mt-1.5">
            Sign in to track post-discharge care plans, appointments, and recovery milestones
          </p>
        </div>

        {/* Role Tabs & Form Card */}
        <div className="bg-white/95 backdrop-blur-xs rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-5">
            <button
              type="button"
              onClick={() => handleTabChange('PATIENT')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'PATIENT'
                  ? 'bg-white text-brand-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <HeartPulse className="w-3.5 h-3.5 text-brand-600" />
              Patient Portal
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('ADMIN')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'ADMIN'
                  ? 'bg-white text-brand-700 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
              Hospital Staff
            </button>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold mb-4 leading-relaxed">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                activeTab === 'ADMIN'
                  ? 'admin@recovera.health'
                  : 'patient@recovera.health'
              }
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full text-xs sm:text-sm"
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Sign In to {activeTab === 'ADMIN' ? 'Hospital Dashboard' : 'Patient Portal'}
              </Button>
            </div>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-700 font-bold hover:underline">
              Create a new registration
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

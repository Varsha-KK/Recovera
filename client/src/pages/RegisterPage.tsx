import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { User, Mail, Lock, Phone, ArrowRight, HeartPulse } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { RecoveraLogo } from '../components/common/RecoveraLogo';
import { ECGBackgroundAnimation } from '../components/common/ECGBackgroundAnimation';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const validateForm = (): string | null => {
    if (!name.trim() || name.trim().length < 2) {
      return 'Please enter your full name (minimum 2 characters).';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (!password || password.length < 6) {
      return 'Password must be at least 6 characters long.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const validationError = validateForm();
    if (validationError) {
      setErrorMsg(validationError);
      error(validationError, 'Validation Error');
      return;
    }

    setLoading(true);

    const cleanPhone = phone.trim() ? phone.trim() : undefined;

    try {
      const user = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: 'PATIENT',
        phone: cleanPhone,
      });

      success(`Welcome to Recovera, ${user.name}!`, 'Registration Complete');
      navigate('/patient/dashboard');
    } catch (err: any) {
      console.error('Registration submission error:', err);

      let msg = 'Registration failed. Please try again.';

      if (!err.response) {
        msg =
          'Unable to connect to Recovera services. Please make sure the backend server is running on port 5000.';
      } else if (err.response.status === 409) {
        msg = 'An account with this email address already exists. Please sign in instead.';
      } else if (err.response.data?.message) {
        msg = err.response.data.message;
      } else if (err.response.status === 400) {
        msg = 'Please check the entered information and try again.';
      }

      setErrorMsg(msg);
      error(msg, 'Registration Error');
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
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">Create a Patient Account</h2>
          <p className="text-xs text-slate-500 mt-1.5">
            Sign up for continuous post-discharge care tracking and appointment coordination
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white/95 backdrop-blur-xs rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold mb-4 leading-relaxed">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maria Gonzalez or John Doe"
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="patient@recovera.health"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Phone Number (Optional)"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9844328475 or +1 (555) 234-5678"
              leftIcon={<Phone className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <div className="p-3 rounded-xl bg-brand-50 border border-brand-200 flex items-center gap-2.5 text-xs text-brand-900 font-medium">
              <HeartPulse className="w-4 h-4 text-brand-600 shrink-0" />
              <span>Self-service patient registration for post-discharge recovery.</span>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full text-xs sm:text-sm"
                isLoading={loading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Complete Patient Registration
              </Button>
            </div>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already have an account or hospital staff member?{' '}
            <Link to="/login" className="text-brand-700 font-bold hover:underline">
              Sign in here
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

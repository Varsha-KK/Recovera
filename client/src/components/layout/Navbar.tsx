import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { RecoveraLogo } from '../common/RecoveraLogo';
import { Button } from '../common/Button';
import {
  Menu,
  X,
  LogOut,
  ShieldCheck,
  HeartPulse,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = [
    { label: 'How It Works', href: '/#solution' },
    { label: 'For Hospitals', href: '/#for-hospitals' },
    { label: 'For Patients', href: '/#for-patients' },
    { label: 'About', href: '/#problem' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          {isAuthenticated && onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to="/" className="group inline-flex items-center transition-transform hover:opacity-95">
            <RecoveraLogo size="md" />
          </Link>
        </div>

        {/* Public Desktop Navigation */}
        {!isAuthenticated && (
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-600">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-teal-700 transition-colors relative py-1"
              >
                {link.label}
              </a>
            ))}
          </nav>
        )}

        {/* Right Auth / CTA Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link
                to={
                  user?.role === 'ADMIN' || user?.role === 'COORDINATOR'
                    ? '/admin/dashboard'
                    : '/patient/dashboard'
                }
                className="hidden sm:inline-flex"
              >
                <Button variant="outline" size="sm" className="text-xs">
                  {user?.role === 'ADMIN' || user?.role === 'COORDINATOR'
                    ? 'Hospital Dashboard'
                    : 'Patient Portal'}
                </Button>
              </Link>

              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {user?.name}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono capitalize">
                    {user?.role}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2.5">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-xs font-semibold text-slate-700">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button
                  variant="primary"
                  size="sm"
                  className="text-xs font-semibold shadow-xs"
                >
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle (for public landing) */}
          {!isAuthenticated && (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
              aria-label="Open mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Public Menu Dropdown */}
      <AnimatePresence>
        {!isAuthenticated && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-slate-200 bg-white px-4 py-5 space-y-4 shadow-lg"
          >
            <div className="flex flex-col space-y-2.5 text-sm font-semibold text-slate-700">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-xl hover:bg-slate-50 hover:text-teal-700 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="md" className="w-full justify-center">
                  Sign In
                </Button>
              </Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" size="md" className="w-full justify-center">
                  Get Started
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;

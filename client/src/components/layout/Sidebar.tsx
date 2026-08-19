import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  PhoneCall,
  BarChart3,
  Settings,
  Clock,
  Bell,
  HeartPulse,
  LogOut,
  X,
  Key,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'COORDINATOR';

  const adminNavItems = [
    { label: 'Care Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Patient Directory', path: '/admin/patients', icon: Users },
    { label: 'Follow-Up Hub', path: '/admin/appointments', icon: CalendarDays },
    { label: 'Communications & Calls', path: '/admin/communications', icon: PhoneCall },
    { label: 'Cohort Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Outreach Integrations', path: '/admin/settings/integrations', icon: Key },
  ];

  const patientNavItems = [
    { label: 'My Care Dashboard', path: '/patient/dashboard', icon: HeartPulse },
    { label: 'My Appointments', path: '/patient/appointments', icon: CalendarDays },
    { label: 'Recovery Timeline', path: '/patient/timeline', icon: Clock },
    { label: 'Notifications', path: '/patient/notifications', icon: Bell },
    { label: 'Reminder Preferences', path: '/patient/preferences', icon: Settings },
  ];

  const navItems = isAdmin ? adminNavItems : patientNavItems;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-slate-200 p-6 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Mobile Top Header */}
          <div className="flex items-center justify-between lg:hidden pb-4 border-b border-slate-100">
            <span className="font-display font-bold text-lg text-slate-900">Navigation</span>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Mini Badge */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-xs text-slate-900 truncate">{user?.name}</div>
              <div className="text-[10px] text-slate-400 font-mono capitalize">{user?.role}</div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Sign Out */}
        <div className="pt-4 border-t border-slate-100">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

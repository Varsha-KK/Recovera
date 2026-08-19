import React from 'react';
import { Users, AlertTriangle, CalendarCheck, Clock, FileCheck, PhoneCall } from 'lucide-react';
import { AnimatedCounter } from '../common/AnimatedCounter';

interface MetricCardsProps {
  metrics: {
    totalPatients: number;
    highRiskCount: number;
    mediumRiskCount: number;
    lowRiskCount: number;
    dueTodayCount: number;
    overdueCount: number;
    pendingTestsCount: number;
    commSuccessRate: number;
  };
}

export const MetricCards: React.FC<MetricCardsProps> = ({ metrics }) => {
  const cards = [
    {
      title: 'Total Active Patients',
      value: metrics.totalPatients,
      sublabel: 'Transitional care cohort',
      icon: Users,
      color: 'text-brand-700 bg-brand-50 border-brand-200',
    },
    {
      title: 'High-Risk Patients',
      value: metrics.highRiskCount,
      sublabel: 'Priority outreach flagged',
      icon: AlertTriangle,
      color: 'text-red-700 bg-red-50 border-red-200',
      badge: 'URGENT',
    },
    {
      title: 'Follow-Ups Due Today',
      value: metrics.dueTodayCount,
      sublabel: 'Outpatient clinic schedule',
      icon: CalendarCheck,
      color: 'text-brand-700 bg-brand-50 border-brand-200',
    },
    {
      title: 'Overdue Follow-Ups',
      value: metrics.overdueCount,
      sublabel: 'Missed scheduled window',
      icon: Clock,
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    },
    {
      title: 'Pending Lab Tests',
      value: metrics.pendingTestsCount,
      sublabel: 'Pre-visit diagnostic panels',
      icon: FileCheck,
      color: 'text-brand-700 bg-brand-50 border-brand-200',
    },
    {
      title: 'Outreach Contact Rate',
      value: metrics.commSuccessRate,
      suffix: '%',
      sublabel: 'SMS & Twilio Voice',
      icon: PhoneCall,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-700">{c.title}</span>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${c.color}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-0.5 flex items-center gap-2">
                <AnimatedCounter value={c.value} suffix={c.suffix || ''} />
                {c.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-300">
                    {c.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium">{c.sublabel}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MetricCards;

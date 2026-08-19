import React from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Clock,
  Activity,
  Calendar,
  AlertTriangle,
  Pill,
  FileText,
  CalendarClock,
} from 'lucide-react';
import { formatDate, getStatusBadgeColor } from '../../utils/formatters';

export interface TimelineNode {
  id: string;
  title: string;
  description: string;
  date: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'OVERDUE' | 'UPCOMING' | 'CANCELLED';
  category: string;
  icon?: string;
  appointmentId?: string;
  appointmentStatus?: string;
}

interface CareTimelineProps {
  items: TimelineNode[];
  className?: string;
}

export const CareTimeline: React.FC<CareTimelineProps> = ({ items, className }) => {
  const getIcon = (category: string, status: string) => {
    if (status === 'COMPLETED') return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
    if (status === 'OVERDUE') return <AlertTriangle className="w-4 h-4 text-rose-600" />;
    if (status === 'IN_PROGRESS') return <Clock className="w-4 h-4 text-amber-600 animate-spin" />;

    switch (category) {
      case 'DIAGNOSIS':
        return <FileText className="w-4 h-4 text-brand-600" />;
      case 'DISCHARGE':
        return <CheckCircle2 className="w-4 h-4 text-brand-600" />;
      case 'MEDICATION':
        return <Pill className="w-4 h-4 text-indigo-600" />;
      case 'LAB_TEST':
        return <Activity className="w-4 h-4 text-cyan-600" />;
      case 'APPOINTMENT':
      default:
        return <CalendarClock className="w-4 h-4 text-purple-600" />;
    }
  };

  const getLineColor = (status: string) => {
    if (status === 'COMPLETED') return 'bg-emerald-400';
    if (status === 'OVERDUE') return 'bg-rose-400';
    if (status === 'IN_PROGRESS') return 'bg-amber-400';
    return 'bg-slate-200';
  };

  return (
    <div className={`relative pl-6 space-y-6 ${className}`}>
      {/* Central Line */}
      <div className="absolute left-2.5 top-3 bottom-3 w-0.5 bg-slate-200" />

      {items.map((node, index) => {
        const isCompleted = node.status === 'COMPLETED';
        const isOverdue = node.status === 'OVERDUE';
        const isUpcoming = node.status === 'UPCOMING' || node.status === 'PENDING';

        return (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="relative flex items-start gap-4 group"
          >
            {/* Node Icon Circle */}
            <div
              className={`absolute -left-6 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white shadow-xs transition-transform group-hover:scale-110 ${
                isCompleted
                  ? 'border-emerald-500 bg-emerald-50'
                  : isOverdue
                  ? 'border-rose-500 bg-rose-50'
                  : 'border-slate-300 bg-white'
              }`}
            >
              {getIcon(node.category, node.status)}
            </div>

            {/* Node Content Card */}
            <div
              className={`flex-1 p-4 rounded-2xl border transition-all ${
                isCompleted
                  ? 'bg-white border-slate-200/80 shadow-xs'
                  : isOverdue
                  ? 'bg-rose-50/50 border-rose-200 shadow-xs'
                  : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">{node.title}</h4>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusBadgeColor(
                      node.status
                    )}`}
                  >
                    {node.status}
                  </span>
                </div>
                <span className="text-xs font-mono font-medium text-slate-400">
                  {formatDate(node.date)}
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">{node.description}</p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

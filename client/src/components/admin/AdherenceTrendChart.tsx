import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface AdherenceTrendChartProps {
  data: { day: string; adherence: number; dropoff: number }[];
}

export const AdherenceTrendChart: React.FC<AdherenceTrendChartProps> = ({ data }) => {
  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">30-Day Follow-Up Adherence</h3>
          <p className="text-xs text-slate-500">Post-Discharge Care Loop Retention Curve</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
          87.4% Overall Retention
        </span>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="adherenceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0D9488" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#0D9488" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
            <YAxis domain={[50, 100]} tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
            <Tooltip
              formatter={(value: any) => [`${value}% Adherence`, 'Recovera Adherence']}
              contentStyle={{
                backgroundColor: '#0F172A',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
                border: 'none',
              }}
            />
            <Area
              type="monotone"
              dataKey="adherence"
              stroke="#0D9488"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#adherenceGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
          Recovera Active Intervention Adherence
        </span>
        <span className="font-mono text-slate-400">Clinical Benchmark Trend</span>
      </div>
    </div>
  );
};

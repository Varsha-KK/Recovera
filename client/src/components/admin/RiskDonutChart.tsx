import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface RiskDonutChartProps {
  data: { name: string; count: number; color: string }[];
}

export const RiskDonutChart: React.FC<RiskDonutChartProps> = ({ data }) => {
  const total = data.reduce((acc, cur) => acc + cur.count, 0);

  return (
    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Cohort Risk Distribution</h3>
          <p className="text-xs text-slate-500">Care Follow-Up Risk Stratification</p>
        </div>
        <span className="text-xs font-mono font-bold text-slate-400">{total} Patients</span>
      </div>

      <div className="h-56 relative flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={4}
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
              ))}
            </Pie>
            <Tooltip
              formatter={(val: any, name: any) => [`${val} Patients (${Math.round((Number(val)/total)*100)}%)`, name]}
              contentStyle={{
                backgroundColor: '#0F172A',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
                border: 'none',
                padding: '8px 12px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xl font-bold font-display text-slate-900">{total}</span>
          <span className="text-[10px] text-slate-400 uppercase font-semibold">Total</span>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 text-center text-xs">
        {data.map((item) => (
          <div key={item.name} className="p-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="font-bold text-slate-800">{item.count}</span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

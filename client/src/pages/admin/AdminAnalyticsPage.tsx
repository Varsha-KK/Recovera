import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { TrendingDown, BarChart3 } from 'lucide-react';

export const AdminAnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await adminService.getAnalytics();
        setAnalytics(data);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0 space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold font-display text-slate-900">
              Clinical Cohort Analytics & Adherence ROI
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Measurable reduction in care drop-off rates, chronic disease adherence curves, and channel performance
            </p>
          </div>

          {loading ? (
            <LoadingSpinner label="Computing cohort statistics..." />
          ) : (
            <>
              {/* Top Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Follow-Up Completion</div>
                  <div className="text-3xl font-bold font-display text-brand-600">87.4%</div>
                  <div className="text-xs text-emerald-600 mt-2 font-bold">
                    +29.4% vs unassisted baseline
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Care Drop-Off Prevented</div>
                  <div className="text-3xl font-bold font-display text-brand-600">-71.2%</div>
                  <div className="text-xs text-brand-700 mt-2 font-bold">
                    Across chronic disease cohorts
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">Reschedule Adherence</div>
                  <div className="text-3xl font-bold font-display text-brand-700">91.2%</div>
                  <div className="text-xs text-brand-700 mt-2 font-bold">
                    Inside clinical window
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="text-xs text-slate-500 font-bold mb-1 uppercase tracking-wider">High-Risk Escalations</div>
                  <div className="text-3xl font-bold font-display text-emerald-600">88.5%</div>
                  <div className="text-xs text-emerald-600 mt-2 font-bold">
                    Resolved by coordinators
                  </div>
                </div>
              </div>

              {/* Disease Cohort Drop-off Comparison Table */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
                  <TrendingDown className="w-5 h-5 text-brand-600" />
                  Disease Cohort Drop-Off Rate Comparison
                </h3>
                <p className="text-xs text-slate-500">
                  Comparing unassisted national baseline drop-off rates vs Recovera closed-loop intervention
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Disease / Clinical Cohort</th>
                        <th className="py-3 px-4">Standard Baseline Drop-Off</th>
                        <th className="py-3 px-4">Recovera Managed Drop-Off</th>
                        <th className="py-3 px-4">Drop-Off Reduction</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analytics?.diseaseAdherence?.map((d: any) => {
                        const reduction = Math.round(
                          ((d.baselineDropOff - d.recoveraDropOff) / d.baselineDropOff) * 100
                        );
                        return (
                          <tr key={d.disease} className="hover:bg-slate-50">
                            <td className="py-3.5 px-4 font-bold text-slate-900">{d.disease}</td>
                            <td className="py-3.5 px-4 text-slate-500 font-mono">{d.baselineDropOff}%</td>
                            <td className="py-3.5 px-4 font-bold text-brand-600 font-mono">
                              {d.recoveraDropOff}%
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">
                                -{reduction}% drop-off
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Channel Effectiveness Breakdown */}
              <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-4">
                <h3 className="text-base font-bold font-display text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-brand-600" />
                  Outreach Channel Response Efficiency
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {analytics?.channelEffectiveness?.map((ch: any) => (
                    <div
                      key={ch.channel}
                      className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3"
                    >
                      <h4 className="font-bold text-sm font-display text-slate-900">{ch.channel}</h4>
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-600">
                          <span>Delivered / Answered:</span>
                          <strong className="text-slate-900 font-mono">{ch.answeredRate}%</strong>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Patient Action Rate:</span>
                          <strong className="text-brand-700 font-mono">{ch.confirmedActionRate}%</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;

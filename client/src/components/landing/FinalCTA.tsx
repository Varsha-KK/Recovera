import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, HeartPulse, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';

export const FinalCTA: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 border border-teal-200/90 flex items-center justify-center mx-auto mb-6 shadow-xs">
          <HeartPulse className="w-6 h-6 text-teal-600" />
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-slate-900 tracking-tight mb-4">
          Don't let the next follow-up <br className="hidden sm:inline" />
          become the missed follow-up.
        </h2>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed font-normal">
          From hospital discharge to long-term recovery, Recovera prevents care drop-off, tracks
          adherence, and empowers care coordinators to act before complications arise.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3.5">
          <Link to="/register">
            <Button
              size="lg"
              variant="primary"
              className="shadow-sm font-semibold text-sm px-7"
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Start with Recovera
            </Button>
          </Link>
          <Link to="/login">
            <Button
              size="lg"
              variant="outline"
              className="bg-white text-slate-700 border-slate-300 hover:bg-slate-50 font-semibold text-sm px-6"
            >
              Sign In to Portal
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;

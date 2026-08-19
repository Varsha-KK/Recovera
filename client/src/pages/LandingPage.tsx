import React from 'react';
import { Navbar } from '../components/layout/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { ProblemSection } from '../components/landing/ProblemSection';
import { SolutionSection } from '../components/landing/SolutionSection';
import { JourneyExplorer } from '../components/landing/JourneyExplorer';
import { AudiencesSection } from '../components/landing/AudiencesSection';
import { CorePillarsSection } from '../components/landing/CorePillarsSection';
import { FinalCTA } from '../components/landing/FinalCTA';
import { Footer } from '../components/layout/Footer';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-teal-500 selection:text-white">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ProblemSection />
        <SolutionSection />
        <JourneyExplorer />
        <AudiencesSection />
        <CorePillarsSection />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;

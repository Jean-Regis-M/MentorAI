import React, { useState } from 'react';
import { ExpertDomain, DomainConfig } from '../types';
import { Briefcase, Cpu, Award, ArrowRight, Star, Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';

// Specialized mentor configs
export const DOMAIN_CONFIGS: Record<ExpertDomain, DomainConfig> = {
  business: {
    id: 'business',
    name: 'Business Strategy',
    tagline: 'Your billion-dollar board of directors, instantly prepped.',
    mentorName: 'Vance Thiel',
    avatarEmoji: '💼',
    color: 'from-blue-600 to-indigo-800',
    gradient: 'from-blue-950 via-slate-900 to-slate-950',
    bgColor: 'bg-blue-950/20',
    accentColor: 'text-indigo-400',
    starPrompts: [
      'Should I raise venture capital or bootstrap my startup?',
      'How do I price my SaaS product for high gross margins?',
      'What are the core hiring traps to avoid at Series A?'
    ]
  },
  tech: {
    id: 'tech',
    name: 'Technology Architecture',
    tagline: 'Staff-level system structures without the organizational drag.',
    mentorName: 'Ash Devlin',
    avatarEmoji: '⚡',
    color: 'from-emerald-600 to-teal-800',
    gradient: 'from-teal-950 via-slate-900 to-slate-950',
    bgColor: 'bg-emerald-950/20',
    accentColor: 'text-emerald-400',
    starPrompts: [
      'What is the optimal minimalist tech stack for immediate speed?',
      'How does Lark MCP help orchestrate tools or databases?',
      'How should I design a robust retry and circuit breaker fallback?'
    ]
  },
  career: {
    id: 'career',
    name: 'Career & Executive Leadership',
    tagline: 'Extreme ownership guidance for high-stakes negotiations.',
    mentorName: 'Maya Silva',
    avatarEmoji: '👑',
    color: 'from-amber-600 to-yellow-800',
    gradient: 'from-amber-950 via-slate-900 to-slate-950',
    bgColor: 'bg-amber-950/20',
    accentColor: 'text-amber-400',
    starPrompts: [
      'How do I negotiate secondary equity upside in a new offer?',
      'How to lead an engineering team through product refactoring?',
      'What traits separate good decision-makers from great executives?'
    ]
  }
};

interface OnboardingProps {
  onSelected: (domain: ExpertDomain, goal: string) => void;
  theme: 'immersive' | 'light';
  toggleTheme: () => void;
}

export default function Onboarding({ onSelected, theme, toggleTheme }: OnboardingProps) {
  const [selectedDomain, setSelectedDomain] = useState<ExpertDomain | null>(null);
  const [decisionGoal, setDecisionGoal] = useState('');

  const currentTheme = selectedDomain ? DOMAIN_CONFIGS[selectedDomain] : null;

  const handleLaunch = () => {
    if (selectedDomain) {
      onSelected(selectedDomain, decisionGoal || 'General mentorship guidance');
    }
  };

  return (
    <div className="min-h-screen bg-immersive-bg text-immersive-text flex flex-col justify-between p-6 relative overflow-hidden font-sans transition-colors duration-300">
      {/* Visual background flourishes (Anti-AI-Slop, clean modern alignment) */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#3B82F6]/5 to-transparent pointer-events-none" />

      {/* Top Header */}
      <header className="max-w-4xl mx-auto w-full pt-8 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-immersive-accent to-[#3B82F6] rounded-sm rotate-45 flex items-center justify-center shadow-lg shadow-immersive-accent/20">
            <div className="w-2.5 h-2.5 bg-immersive-bg rounded-full"></div>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-immersive-text-white font-sans">MentorAI</h1>
            <p className="text-[10px] font-mono tracking-widest text-immersive-dim uppercase">Self-Healing Advisor Suite</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* High contrast theme toggle button */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 bg-immersive-card border border-immersive-border hover:border-immersive-accent px-3 py-1.5 rounded-full text-[10px] font-mono text-immersive-accent cursor-pointer transition-all duration-300 shadow-sm"
            title="Toggle Light or Immersive dark mode"
          >
            {theme === 'immersive' ? (
              <>
                <Sun className="h-3 w-3 text-immersive-accent" />
                <span className="hidden sm:inline uppercase">High-Contrast Light</span>
              </>
            ) : (
              <>
                <Moon className="h-3 w-3 text-immersive-accent" />
                <span className="hidden sm:inline uppercase">Immersive Dark</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 bg-immersive-card border border-immersive-border px-3 py-1.5 rounded-full text-[10px] font-mono text-immersive-accent">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-immersive-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-immersive-accent"></span>
            </span>
            SYS_NOMINAL_0.982ms
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full py-12 flex-1 flex flex-col justify-center z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-sans font-extrabold tracking-tight text-immersive-text-white mb-4">
            Billionaire-Caliber Mentorship, <span className="bg-gradient-to-r from-immersive-accent to-[#3B82F6] bg-clip-text text-transparent">On Demand.</span>
          </h2>
          <p className="text-immersive-dim max-w-2xl mx-auto text-sm md:text-base">
            Select a specialized executive domain. Challenge MentorAI with any decision.
            Watch the system execute, self-diagnose, and deliver elite strategies recursively.
          </p>
        </div>

        {/* Domain Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {(Object.values(DOMAIN_CONFIGS) as DomainConfig[]).map((domain) => {
            const isSelected = selectedDomain === domain.id;
            return (
              <button
                key={domain.id}
                onClick={() => setSelectedDomain(domain.id)}
                className={`text-left p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden group cursor-pointer ${
                  isSelected
                    ? 'border-immersive-accent bg-immersive-card shadow-xl shadow-immersive-accent/5'
                    : 'border-immersive-border bg-immersive-aside hover:border-immersive-accent/60 hover:bg-immersive-card'
                }`}
              >
                {/* Accent top gradient on hover or select */}
                <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-immersive-accent to-[#3B82F6] opacity-80" />

                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-immersive-card border border-immersive-border text-xl">
                    {domain.avatarEmoji}
                  </div>
                  <div className="text-[10px] font-mono text-immersive-dim bg-immersive-card border border-immersive-border px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {domain.mentorName}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-immersive-text-white mb-2 font-sans">{domain.name}</h3>
                <p className="text-xs text-immersive-dim tracking-normal leading-relaxed mb-4">{domain.tagline}</p>

                <div className="flex items-center gap-1.5 text-xs font-mono text-immersive-accent group-hover:translate-x-1 transition-transform duration-300">
                  Select Suite <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Goal Setting Panel */}
        {selectedDomain && currentTheme && (
          <div className="bg-immersive-card border border-immersive-border p-6 rounded-2xl transition-all duration-300">
            <h4 className="text-xs font-mono tracking-wider text-immersive-dim uppercase mb-4 flex items-center gap-2">
              <Star className="h-3.5 w-3.5 text-immersive-accent" />
              Identify the core challenge or decision you face:
            </h4>
            <div className="space-y-4">
              <input
                type="text"
                value={decisionGoal}
                onChange={(e) => setDecisionGoal(e.target.value)}
                placeholder="e.g. Scaling my SaaS pricing matrix to target larger enterprise clients..."
                className="w-full bg-immersive-bg border border-immersive-border rounded-xl px-4 py-3 text-immersive-text placeholder-immersive-dim/60 text-sm focus:outline-none focus:border-immersive-accent hover:border-immersive-accent/50 transition-colors"
              />

              <div className="flex flex-wrap gap-2 text-xs">
                {currentTheme.starPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => setDecisionGoal(prompt)}
                    className="bg-immersive-bg border border-immersive-border hover:border-immersive-accent px-3 py-1.5 rounded-xl text-immersive-text text-left transition-colors cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleLaunch}
                className={`px-6 py-3 rounded-xl font-sans font-semibold text-sm flex items-center gap-2 transition-all duration-300 ${
                  decisionGoal.trim()
                    ? 'bg-immersive-accent text-immersive-bg font-bold cursor-pointer hover:shadow-lg hover:shadow-immersive-accent/25'
                    : 'bg-immersive-border text-immersive-dim hover:bg-immersive-border/80'
                }`}
              >
                Assemble Resilient Session
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full pb-8 pt-12 flex flex-col md:flex-row items-center justify-between text-immersive-dim text-[10px] font-mono tracking-widest z-10 gap-4">
        <div>BUILT FOR DEVNETWORK [AI + ML] HACKATHON 2026</div>
        <div className="flex gap-4">
          <span>SPONSORS: CRUSOE • TRUEFOUNDRY • LARK • PERFECT CORP</span>
        </div>
      </footer>
    </div>
  );
}

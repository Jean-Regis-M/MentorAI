import React, { useState, useEffect } from 'react';
import Onboarding from './components/Onboarding';
import ChatLayout from './components/ChatLayout';
import { ExpertDomain } from './types';

export default function App() {
  const [appState, setAppState] = useState<'onboarding' | 'chat_space'>('onboarding');
  const [selectedDomain, setSelectedDomain] = useState<ExpertDomain | null>(null);
  const [userGoal, setUserGoal] = useState('');
  const [theme, setTheme] = useState<'immersive' | 'light'>(() => {
    return (localStorage.getItem('theme') as 'immersive' | 'light') || 'immersive';
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'light') {
      root.classList.add('theme-light');
    } else {
      root.classList.remove('theme-light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'immersive' ? 'light' : 'immersive';
      localStorage.setItem('theme', next);
      return next;
    });
  };

  const handleDomainLaunch = (domain: ExpertDomain, goal: string) => {
    setSelectedDomain(domain);
    setUserGoal(goal);
    setAppState('chat_space');
  };

  const handleExitToOnboarding = () => {
    setAppState('onboarding');
    setSelectedDomain(null);
    setUserGoal('');
  };

  return (
    <div className="w-full min-h-screen bg-immersive-bg text-immersive-text selection:bg-immersive-accent/20 selection:text-immersive-accent transition-colors duration-300">
      {appState === 'onboarding' ? (
        <Onboarding 
          onSelected={handleDomainLaunch} 
          theme={theme}
          toggleTheme={toggleTheme}
        />
      ) : (
        selectedDomain && (
          <ChatLayout
            domain={selectedDomain}
            userGoal={userGoal}
            onExit={handleExitToOnboarding}
            theme={theme}
            toggleTheme={toggleTheme}
          />
        )
      )}
    </div>
  );
}

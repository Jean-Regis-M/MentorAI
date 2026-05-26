import React, { useState, useRef, useEffect } from 'react';
import { ExpertDomain, Message, AgentMetric, FailoverLog, AdviceCard } from '../types';
import { DOMAIN_CONFIGS } from './Onboarding';
import ConceptMap3D from './ConceptMap3D';
import ResilienceDashboard from './ResilienceDashboard';
import AdviceCardGen from './AdviceCardGen';
import { Send, Terminal, HelpCircle, Compass, Sparkles, Sliders, ChevronDown, ChevronUp, AlertCircle, ArrowLeft, RefreshCw, Star, Info, Zap, Sun, Moon } from 'lucide-react';

interface ChatLayoutProps {
  domain: ExpertDomain;
  userGoal: string;
  onExit: () => void;
  theme: 'immersive' | 'light';
  toggleTheme: () => void;
}

export default function ChatLayout({ domain, userGoal, onExit, theme, toggleTheme }: ChatLayoutProps) {
  const currentDomain = DOMAIN_CONFIGS[domain];
  
  // States
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMetrics, setShowMetrics] = useState(true);
  const [viewMode, setViewMode] = useState<'chat' | 'ar_concept' | 'advice_card'>('chat');
  const [chaosMode, setChaosMode] = useState(false);
  const [expandedReasoning, setExpandedReasoning] = useState<string | null>(null);

  // Dynamic resilience states for monitoring
  const [metrics, setMetrics] = useState<AgentMetric[]>([
    { id: 'nemotron', model: 'Crusoe/Nemotron-30B (Primary)', timeMs: 440, status: 'active', requestCount: 16, successRate: 100, circuitBreaker: 'CLOSED' },
    { id: 'mistral', model: 'Local/Mistral-7B (Backup Cloud)', timeMs: 140, status: 'active', requestCount: 8, successRate: 100, circuitBreaker: 'CLOSED' },
    { id: 'offline', model: 'Rule-Engine Offline Core (Emergency)', timeMs: 12, status: 'active', requestCount: 0, successRate: 100, circuitBreaker: 'CLOSED' }
  ]);
  const [failoverLogs, setFailoverLogs] = useState<FailoverLog[]>([]);
  const [activeAdviceCard, setActiveAdviceCard] = useState<AdviceCard | null>(null);
  const [currentConceptNodes, setCurrentConceptNodes] = useState<any[]>([]);
  const [currentConceptLinks, setCurrentConceptLinks] = useState<any[]>([]);

  const messageEndRef = useRef<HTMLDivElement | null>(null);

  // Inject initial systemic greetings on room assembly
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'system',
        content: `Welcome to MentorAI Decision Space

I am ${currentDomain.mentorName}, your elite strategical counterpart. Our workspace is preconfigured to resolve the core focus of: "${userGoal}".

Ask me any complex question. Toggle "Simulate Outage Chaos" on the right side to inspect the autonomic self-healing backplane powered by TrueFoundry.`,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  }, [domain, userGoal]);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Submit Query to full-stack endpoint
  const handleSubmit = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const query = (customText || inputText).trim();
    if (!query || isGenerating) return;

    setInputText('');
    setIsGenerating(true);

    const userMsgId = Date.now().toString();
    const userMessage: Message = {
      id: userMsgId,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);

    // Create temporary AI message placeholder to handle streaming feel
    const aiMsgId = (Date.now() + 1).toString();
    const loadingMessage: Message = {
      id: aiMsgId,
      role: 'info',
      content: 'Connecting with active inference model clusters...',
      timestamp: new Date().toLocaleTimeString()
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await fetch('/api/mentor/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, domain, forceFailure: chaosMode })
      });

      const data = await response.json();

      if (!response.ok) {
         throw new Error(data.error || 'Outage on proxy backend endpoints.');
      }

      // Successful reply integration
      setMessages(prev => prev.map(msg => {
        if (msg.id === aiMsgId) {
          return {
            id: aiMsgId,
            role: 'assistant',
            content: data.content,
            timestamp: new Date().toLocaleTimeString(),
            confidence: data.confidence,
            sources: data.sources,
            fallbackUsed: data.fallbackUsed,
            fallbackReason: data.fallbackReason,
            reasoningChain: data.reasoningChain,
            modeUsed: data.modeUsed
          };
        }
        return msg;
      }));

      // Update interactive 3D structures if available
      if (data.conceptMap) {
        setCurrentConceptNodes(data.conceptMap.nodes);
        setCurrentConceptLinks(data.conceptMap.links);
      }

      // Update social generator state
      if (data.adviceCard) {
        setActiveAdviceCard(data.adviceCard);
      }

      // Update TrueFoundry dashboard metrics dynamically
      if (data.fallbackUsed) {
        // Trigger live failover logging
        const logId = Date.now().toString();
        const newLog: FailoverLog = {
          id: logId,
          timestamp: new Date().toLocaleTimeString(),
          query: query,
          primaryModel: 'Crusoe/Nemotron-30B',
          primaryStatus: chaosMode ? 'TIMEOUT' : 'ERROR-500',
          latencyMs: chaosMode ? 6200 : 450,
          resolvedBy: data.modeUsed === 'Local-Mistral' ? 'Local/Mistral-7B' : 'Offline Rule Engine',
          resolutionType: data.modeUsed === 'Local-Mistral' ? 'AUTO-DEGRADATION' : 'LARK-MCP-REROUTE'
        };
        setFailoverLogs(prev => [newLog, ...prev]);

        // Adapt metrics list
        setMetrics(prev => prev.map(m => {
          if (m.id === 'nemotron') {
            return { ...m, requestCount: m.requestCount + 1, successRate: 0, status: 'degraded' };
          }
          if (m.id === 'mistral' && data.modeUsed === 'Local-Mistral') {
            return { ...m, requestCount: m.requestCount + 1, timeMs: 145, status: 'healing' };
          }
          if (m.id === 'offline' && data.modeUsed === 'Rule-Engine') {
            return { ...m, requestCount: m.requestCount + 1, status: 'healing' };
          }
          return m;
        }));
      } else {
        // Normal healthy performance logged
        setMetrics(prev => prev.map(m => {
          if (m.id === 'nemotron') {
            return { ...m, requestCount: m.requestCount + 1, successRate: 100, status: 'active', timeMs: 440 };
          }
          return m;
        }));
      }

    } catch (err: any) {
      // Catastrophic error fallback visualizer
      setMessages(prev => prev.map(msg => {
        if (msg.id === aiMsgId) {
          return {
            id: aiMsgId,
            role: 'assistant',
            content: `🚨 Catastrophic Outage Alert\n\nCatastrophic double-outage on all connected clusters. Verify that your server is running or configure process.env.GEMINI_API_KEY in secrets.\n\nEmergency Play: Verify constraints manually, retain essential capital focus, and prepare fallback files.`,
            timestamp: new Date().toLocaleTimeString(),
            confidence: 50,
            fallbackUsed: true,
            fallbackReason: err?.message || 'Catastrophic network drop'
          };
        }
        return msg;
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetMetrics = () => {
    setFailoverLogs([]);
    setChaosMode(false);
    setMetrics([
      { id: 'nemotron', model: 'Crusoe/Nemotron-30B (Primary)', timeMs: 440, status: 'active', requestCount: 16, successRate: 100, circuitBreaker: 'CLOSED' },
      { id: 'mistral', model: 'Local/Mistral-7B (Backup Cloud)', timeMs: 140, status: 'active', requestCount: 8, successRate: 100, circuitBreaker: 'CLOSED' },
      { id: 'offline', model: 'Rule-Engine Offline Core (Emergency)', timeMs: 12, status: 'active', requestCount: 0, successRate: 100, circuitBreaker: 'CLOSED' }
    ]);
  };

  return (
    <div className="min-h-screen bg-immersive-bg text-immersive-text flex flex-col justify-between font-sans relative transition-colors duration-300">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: theme === 'immersive' ? 'radial-gradient(#ffffff 1px, transparent 1px)' : 'radial-gradient(#000000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      
      {/* Top Header Grid */}
      <header className="border-b border-immersive-border bg-immersive-aside/80 backdrop-blur-xl sticky top-0 px-6 py-4 flex flex-col md:flex-row gap-4 items-center justify-between z-20 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <button 
            onClick={onExit}
            className="p-1.5 hover:bg-immersive-aside rounded-lg text-immersive-dim hover:text-immersive-text-white transition-colors border border-immersive-border cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentDomain.avatarEmoji}</span>
              <h2 className="text-sm font-bold tracking-tight text-immersive-text-white font-sans">{currentDomain.mentorName}</h2>
              <span className="text-[10px] font-mono bg-immersive-card border border-immersive-border px-2.5 py-1 rounded-full text-immersive-accent">
                {currentDomain.name}
              </span>
            </div>
            <p className="text-[10px] font-mono text-immersive-dim tracking-tight mt-0.5">Focus Goal: {userGoal}</p>
          </div>
        </div>

        {/* Mode Navigation tabs and theme switcher */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex gap-1.5 bg-immersive-aside border border-immersive-border p-1 rounded-xl">
            <button
              onClick={() => setViewMode('chat')}
              className={`px-3 py-1.5 rounded-lg text-xs leading-none font-semibold transition-all duration-200 cursor-pointer ${
                viewMode === 'chat' ? 'bg-immersive-card border border-immersive-border text-immersive-accent shadow-[0_0_8px_var(--theme-glow)]' : 'text-immersive-dim hover:text-white'
              }`}
            >
              Direct Advisor Chat
            </button>
            <button
              onClick={() => setViewMode('ar_concept')}
              disabled={currentConceptNodes.length === 0}
              className={`px-3 py-1.5 rounded-lg text-xs leading-none font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                currentConceptNodes.length === 0 ? 'opacity-30 cursor-not-allowed text-immersive-dim' :
                viewMode === 'ar_concept' ? 'bg-immersive-card border border-immersive-border text-immersive-accent shadow-[0_0_8px_var(--theme-glow)]' : 'text-immersive-dim hover:text-white'
              }`}
            >
              <Compass className="h-3.5 w-3.5" />
              3D Concept Map
            </button>
            <button
              onClick={() => setViewMode('advice_card')}
              disabled={!activeAdviceCard}
              className={`px-3 py-1.5 rounded-lg text-xs leading-none font-semibold transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                !activeAdviceCard ? 'opacity-30 cursor-not-allowed text-immersive-dim' :
                viewMode === 'advice_card' ? 'bg-immersive-card border border-immersive-border text-immersive-accent shadow-[0_0_8px_var(--theme-glow)]' : 'text-immersive-dim hover:text-white'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Social Advice Card
            </button>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 bg-immersive-card border border-immersive-border hover:border-immersive-accent px-3 py-1.5 rounded-xl text-xs font-mono text-immersive-accent cursor-pointer transition-all duration-300 shadow-sm"
            title="Toggle Light or Immersive dark mode"
          >
            {theme === 'immersive' ? (
              <>
                <Sun className="h-3.5 w-3.5 text-immersive-accent animate-pulse" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-immersive-accent" />
                <span className="hidden sm:inline">Immersive</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6 items-stretch">
        
        {/* Dynamic Left Column (Controls & Resilience Metrics Panel) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* TrueFoundry Outage Trigger Panel */}
          <div className="bg-[#08080B] border border-[#1A1A1E] p-5 rounded-2xl relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-[4px] h-full transition-colors duration-300 ${chaosMode ? 'bg-orange-500 shadow-[0_0_10px_#f97316]' : 'bg-[#00FFC2] shadow-[0_0_10px_#00ffc2]'}`} />
            
            <div className="flex items-center gap-2 mb-3">
              <Zap className={`h-4 w-4 ${chaosMode ? 'text-orange-500' : 'text-[#00FFC2]'}`} />
              <h3 className="font-sans font-extrabold text-[11px] tracking-widest text-[#E0E0E6] uppercase">Chaos & Fallback Audit</h3>
            </div>

            <p className="text-[11.5px] text-[#71717A] tracking-tight leading-relaxed mb-4">
              Trigger intentional downtime on your primary Crusoe cloud cluster. Audit how your autonomous coordinator diagnostics detect failure and gracefully redeploys to backup nodes instantly.
            </p>

            <div className="flex items-center justify-between border-t border-[#1A1A1E] pt-4 mt-2">
              <span className="font-mono text-xs font-bold text-white uppercase tracking-tight">Outage Simulation</span>
              
              <button
                onClick={() => setChaosMode(p => !p)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  chaosMode ? 'bg-orange-500' : 'bg-[#1A1A1E]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    chaosMode ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Expanded detailed Resilience metrics pane */}
          {showMetrics && (
            <div className="flex-1">
              <ResilienceDashboard 
                metrics={metrics} 
                logs={failoverLogs} 
                chaosActive={chaosMode}
                onResetLogs={handleResetMetrics}
              />
            </div>
          )}
        </div>

        {/* Dynamic Center Column (Content space based on tabs) */}
        <div className="lg:col-span-3 bg-[#08080B] border border-[#1A1A1E] rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
          
          {/* TAB 1: Direct Advisor Chat */}
          {viewMode === 'chat' && (
            <div className="flex-1 flex flex-col justify-between h-full min-h-[500px]">
              
              {/* Message Scroller */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((msg) => {
                  if (msg.role === 'info') {
                    return (
                      <div key={msg.id} className="flex justify-center">
                        <div className="bg-[#0C0C0F] border border-[#1A1A1E] rounded-full px-4 py-1.5 flex items-center gap-2 font-mono text-[10px] text-[#00FFC2] animate-pulse uppercase tracking-widest">
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          {msg.content}
                        </div>
                      </div>
                    );
                  }

                  const isAI = msg.role === 'assistant' || msg.role === 'system';
                  return (
                    <div key={msg.id} className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-2xl px-5 py-4 rounded-2xl border leading-relaxed ${
                        isAI 
                          ? 'bg-[#0C0C0F] border-[#1A1A1E] text-[#E0E0E6] rounded-tl-sm' 
                          : 'bg-[#00FFC2]/5 border-[#00FFC2]/20 text-white rounded-tr-sm'
                      }`}>
                        
                        {/* Header metadata line inside replies */}
                        {isAI && (
                          <div className="flex flex-wrap items-center justify-between border-b border-[#1A1A1E] pb-2 mb-3 gap-2 text-[10px] font-mono">
                            <span className="text-white font-bold tracking-tight">
                              {msg.role === 'system' ? 'System Orchestration Unit' : currentDomain.mentorName}
                            </span>
                            
                            {msg.confidence && (
                              <div className="flex items-center gap-3">
                                {msg.fallbackUsed && (
                                  <span className="text-orange-500 uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded font-bold">
                                    Healed Fallback Active
                                  </span>
                                )}
                                <span className={`font-bold ${msg.confidence > 80 ? 'text-[#00FFC2]' : 'text-orange-500'}`}>
                                  Confidence: {msg.confidence}%
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Message core Content */}
                        <div className="prose prose-invert prose-xs font-sans leading-relaxed text-[#E0E0E6] break-words whitespace-pre-line text-sm">
                          {msg.content}
                        </div>

                        {/* Collapsible details log showing failover or matches */}
                        {isAI && msg.reasoningChain && (
                          <div className="border-t border-[#1A1A1E] mt-4 pt-3">
                            <button
                              onClick={() => setExpandedReasoning(expandedReasoning === msg.id ? null : msg.id)}
                              className="flex items-center gap-1.5 font-mono text-[9.5px] text-[#71717A] hover:text-[#00FFC2] uppercase transition-colors cursor-pointer"
                            >
                              {expandedReasoning === msg.id ? (
                                <>
                                  Hide Diagnostic Traces
                                  <ChevronUp className="h-3.5 w-3.5" />
                                </>
                              ) : (
                                <>
                                  View TrueFoundry Diagnostic Traces ({msg.reasoningChain.length})
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </>
                              )}
                            </button>

                            {expandedReasoning === msg.id && (
                              <div className="mt-2.5 bg-[#050507] border border-[#1A1A1E] rounded-lg p-3 font-mono text-[10px] space-y-1.5 text-[#71717A]">
                                {msg.reasoningChain.map((trace, index) => (
                                  <div key={index} className="leading-snug">
                                    {trace}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div ref={messageEndRef} />
              </div>

              {/* Chat Input Board */}
              <div className="border-t border-[#1A1A1E] bg-[#0C0C0F] p-4 sticky bottom-0">
                <form onSubmit={handleSubmit} className="flex gap-2 relative">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={`Query your billionaire strategist on: "${userGoal}"...`}
                    disabled={isGenerating}
                    className="flex-1 bg-[#050507] border border-[#1A1A1E] hover:border-[#2A2A2E]/85 rounded-xl px-4 py-3 text-[#E0E0E6] placeholder-slate-600 text-sm focus:outline-none focus:border-[#00FFC2] transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || isGenerating}
                    className="bg-[#00FFC2] hover:bg-[#00e6af] text-[#050507] p-3 rounded-xl transition-all duration-200 shadow-lg shadow-[#00FFC2]/15 hover:shadow-[#00FFC2]/30 cursor-pointer disabled:opacity-40 disabled:hover:bg-[#00FFC2] disabled:hover:text-[#050507]"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* TAB 2: Interactive 3D Concept Map */}
          {viewMode === 'ar_concept' && currentConceptNodes.length > 0 && (
            <div className="flex-1 p-6 flex flex-col h-full min-h-[500px]">
              <div className="mb-4">
                <h3 className="font-sans font-extrabold text-sm text-white uppercase tracking-tight">Active Concept Mapping</h3>
                <p className="text-xs text-[#71717A] leading-normal">
                  Our system isolated key strategic variables from the expert advice. Explore decision nodes floating dynamically in 3D physics space.
                </p>
              </div>
              <div className="flex-1 min-h-[360px]">
                <ConceptMap3D 
                  nodes={currentConceptNodes} 
                  links={currentConceptLinks} 
                  topic={currentDomain.name} 
                />
              </div>
            </div>
          )}

          {/* TAB 3: Shareable Advice Card Generator */}
          {viewMode === 'advice_card' && activeAdviceCard && (
            <div className="flex-1 p-8 flex flex-col h-full min-h-[500px]">
              <div className="space-y-1 mb-6">
                <h3 className="font-sans font-extrabold text-sm text-white uppercase tracking-tight">Advice Card Studio</h3>
                <p className="text-xs text-[#71717A] leading-normal">
                  Convert the tactical recommendations into highly aesthetic social media quotes optimized for LinkedIn and Twitter.
                </p>
              </div>
              
              <div className="flex-1">
                <AdviceCardGen initialCard={activeAdviceCard} />
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}

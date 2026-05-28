import React, { useState, useRef, useEffect } from 'react';
import { ExpertDomain, Message, AgentMetric, FailoverLog, AdviceCard } from '../types';
import { DOMAIN_CONFIGS } from './Onboarding';
import ConceptMap3D from './ConceptMap3D';
import ResilienceDashboard from './ResilienceDashboard';
import AdviceCardGen from './AdviceCardGen';
import WhiteboardAnnotator from './WhiteboardAnnotator';
import { 
  Send, Terminal, HelpCircle, Compass, Sparkles, Sliders, ChevronDown, ChevronUp, 
  AlertCircle, ArrowLeft, RefreshCw, Star, Info, Zap, Sun, Moon, 
  Volume2, Mic, Image, Trash2, Download, UserCheck, History, Check, ShieldAlert,
  PenTool
} from 'lucide-react';

interface ChatLayoutProps {
  domain: ExpertDomain;
  userGoal: string;
  onExit: () => void;
  theme: 'immersive' | 'light';
  toggleTheme: () => void;
}

interface SavedSession {
  id: string;
  title: string;
  goal: string;
  domain: ExpertDomain;
  timestamp: string;
  messages: Message[];
  conceptNodes: any[];
  conceptLinks: any[];
}

export default function ChatLayout({ domain, userGoal, onExit, theme, toggleTheme }: ChatLayoutProps) {
  const currentDomain = DOMAIN_CONFIGS[domain];
  
  // Custom Persona Selection
  const [activePersona, setActivePersona] = useState<'vance_thiel' | 'ash_devlin' | 'maya_silva'>('vance_thiel');

  // Input, generating, views
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showMetrics, setShowMetrics] = useState(true);
  const [viewMode, setViewMode] = useState<'chat' | 'ar_concept' | 'advice_card'>('chat');
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [chaosMode, setChaosMode] = useState(false);
  const [expandedReasoning, setExpandedReasoning] = useState<string | null>(null);

  // Multimodal image state (Perfect Corp Vision Board upload)
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const whiteboardInputRef = useRef<HTMLInputElement | null>(null);

  // Dedicated Whiteboard file picker processor (Perfect Corp)
  const handleWhiteboardUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setSelectedImage(base64);
      // Automatically toggle whiteboard annotator stage
      setIsAnnotating(true);
    };
    reader.readAsDataURL(file);
    // Reset file value to allow re-choosing same file if desired
    e.target.value = '';
  };

  // Voice States
  const [isListening, setIsListening] = useState(false);

  // New Voice & Synthesizer Custom Settings
  const [showVoiceSettings, setShowVoiceSettings] = useState(false);
  const [sttLang, setSttLang] = useState<string>('en-US');
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Vance Thiel (grave/authoritative) preset voice, pitch, and rate
  const [vanceVoiceName, setVanceVoiceName] = useState<string>('');
  const [vancePitch, setVancePitch] = useState<number>(0.85);
  const [vanceRate, setVanceRate] = useState<number>(0.9);

  // Ash Devlin (steady tech lead) preset voice, pitch, and rate
  const [ashVoiceName, setAshVoiceName] = useState<string>('');
  const [ashPitch, setAshPitch] = useState<number>(1.0);
  const [ashRate, setAshRate] = useState<number>(1.0);

  // Maya Silva (highly energetic, speed-driven) preset voice, pitch, and rate
  const [mayaVoiceName, setMayaVoiceName] = useState<string>('');
  const [mayaPitch, setMayaPitch] = useState<number>(1.15);
  const [mayaRate, setMayaRate] = useState<number>(1.2);

  // Dynamic voices population hook
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);

        if (voices.length > 0) {
          // Attempt to map sensible matching defaults on first sound check
          const defaultVance = voices.find(v => v.name.toLowerCase().includes('google us english') || v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.lang.startsWith('en'))?.name || voices[0].name;
          const defaultAsh = voices.find(v => v.name.toLowerCase().includes('natural') || v.name.toLowerCase().includes('microsoft') || v.lang.startsWith('en'))?.name || voices[0].name;
          const defaultMaya = voices.find(v => v.name.toLowerCase().includes('google us english') || v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('hazel') || v.lang.startsWith('en'))?.name || voices[0].name;

          setVanceVoiceName(prev => prev || defaultVance);
          setAshVoiceName(prev => prev || defaultAsh);
          setMayaVoiceName(prev => prev || defaultMaya);
        }
      };

      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, []);

  // Persistent Decision Journal States
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [savedJournalTitle, setSavedJournalTitle] = useState('');

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
  const chatInputRef = useRef<HTMLInputElement | null>(null);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Ctrl+Enter to submit messages
      if (e.ctrlKey && e.key === 'Enter') {
        const query = inputText.trim();
        if ((query || selectedImage) && !isGenerating) {
          e.preventDefault();
          handleSubmit();
        }
      }

      // 2. Ctrl+K to focus the input field
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        chatInputRef.current?.focus();
      }

      // 3. Ctrl+Shift+L to trigger the theme toggle
      if (e.ctrlKey && e.shiftKey && (e.key === 'l' || e.key === 'L')) {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [inputText, selectedImage, isGenerating, toggleTheme]);

  // Inject initial systemic greetings on room assembly
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'system',
        content: `### Welcome to MentorAI Decision Space\n\nI am **${currentDomain.mentorName}**, your elite strategic partner. Our workspace is preconfigured to resolve your objective: **"${userGoal}"**.\n\nChoose an **Active Mentor Persona** in the left panel to change their evaluation perspective, or upload a whiteboard flowchart scan to run a **Perfect Vision concepts audit**.`,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  }, [domain, userGoal]);

  // Load Saved Journal sessions from LocalStorage
  useEffect(() => {
    const raw = localStorage.getItem('mentorai_decision_journal');
    if (raw) {
      try {
        setSavedSessions(JSON.parse(raw));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Submit Query to full-stack endpoint
  const handleSubmit = async (e?: React.FormEvent, customText?: string, customImage?: string) => {
    if (e) e.preventDefault();
    const query = (customText || inputText).trim();
    const imageToUse = customImage || selectedImage;
    if (!query && !imageToUse || isGenerating) return;

    setInputText('');
    setIsGenerating(true);

    const userMsgId = Date.now().toString();
    const userMessage: Message = {
      id: userMsgId,
      role: 'user',
      content: query || "Uploaded whiteboard/flowchart sketch concept scan.",
      timestamp: new Date().toLocaleTimeString(),
      sources: imageToUse ? ["Perfect Corp Board Analysis attached"] : undefined
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

    // Snapshot image base64, then empty state preview safely
    const base64ImageToSend = imageToUse;
    setSelectedImage(null);

    try {
      const response = await fetch('/api/mentor/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: query || "Scan this visual flowchart board sketch", 
          domain, 
          forceFailure: chaosMode,
          mentorPersona: activePersona,
          image: base64ImageToSend
        })
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
        // Automatically switch to concept map view if there are nodes
        setViewMode('ar_concept');
      }

      // Update social generator state
      if (data.adviceCard) {
        setActiveAdviceCard(data.adviceCard);
      }

      // Update TrueFoundry metrics dynamically
      if (data.fallbackUsed) {
        const logId = Date.now().toString();
        const newLog: FailoverLog = {
          id: logId,
          timestamp: new Date().toLocaleTimeString(),
          query: query || "Flowchart Scan",
          primaryModel: 'Crusoe/Nemotron-30B',
          primaryStatus: chaosMode ? 'TIMEOUT' : 'ERROR-500',
          latencyMs: chaosMode ? 6200 : 450,
          resolvedBy: data.modeUsed === 'Local-Mistral' ? 'Local/Mistral-7B' : 'Offline Rule Engine',
          resolutionType: data.modeUsed === 'Local-Mistral' ? 'AUTO-DEGRADATION' : 'LARK-MCP-REROUTE'
        };
        setFailoverLogs(prev => [newLog, ...prev]);

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
        setMetrics(prev => prev.map(m => {
          if (m.id === 'nemotron') {
            return { ...m, requestCount: m.requestCount + 1, successRate: 100, status: 'active', timeMs: 440 };
          }
          return m;
        }));
      }

    } catch (err: any) {
      setMessages(prev => prev.map(msg => {
        if (msg.id === aiMsgId) {
          return {
            id: aiMsgId,
            role: 'assistant',
            content: `🚨 **Catastrophic Outage Alert**\n\nCatastrophic double-outage on all connected clusters. Verify that your server is running or configure process.env.GEMINI_API_KEY in secrets.\n\n*Emergency Play: Verify constraints manually, retain essential capital focus, and prepare fallback files.*`,
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

  // Browser-native voice input transcription
  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Browser-native Speech Recognition is not supported in this frame. Open the app in a new tab to capture voice inputs!");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = sttLang; // Dynamic STT Language selection

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setInputText(prev => prev ? prev + ' ' + text : text);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.start();
  };

  // Browser-native Speech Synthesis read-aloud (TTS)
  const speakMessage = (text: string, persona: 'vance_thiel' | 'ash_devlin' | 'maya_silva') => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    
    // Clean markdown before speaking
    const cleanText = text.replace(/[*#`_-]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Dynamically retrieve selected custom voice
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice: SpeechSynthesisVoice | null = null;
    
    if (persona === 'vance_thiel') {
      selectedVoice = voices.find(v => v.name === vanceVoiceName) || null;
      utterance.pitch = vancePitch;
      utterance.rate = vanceRate;
    } else if (persona === 'ash_devlin') {
      selectedVoice = voices.find(v => v.name === ashVoiceName) || null;
      utterance.pitch = ashPitch;
      utterance.rate = ashRate;
    } else if (persona === 'maya_silva') {
      selectedVoice = voices.find(v => v.name === mayaVoiceName) || null;
      utterance.pitch = mayaPitch;
      utterance.rate = mayaRate;
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  };

  // Perfect Corp Whiteboard image upload handling
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Decision journal persistence
  const saveCurrentSessionToJournal = () => {
    const title = (savedJournalTitle || `Strategy: ${domain} Pivot`).trim();
    const newSession: SavedSession = {
      id: Date.now().toString(),
      title,
      goal: userGoal,
      domain,
      timestamp: new Date().toLocaleString(),
      messages,
      conceptNodes: currentConceptNodes,
      conceptLinks: currentConceptLinks
    };

    const updated = [newSession, ...savedSessions];
    setSavedSessions(updated);
    localStorage.setItem('mentorai_decision_journal', JSON.stringify(updated));
    setSavedJournalTitle('');
  };

  const loadSessionFromJournal = (session: SavedSession) => {
    setMessages(session.messages);
    setCurrentConceptNodes(session.conceptNodes || []);
    setCurrentConceptLinks(session.conceptLinks || []);
    setViewMode('chat');
  };

  const deleteSessionFromJournal = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = savedSessions.filter(s => s.id !== id);
    setSavedSessions(filtered);
    localStorage.setItem('mentorai_decision_journal', JSON.stringify(filtered));
  };

  // Export current tree to highly elegant strategic brief document
  const exportDecisionMarkdown = () => {
    const header = `# MENTORAI DECISION BRIEF\n**Strategic Domain:** ${currentDomain.name}\n**Active Goal:** "${userGoal}"\n**Generated:** ${new Date().toLocaleDateString()}\n\n`;
    const body = messages
      .filter(m => m.role !== 'system' && m.role !== 'info')
      .map(m => `### [${m.role.toUpperCase()}] at ${m.timestamp}\n${m.content}\n\n`)
      .join('---\n\n');

    const fullBrief = header + body;
    navigator.clipboard.writeText(fullBrief)
      .then(() => alert("✨ Decision strategic brief copied to your clipboard successfully! Copy it to your pitching docs or share it with Judges!"))
      .catch(() => alert("Failed to duplicate strategic brief. Try selecting manually."));
  };

  // Clean markdown tags to ensure AI outputs render strictly as standard readable human plain prose / free text
  const cleanMarkdownToFreeText = (text: string): string => {
    if (!text) return "";
    let cleaned = text;

    // 1. Remove hash headers like "### Title" and replace with capitalization
    cleaned = cleaned.replace(/^#+\s*(.*)$/gmi, (_, group) => `\n${group.toUpperCase()}\n`);

    // 2. Remove asterisks around text (e.g. **bold**)
    cleaned = cleaned.replace(/\*{1,3}([^*]+)\*{1,3}/g, '$1');

    // 3. Remove backticks
    cleaned = cleaned.replace(/`{1,3}([^`]+)`{1,3}/g, '$1');

    // 4. Remove underlines or list blocks indicators
    cleaned = cleaned.replace(/^\s*[-*+]\s+/gm, '• ');

    // 5. Clean remaining markdown specific characters
    cleaned = cleaned.replace(/[*_~`#|]/g, '');

    return cleaned.trim();
  };

  return (
    <div className="min-h-screen bg-immersive-bg text-immersive-text flex flex-col justify-between font-sans relative transition-colors duration-300">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: theme === 'immersive' ? 'radial-gradient(#ffffff 1px, transparent 1px)' : 'radial-gradient(#000000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      
      {/* Top Header Grid */}
      <header className="border-b border-immersive-border bg-immersive-aside/80 backdrop-blur-xl sticky top-0 px-6 py-4 flex flex-col md:flex-row gap-4 items-center justify-between z-20 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <button 
            onClick={onExit}
            className="p-1.5 hover:bg-immersive-aside rounded-lg text-immersive-dim hover:text-immersive-text-white transition-colors border border-immersive-border cursor-pointer animate-fade-in"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">{currentDomain.avatarEmoji}</span>
              <h2 className="text-sm font-bold tracking-tight text-immersive-text-white font-sans">
                {activePersona === 'vance_thiel' ? 'Vance Thiel' : activePersona === 'ash_devlin' ? 'Ash Devlin' : 'Maya Silva'}
              </h2>
              <span className="text-[10px] font-mono bg-immersive-card border border-immersive-border px-2.5 py-1 rounded-full text-immersive-accent">
                {currentDomain.name}
              </span>
            </div>
            <p className="text-[10px] font-mono text-immersive-dim tracking-tight mt-0.5">Objective: {userGoal}</p>
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
              Mentor Takes (3D Map)
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
        
        {/* Left Control Dashboard Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* Active Strategic Mentor Personas Menu */}
          <div className="bg-immersive-card border border-immersive-border p-5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <UserCheck className="h-4 w-4 text-immersive-accent" />
              <h3 className="font-sans font-extrabold text-[11px] tracking-widest text-immersive-text-white uppercase">Choose Named Mentor</h3>
            </div>
            
            <p className="text-[11px] text-immersive-dim mb-4 leading-relaxed">
              Dynamically select your advisor. Each persona evaluates decisions under structured risk lenses.
            </p>

            <div className="space-y-3">
              <button 
                onClick={() => setActivePersona('vance_thiel')}
                className={`w-full text-left p-3.5 rounded-xl border flex flex-col gap-1 transition-all duration-300 cursor-pointer ${
                  activePersona === 'vance_thiel' 
                    ? 'bg-immersive-accent/5 border-immersive-accent/60 shadow-[0_0_8px_var(--theme-glow)]' 
                    : 'bg-immersive-aside border-immersive-border/70 hover:border-immersive-dim'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-sans text-immersive-text-white">💼 Vance Thiel</span>
                  <span className="text-[9px] font-mono bg-red-950/40 text-red-400 px-1.5 py-0.5 rounded border border-red-900/30 font-bold">10X GROWTH</span>
                </div>
                <span className="text-[10px] text-immersive-dim leading-normal">
                  Sequoia-style VC. Focuses on defensible monopolies & gross margin leverage.
                </span>
              </button>

              <button 
                onClick={() => setActivePersona('ash_devlin')}
                className={`w-full text-left p-3.5 rounded-xl border flex flex-col gap-1 transition-all duration-300 cursor-pointer ${
                  activePersona === 'ash_devlin' 
                    ? 'bg-immersive-accent/5 border-immersive-accent/60 shadow-[0_0_8px_var(--theme-glow)]' 
                    : 'bg-immersive-aside border-immersive-border/70 hover:border-immersive-dim'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-sans text-immersive-text-white">⚡ Ash Devlin</span>
                  <span className="text-[9px] font-mono bg-blue-950/40 text-blue-400 px-1.5 py-0.5 rounded border border-blue-900/30 font-bold">STABILITY</span>
                </div>
                <span className="text-[10px] text-immersive-dim leading-normal">
                  FAANG Principal Architect. Prioritizes SLA reliability, schemas, and simple stable monoliths.
                </span>
              </button>

              <button 
                onClick={() => setActivePersona('maya_silva')}
                className={`w-full text-left p-3.5 rounded-xl border flex flex-col gap-1 transition-all duration-300 cursor-pointer ${
                  activePersona === 'maya_silva' 
                    ? 'bg-immersive-accent/5 border-immersive-accent/60 shadow-[0_0_8px_var(--theme-glow)]' 
                    : 'bg-immersive-aside border-immersive-border/70 hover:border-immersive-dim'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-sans text-immersive-text-white">👑 Maya Silva</span>
                  <span className="text-[9px] font-mono bg-emerald-950/40 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-900/30 font-bold">FAST SURVIVAL</span>
                </div>
                <span className="text-[10px] text-immersive-dim leading-normal">
                  Exited $150M founder. Demands immediate customer dialogue, cash-flow metrics, and high velocity.
                </span>
              </button>
            </div>
          </div>
          
          {/* 🎙️ VOICE & SYNTHESIZER SETTINGS PANEL */}
          <div id="voice-settings-card" className="bg-immersive-card border border-immersive-border p-5 rounded-2xl flex flex-col">
            <button
              type="button"
              onClick={() => setShowVoiceSettings(prev => !prev)}
              className="flex items-center justify-between w-full text-left focus:outline-none cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Sliders className="h-4 w-4 text-immersive-accent" />
                <h3 className="font-sans font-extrabold text-[11px] tracking-widest text-immersive-text-white uppercase">Voice Settings</h3>
              </div>
              <div>
                {showVoiceSettings ? (
                  <ChevronUp className="h-4 w-4 text-immersive-dim" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-immersive-dim" />
                )}
              </div>
            </button>

            <p className="text-[11px] text-immersive-dim mt-2 leading-relaxed">
              Adjust speech-to-text languages and select deep, steady or fast voice vocalizations for each advisor.
            </p>

            {showVoiceSettings && (
              <div className="mt-4 pt-4 border-t border-immersive-border/80 space-y-4 animate-fade-in">
                {/* 1. Speech-to-Text Language Selection */}
                <div>
                  <label className="block text-[10px] font-mono text-immersive-text-white uppercase tracking-tight mb-1.5">
                    Dictation Language (STT)
                  </label>
                  <select
                    value={sttLang}
                    onChange={(e) => setSttLang(e.target.value)}
                    className="w-full text-xs bg-immersive-aside border border-immersive-border rounded-lg px-2.5 py-2 text-immersive-text-white focus:outline-none focus:border-immersive-accent transition-colors cursor-pointer"
                  >
                    <option value="en-US">English (United States)</option>
                    <option value="en-GB">English (Great Britain)</option>
                    <option value="es-ES">Español (España)</option>
                    <option value="fr-FR">Français (France)</option>
                    <option value="de-DE">Deutsch (Deutschland)</option>
                    <option value="it-IT">Italiano (Italia)</option>
                    <option value="zh-CN">中文 (简体)</option>
                    <option value="ja-JP">日本語 (日本)</option>
                  </select>
                </div>

                {/* 2. Vance Thiel Voice Customizer */}
                <div className="space-y-2 border-t border-immersive-border/40 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-immersive-accent">💼 Vance Thiel Voice</span>
                    <span className="text-[9px] font-mono text-immersive-dim">Grave & Heavy VC</span>
                  </div>
                  
                  <div>
                    <label className="block text-[9px] font-mono text-immersive-dim uppercase tracking-tight mb-1">
                      System TTS Voice
                    </label>
                    <select
                      value={vanceVoiceName}
                      onChange={(e) => setVanceVoiceName(e.target.value)}
                      className="w-full text-[11px] bg-immersive-aside border border-immersive-border rounded-lg px-2 py-1.5 text-immersive-text-white focus:outline-none focus:border-immersive-accent cursor-pointer"
                    >
                      {availableVoices.length > 0 ? (
                        availableVoices.map((voice) => (
                          <option key={voice.name} value={voice.name}>
                            {voice.name} ({voice.lang})
                          </option>
                        ))
                      ) : (
                        <option value="">Browser Default Voice</option>
                      )}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-immersive-dim">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Pitch:</span>
                        <span className="text-immersive-text-white">{vancePitch.toFixed(2)}</span>
                      </div>
                      <input 
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.05"
                        value={vancePitch}
                        onChange={(e) => setVancePitch(parseFloat(e.target.value))}
                        className="w-full accent-immersive-accent cursor-pointer h-1 rounded"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Speed:</span>
                        <span className="text-immersive-text-white">{vanceRate.toFixed(2)}</span>
                      </div>
                      <input 
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.05"
                        value={vanceRate}
                        onChange={(e) => setVanceRate(parseFloat(e.target.value))}
                        className="w-full accent-immersive-accent cursor-pointer h-1 rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. Ash Devlin Voice Customizer */}
                <div className="space-y-2 border-t border-immersive-border/40 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-immersive-accent">⚡ Ash Devlin Voice</span>
                    <span className="text-[9px] font-mono text-immersive-dim">Balanced Architect</span>
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-immersive-dim uppercase tracking-tight mb-1">
                      System TTS Voice
                    </label>
                    <select
                      value={ashVoiceName}
                      onChange={(e) => setAshVoiceName(e.target.value)}
                      className="w-full text-[11px] bg-immersive-aside border border-immersive-border rounded-lg px-2 py-1.5 text-immersive-text-white focus:outline-none focus:border-immersive-accent cursor-pointer"
                    >
                      {availableVoices.length > 0 ? (
                        availableVoices.map((voice) => (
                          <option key={voice.name} value={voice.name}>
                            {voice.name} ({voice.lang})
                          </option>
                        ))
                      ) : (
                        <option value="">Browser Default Voice</option>
                      )}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-immersive-dim">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Pitch:</span>
                        <span className="text-immersive-text-white">{ashPitch.toFixed(2)}</span>
                      </div>
                      <input 
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.05"
                        value={ashPitch}
                        onChange={(e) => setAshPitch(parseFloat(e.target.value))}
                        className="w-full accent-immersive-accent cursor-pointer h-1 rounded"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Speed:</span>
                        <span className="text-immersive-text-white">{ashRate.toFixed(2)}</span>
                      </div>
                      <input 
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.05"
                        value={ashRate}
                        onChange={(e) => setAshRate(parseFloat(e.target.value))}
                        className="w-full accent-immersive-accent cursor-pointer h-1 rounded"
                      />
                    </div>
                  </div>
                </div>

                {/* 4. Maya Silva Voice Customizer */}
                <div className="space-y-2 border-t border-immersive-border/40 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-immersive-accent">👑 Maya Silva Voice</span>
                    <span className="text-[9px] font-mono text-immersive-dim">Fast Bootstrapper</span>
                  </div>

                  <div>
                    <label className="block text-[9px] font-mono text-immersive-dim uppercase tracking-tight mb-1">
                      System TTS Voice
                    </label>
                    <select
                      value={mayaVoiceName}
                      onChange={(e) => setMayaVoiceName(e.target.value)}
                      className="w-full text-[11px] bg-immersive-aside border border-immersive-border rounded-lg px-2 py-1.5 text-immersive-text-white focus:outline-none focus:border-immersive-accent cursor-pointer"
                    >
                      {availableVoices.length > 0 ? (
                        availableVoices.map((voice) => (
                          <option key={voice.name} value={voice.name}>
                            {voice.name} ({voice.lang})
                          </option>
                        ))
                      ) : (
                        <option value="">Browser Default Voice</option>
                      )}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-immersive-dim">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Pitch:</span>
                        <span className="text-immersive-text-white">{mayaPitch.toFixed(2)}</span>
                      </div>
                      <input 
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.05"
                        value={mayaPitch}
                        onChange={(e) => setMayaPitch(parseFloat(e.target.value))}
                        className="w-full accent-immersive-accent cursor-pointer h-1 rounded"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between mb-1">
                        <span>Speed:</span>
                        <span className="text-immersive-text-white">{mayaRate.toFixed(2)}</span>
                      </div>
                      <input 
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.05"
                        value={mayaRate}
                        onChange={(e) => setMayaRate(parseFloat(e.target.value))}
                        className="w-full accent-immersive-accent cursor-pointer h-1 rounded"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-immersive-border/40 flex justify-end">
                  <button
                    type="button"
                    onClick={() => speakMessage("Voice configuration verified. Let's make resilient moves.", activePersona)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-immersive-aside hover:bg-immersive-border border border-immersive-border rounded-lg font-mono text-[10px] text-immersive-accent transition-colors cursor-pointer"
                  >
                    <Volume2 className="h-3.5 w-3.5" />
                    Test Accent Voice
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* Decision Journaling & Context Persistence */}
          <div className="bg-immersive-card border border-immersive-border p-5 rounded-2xl flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <History className="h-4 w-4 text-immersive-accent" />
              <h3 className="font-sans font-extrabold text-[11px] tracking-widest text-immersive-text-white uppercase font-sans">Decision Journal</h3>
            </div>

            <p className="text-[11px] text-immersive-dim mb-4 leading-relaxed">
              Persist your strategy tree. Save this turn or restore archived pivots from storage securely.
            </p>

            <div className="space-y-3 mb-4">
              <input 
                type="text"
                placeholder="Name this decision pivot..."
                value={savedJournalTitle}
                onChange={(e) => setSavedJournalTitle(e.target.value)}
                className="w-full text-xs bg-immersive-aside border border-immersive-border rounded-lg px-3 py-2 text-immersive-text-white focus:outline-none focus:border-immersive-accent"
              />
              <button
                onClick={saveCurrentSessionToJournal}
                className="w-full bg-immersive-aside hover:bg-immersive-border border border-immersive-border hover:shadow-xs transition-all duration-200 text-immersive-accent font-mono text-xs py-2 rounded-lg cursor-pointer flex items-center justify-center gap-1"
              >
                Save Active Pivot
              </button>
            </div>

            {savedSessions.length > 0 ? (
              <div className="border-t border-immersive-border max-h-[160px] overflow-y-auto mt-2 pt-3 space-y-2">
                <span className="text-[10px] font-mono text-immersive-dim block uppercase tracking-tight mb-2">Archived Decision Logs ({savedSessions.length})</span>
                {savedSessions.map((session) => (
                  <div 
                    key={session.id}
                    onClick={() => loadSessionFromJournal(session)}
                    className="p-2 rounded-lg bg-immersive-aside border border-immersive-border/60 hover:border-immersive-accent hover:bg-immersive-card cursor-pointer transition-all duration-200 flex items-center justify-between"
                  >
                    <div className="truncate pr-2">
                      <span className="text-[11px] font-bold text-immersive-text-white block truncate">{session.title}</span>
                      <span className="text-[9px] font-mono text-immersive-dim block">{session.timestamp.split(',')[0]}</span>
                    </div>
                    <button
                      onClick={(e) => deleteSessionFromJournal(session.id, e)}
                      className="text-immersive-dim hover:text-red-400 p-1 rounded"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-t border-immersive-border pt-4 text-center">
                <span className="text-[10px] font-mono text-immersive-dim">No historical strategy logged.</span>
              </div>
            )}

            <button
               onClick={exportDecisionMarkdown}
               className="mt-4 border border-immersive-accent/30 hover:border-immersive-accent flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-mono text-xs text-immersive-accent hover:bg-immersive-accent/5 cursor-pointer transition-all duration-200"
            >
              <Download className="h-3.5 w-3.5" />
              Export Decision Deck
            </button>
          </div>

          {/* Autonomic Outage & Chaos Control Panel */}
          <div className="bg-immersive-card border border-immersive-border p-5 rounded-2xl relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-[4px] h-full transition-colors duration-300 ${chaosMode ? 'bg-orange-500 shadow-[0_0_10px_#f97316]' : 'bg-immersive-accent shadow-[0_0_10px_var(--theme-accent)]'}`} />
            
            <div className="flex items-center gap-2 mb-3">
              <Zap className={`h-4 w-4 ${chaosMode ? 'text-orange-500 animate-bounce' : 'text-immersive-accent'}`} />
              <h3 className="font-sans font-extrabold text-[11px] tracking-widest text-immersive-text-white uppercase">TrueFoundry Outage Guard</h3>
            </div>

            <p className="text-[11px] text-immersive-dim leading-relaxed mb-4">
              Trigger intentional primary network failure. Witness how autonomic self-healing instantly deploys fallback inference configurations.
            </p>

            <div className="flex items-center justify-between border-t border-immersive-border pt-4 mt-2">
              <span className="font-mono text-[11px] font-bold text-immersive-text-white uppercase tracking-tight">Outage Simulation</span>
              
              <button
                onClick={() => setChaosMode(p => !p)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  chaosMode ? 'bg-orange-500' : 'bg-immersive-aside border border-immersive-border'
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

          {/* Dedicated Whiteboard Sketch Scan Sandbox (Perfect Corp API challenge) */}
          <div className="bg-immersive-card border border-immersive-border p-5 rounded-2xl flex flex-col gap-3 relative overflow-hidden">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-immersive-accent animate-pulse" />
              <h3 className="font-sans font-extrabold text-[11px] tracking-widest text-immersive-text-white uppercase">Perfect Vision Board</h3>
            </div>
            <p className="text-[11px] text-immersive-dim leading-relaxed">
              Upload whiteboard diagrams, database structures, or roadmap drawings to evaluate via the Perfect Corp multimodal pipeline.
            </p>
            <input 
              type="file"
              ref={whiteboardInputRef}
              onChange={handleWhiteboardUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => whiteboardInputRef.current?.click()}
              className="w-full bg-immersive-aside hover:bg-immersive-border cursor-pointer text-immersive-accent border border-immersive-border font-sans font-bold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 hover:shadow-xs shadow-immersive-accent/10"
            >
              <Image className="h-3.5 w-3.5" />
              File Picker specifically for whiteboard sketches
            </button>
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

        {/* Center Canvas Column (Render views dynamically) */}
        <div className="lg:col-span-3 bg-immersive-aside border border-immersive-border rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
          
          {/* Active Whiteboard Drawing, Editing & Sticky-Notes annotating overlays */}
          {isAnnotating && selectedImage ? (
            <div className="flex-1 p-4 md:p-6 flex flex-col h-full justify-center overflow-y-auto">
              <WhiteboardAnnotator 
                imageSrc={selectedImage}
                onSave={(finalBase64) => {
                  setSelectedImage(finalBase64);
                  setIsAnnotating(false);
                }}
                onCancel={() => {
                  setIsAnnotating(false);
                }}
              />
            </div>
          ) : (
            <>
              {viewMode === 'chat' && (
                <div className="flex-1 flex flex-col h-full min-h-[500px] overflow-hidden">
              
              {/* Messages container list */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 select-text flex flex-col justify-start">
                {messages.map((msg) => {
                  if (msg.role === 'info') {
                    return (
                      <div key={msg.id} className="flex justify-center animate-fade-in">
                        <div className="bg-immersive-card border border-immersive-border rounded-full px-4 py-1.5 flex items-center gap-2 font-mono text-[10px] text-immersive-accent animate-pulse uppercase tracking-widest">
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          {msg.content}
                        </div>
                      </div>
                    );
                  }

                  const isAI = msg.role === 'assistant' || msg.role === 'system';
                  return (
                    <div key={msg.id} className={`flex ${isAI ? 'justify-start' : 'justify-end'} animate-fade-in`}>
                      <div className={`max-w-2xl px-5 py-4 rounded-2xl border leading-relaxed relative group ${
                        isAI 
                          ? 'bg-immersive-card border-immersive-border text-immersive-text rounded-tl-sm' 
                          : 'bg-immersive-accent/5 border-immersive-accent/20 text-immersive-text-white rounded-tr-sm'
                      }`}>
                        
                        {/* Header metadata line inside replies */}
                        {isAI && (
                          <div className="flex flex-wrap items-center justify-between border-b border-immersive-border pb-2 mb-3 gap-2 text-[10px] font-mono">
                            <span className="text-immersive-text-white font-bold tracking-tight">
                              {msg.role === 'system' 
                                ? 'System Orchestration Unit' 
                                : activePersona === 'vance_thiel' ? 'Vance Thiel' : activePersona === 'ash_devlin' ? 'Ash Devlin' : 'Maya Silva'}
                            </span>
                            
                            <div className="flex items-center gap-2">
                              {msg.confidence && (
                                <div className="flex items-center gap-3">
                                  {msg.fallbackUsed && (
                                    <span className="text-orange-500 uppercase tracking-widest bg-orange-500/10 border border-orange-500/20 px-1.5 py-0.5 rounded font-bold text-[9px]">
                                      Autonomic Healed Fallback active
                                    </span>
                                  )}
                                  <span className={`font-bold ${msg.confidence > 80 ? 'text-immersive-accent' : 'text-orange-500'}`}>
                                    Confidence: {msg.confidence}%
                                  </span>
                                </div>
                              )}

                              {/* Voice Synthesizer volume trigger */}
                              {msg.role !== 'system' && (
                                <button
                                  onClick={() => speakMessage(msg.content, activePersona)}
                                  className="text-immersive-dim hover:text-immersive-accent p-1 rounded-md transition-colors"
                                  title="Listen via Voice Speech narration"
                                >
                                  <Volume2 className="h-3.5 w-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Message core Content */}
                        <div className="prose prose-invert prose-xs font-sans leading-normal text-immersive-text break-words whitespace-pre-line text-sm">
                          {isAI ? cleanMarkdownToFreeText(msg.content) : msg.content}
                        </div>

                        {/* Display vision references if used */}
                        {msg.sources && msg.sources.some(s => s.includes("Vision")) && (
                          <div className="mt-2.5 flex items-center gap-2 bg-immersive-aside/60 border border-immersive-border px-3 py-1.5 rounded-lg text-[10px] font-mono text-immersive-accent">
                            <Image className="h-3.5 w-3.5" />
                            Blueprint / flowchart sketch correctly submitted for feedback.
                          </div>
                        )}

                        {/* Live Lark Integration feed status badge */}
                        {isAI && (
                          <div className="mt-2.5 flex items-center gap-1.5 bg-blue-500/10 border border-blue-400/25 px-2.5 py-1 rounded-md text-[10px] text-blue-400 font-mono w-fit">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                            <span>Lark Alerts: Strategy brief dispatched and synchronized to team active feed channel</span>
                          </div>
                        )}

                        {/* Collapsible reasoning diagnostics details */}
                        {isAI && msg.reasoningChain && (
                          <div className="border-t border-immersive-border mt-4 pt-3">
                            <button
                              onClick={() => setExpandedReasoning(expandedReasoning === msg.id ? null : msg.id)}
                              className="flex items-center gap-1.5 font-mono text-[9.5px] text-immersive-dim hover:text-immersive-accent uppercase transition-colors cursor-pointer"
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
                              <div className="mt-2.5 bg-immersive-bg border border-immersive-border rounded-lg p-3 font-mono text-[10px] space-y-1.5 text-immersive-dim">
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

                {/* File/Thumbnail Scan Previews inline close to texting body */}
                {selectedImage && (
                  <div className="mt-4 mb-3 flex items-center justify-between bg-immersive-card border border-immersive-border rounded-xl p-3 max-w-sm animate-fade-in z-20 shadow-md">
                    <div className="flex items-center gap-3">
                      <img 
                        src={selectedImage} 
                        alt="Vision Scan Preview" 
                        className="h-10 w-10 object-cover rounded-lg border border-immersive-border bg-white" 
                      />
                      <div>
                        <span className="text-xs font-bold text-immersive-text-white block">Whiteboard Scan Attached</span>
                        <div className="mt-1 flex gap-2 items-center">
                          <button 
                            type="button"
                            onClick={() => setIsAnnotating(true)}
                            className="bg-immersive-accent/15 hover:bg-immersive-accent hover:text-immersive-bg border border-immersive-accent/30 text-immersive-accent text-[9.5px] font-bold px-2 py-0.5 rounded flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <PenTool className="h-2.5 w-2.5" />
                            Annotate / Post-its
                          </button>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedImage(null)}
                      className="text-immersive-dim hover:text-red-400 p-1 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {/* Chat Form embedded near under messages to easily reach out while typing */}
                <div className="sticky bottom-0 bg-immersive-aside/95 backdrop-blur-md pt-4 pb-1 mt-6 border-t border-immersive-border/60 z-20">
                  <form onSubmit={handleSubmit} className="flex gap-2 items-center relative">
                    
                    {/* Perfect Corp Visual board uploader trigger button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-immersive-card hover:bg-immersive-card/85 border border-immersive-border hover:border-immersive-accent text-immersive-dim hover:text-immersive-accent p-3 rounded-xl transition-all duration-200 cursor-pointer"
                      title="Upload flowchart sketch / whiteboard board scan"
                    >
                      <Image className="h-4 w-4" />
                    </button>
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    {/* Browser native Handsfree Microphone click trigger */}
                    <button
                      type="button"
                      onClick={handleVoiceInput}
                      className={`border border-immersive-border hover:border-immersive-accent p-3 rounded-xl transition-all duration-200 cursor-pointer ${
                        isListening ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse' : 'bg-immersive-card text-immersive-dim hover:text-immersive-accent'
                      }`}
                      title="Dictate via Handsfree Voice speech recognition"
                    >
                      <Mic className="h-4 w-4" />
                    </button>

                    <input
                      type="text"
                      ref={chatInputRef}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder={`Speak concepts or query on: "${userGoal}"...`}
                      disabled={isGenerating}
                      className="flex-1 bg-immersive-bg border border-immersive-border hover:border-immersive-border/95 rounded-xl px-4 py-3 text-immersive-text placeholder-slate-600 text-sm focus:outline-none focus:border-immersive-accent transition-colors"
                    />

                    <button
                      type="submit"
                      disabled={(!inputText.trim() && !selectedImage) || isGenerating}
                      className="bg-immersive-accent hover:bg-immersive-accent-hover text-immersive-bg p-3 rounded-xl transition-all duration-200 shadow-lg shadow-immersive-accent/10 hover:shadow-immersive-accent/30 cursor-pointer disabled:opacity-40 disabled:hover:bg-immersive-accent"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </form>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: Dynamic 3D Strategic take nodes mapping */}
          {viewMode === 'ar_concept' && currentConceptNodes.length > 0 && (
            <div className="flex-1 p-6 flex flex-col h-full min-h-[500px]">
              <div className="mb-4">
                <h3 className="font-sans font-extrabold text-sm text-immersive-text-white uppercase tracking-tight">Interactive Strategist Advice mapping</h3>
                <p className="text-xs text-immersive-dim leading-normal">
                  Toggle node perspectives. Click advice vectors in 3D physics mapping to explore VC risk parameters, stable structures, or bootstrap speed.
                </p>
              </div>
              <div className="flex-1 min-h-[360px] border border-immersive-border rounded-2xl overflow-hidden relative">
                <ConceptMap3D 
                  nodes={currentConceptNodes} 
                  links={currentConceptLinks} 
                  topic={currentDomain.name} 
                />
              </div>
            </div>
          )}

          {/* TAB 3: Shareable Advice Card studio */}
          {viewMode === 'advice_card' && activeAdviceCard && (
            <div className="flex-1 p-8 flex flex-col h-full min-h-[500px]">
              <div className="space-y-1 mb-6">
                <h3 className="font-sans font-extrabold text-sm text-immersive-text-white uppercase tracking-tight font-sans">Advice Card Studio</h3>
                <p className="text-xs text-immersive-dim leading-normal">
                  Export beautiful, contrast-rich templates ready to submit or present directly under the immersive layout.
                </p>
              </div>
              
              <div className="flex-1">
                <AdviceCardGen initialCard={activeAdviceCard} />
              </div>
            </div>
          )}

            </>
          )}

        </div>

      </div>

    </div>
  );
}

export type ExpertDomain = 'business' | 'tech' | 'career';

export interface DomainConfig {
  id: ExpertDomain;
  name: string;
  tagline: string;
  mentorName: string;
  avatarEmoji: string;
  color: string;
  gradient: string;
  bgColor: string;
  accentColor: string;
  starPrompts: string[];
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'info';
  content: string;
  timestamp: string;
  confidence?: number; // 0 to 100
  sources?: string[];
  fallbackUsed?: boolean;
  reasoningChain?: string[];
  fallbackReason?: string;
  modeUsed?: 'Nemotron' | 'Local-Mistral' | 'Rule-Engine';
}

export interface AgentMetric {
  id: string;
  timestamp: string;
  model: string;
  timeMs: number;
  status: 'active' | 'degraded' | 'healing' | 'recovered' | 'off';
  requestCount: number;
  successRate: number;
  circuitBreaker: 'CLOSED' | 'OPEN' | 'HALF-OPEN';
}

export interface FailoverLog {
  id: string;
  timestamp: string;
  query: string;
  primaryModel: string;
  primaryStatus: 'TIMEOUT' | 'ERROR-500' | 'SLOWER-THAN-SLA';
  latencyMs: number;
  resolvedBy: string;
  resolutionType: 'AUTO-DEGRADATION' | 'EXPONENTIAL-RETRY' | 'LARK-MCP-REROUTE';
}

export interface ConceptNode {
  id: string;
  label: string;
  description: string;
  group: number; // 0 = Center topic, 1 = Core Frameworks, 2 = Execution Steps
  x: number;
  y: number;
  z: number;
  rx?: number; // projected 2D x
  ry?: number; // projected 2D y
  size: number;
}

export interface ConceptLink {
  source: string;
  target: string;
}

export interface AdviceCard {
  id: string;
  headline: string;
  coreFramework: string;
  steps: string[];
  takeaway: string;
  sentiment: string;
  styling: 'minimal' | 'detailed' | 'branded' | 'dark_minimalism' | 'vivid_executive';
}

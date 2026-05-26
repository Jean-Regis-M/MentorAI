import React from 'react';
import { AgentMetric, FailoverLog } from '../types';
import { ShieldCheck, ZapOff, Activity, RefreshCw, AlertCircle, Cpu } from 'lucide-react';

interface ResilienceDashboardProps {
  metrics: AgentMetric[];
  logs: FailoverLog[];
  chaosActive: boolean;
  onResetLogs: () => void;
}

export default function ResilienceDashboard({ metrics, logs, chaosActive, onResetLogs }: ResilienceDashboardProps) {
  // Aggregate Metrics Calculations
  const requestTotal = metrics.reduce((sum, m) => sum + m.requestCount, 0);
  const avgSuccessRate = metrics.length 
    ? Math.round(metrics.reduce((sum, m) => sum + m.successRate, 0) / metrics.length) 
    : 100;
  const circuitBreakerStatus = chaosActive ? 'HALF-OPEN' : 'CLOSED';

  return (
    <div className="bg-immersive-aside border border-immersive-border rounded-2xl p-6 font-mono text-xs text-immersive-text">
      {/* Title & Real-time beacon */}
      <div className="flex items-center justify-between border-b border-immersive-border pb-4 mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-immersive-accent" />
          <h3 className="font-sans font-bold text-sm tracking-tight text-immersive-text-white uppercase">TrueFoundry Resilience Monitor</h3>
        </div>
        <div className="flex items-center gap-1.5 bg-immersive-card border border-immersive-border px-2.5 py-1 rounded-full text-[10px] text-immersive-accent shadow-[0_0_6px_var(--theme-glow)]">
          <span className={`block h-1.5 w-1.5 rounded-full ${chaosActive ? 'bg-orange-500 animate-pulse' : 'bg-immersive-accent animate-pulse shadow-[0_0_8px_var(--theme-accent)]'}`} />
          {chaosActive ? 'DEGRADED ORCHESTRATION' : 'OPTIMAL STATUS'}
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
        <div className="bg-immersive-card border border-immersive-border rounded-xl p-3">
          <p className="text-[10px] text-immersive-dim uppercase tracking-wider mb-1">TOTAL INFERENCES</p>
          <p className="text-xl font-bold text-immersive-text-white font-mono">{requestTotal || 24}</p>
        </div>

        <div className="bg-immersive-card border border-immersive-border rounded-xl p-3">
          <p className="text-[10px] text-immersive-dim uppercase tracking-wider mb-1">SUCCESS RATE</p>
          <p className={`text-xl font-bold font-mono ${avgSuccessRate > 90 ? 'text-immersive-accent' : 'text-orange-500'}`}>
            {avgSuccessRate}%
          </p>
        </div>

        <div className="bg-immersive-card border border-immersive-border rounded-xl p-3">
          <p className="text-[10px] text-immersive-dim uppercase tracking-wider mb-1">SLA STANDARD</p>
          <p className="text-xl font-bold text-blue-500 font-mono">99.98%</p>
        </div>

        <div className="bg-immersive-card border border-immersive-border rounded-xl p-3">
          <p className="text-[10px] text-immersive-dim uppercase tracking-wider mb-1">CIRCUIT STATE</p>
          <div className="flex items-center gap-1 mt-0.5">
            <ShieldCheck className={`h-4 w-4 ${circuitBreakerStatus === 'CLOSED' ? 'text-immersive-accent' : 'text-orange-500'}`} />
            <span className={`text-sm font-bold ${circuitBreakerStatus === 'CLOSED' ? 'text-immersive-accent' : 'text-orange-500'}`}>
              {circuitBreakerStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Model Clusters Status */}
      <div className="mb-6">
        <h4 className="text-[10px] text-immersive-dim uppercase tracking-widest font-sans font-semibold mb-3 border-b border-immersive-border pb-1">
          Active Provider Routing Matrices
        </h4>
        <div className="space-y-3">
          {metrics.map((metric) => (
            <div key={metric.id} className="bg-immersive-card border border-immersive-border p-3 rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-immersive-text-white mb-0.5">{metric.model}</p>
                <div className="flex items-center gap-2 text-[10px] text-immersive-dim">
                  <span>Latency: {metric.timeMs}ms</span>
                  <span>•</span>
                  <span>Load: {metric.requestCount} queries</span>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                metric.status === 'active' ? 'bg-immersive-accent/10 text-immersive-accent border border-immersive-accent/20' :
                metric.status === 'degraded' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                metric.status === 'healing' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 animate-pulse' :
                'bg-immersive-border text-immersive-dim'
              }`}>
                {metric.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Failover Logs */}
      <div>
        <div className="flex items-center justify-between border-b border-immersive-border pb-1.5 mb-3">
          <h4 className="text-[10px] text-immersive-dim uppercase tracking-widest font-sans font-semibold">
            Auto-healing and Integration Events
          </h4>
          {logs.length > 0 && (
            <button 
              onClick={onResetLogs}
              className="text-[9px] text-immersive-dim hover:text-immersive-text-white uppercase transition-colors"
            >
              Clear Logs
            </button>
          )}
        </div>

        {logs.length === 0 ? (
          <div className="bg-immersive-card/15 border border-immersive-border border-dashed rounded-xl p-6 text-center text-immersive-dim text-[11px]">
            No downtime detected. System reporting optimal health. Try asking questions with "Chaos Fallback" enabled to audit failovers.
          </div>
        ) : (
          <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
            {logs.map((log) => (
              <div key={log.id} className="bg-immersive-card border border-immersive-border p-2.5 rounded-lg flex flex-col gap-1.5">
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-orange-500 font-bold flex items-center gap-1">
                    <ZapOff className="h-3 w-3" />
                    {log.primaryStatus} - {log.primaryModel} Outage
                  </span>
                  <span className="text-immersive-dim text-[9px]">{log.timestamp}</span>
                </div>
                <div className="text-immersive-dim tracking-tight leading-relaxed">
                  Query: <span className="text-immersive-text">"{log.query}"</span>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-immersive-dim">Latency: {log.latencyMs}ms</span>
                  <span className="text-immersive-accent bg-immersive-accent/10 border border-immersive-accent/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">
                    Healed: {log.resolutionType}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

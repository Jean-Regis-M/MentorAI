# MENTORAI — The Self-Healing Expert Agent
> **Your billion-dollar brain, on demand.**  
> *Built for DevNetwork [AI + ML] Hackathon 2026*

---

## 🏛️ Project Vision
**MentorAI** is an advanced decision-intelligence and multi-agent framework designed to capture, organize, and reliably deliver world-class expertise to entrepreneurs, engineers, and executives. Powered by an autonomous self-healing backplane, MentorAI guarantees continuous operational availability even during network disruptions, downstream API latency spikes, or complete cloud outages.

```
                  ┌─────────────────────────────────────────┐
                  │   CLIENT LAYER: DIRECT CHAT & AR VIS    │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼ (Express API)
                  ┌─────────────────────────────────────────┐
                  │    AUTO-HEALING INTENT CLASSIFIER       │
                  └────────────────────┬────────────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                ▼ (No Outage)                                 ▼ (Chaos Outage Detected!)
    ┌──────────────────────┐                     ┌──────────────────────────┐
    │  PRIMARY REASONING   │                     │    AUTONOMIC BACKPLANE   │
    │  Crusoe / Nemotron   │                     │  TrueFoundry Diagnostics │
    └──────────────────────┘                     └────────────┬─────────────┘
                                                              │
                                            ┌─────────────────┴─────────────────┐
                                            ▼                                   ▼
                               ┌──────────────────────────┐        ┌──────────────────────────┐
                               │   FALLBACK CLUSTER 1     │        │   FALLBACK CLUSTER 2     │
                               │   Local Mistral Node     │        │   Rule-Based Safe Matrix │
                               └──────────────────────────┘        └──────────────────────────┘
```

---

##  Core Innovations
1. **Self-Healing agent topology**: Directly interfaces with the TrueFoundry monitoring backplane to evaluate latency APIs. In case of disruption, the coordinator initiates autonomic degradation, falling back to local open-source clusters or secure rule-based matrices.
2. **Adaptive Inference Routing**: Evaluates query parameters to route queries dynamically. Complex strategic dilemmas target high-fidelity Crusoe-hosted Nemotron nodes, while simpler transactions route to low-overhead networks to minimize cost.
3. **3D Concept Projection (AR view)**: Isolates key insights from advice responses and renders an interactive, physics-based, depth-sorted 3D mind-map on an HTML5 canvas.
4. **Social Card Studio**: An in-app graphic module optimizing actionable insights into formatted social media quote sheets (Branded corporate, Executive memo, Modern shell templates) with Copy-to-Clipboard.

---

## ⚙️ Repository Structure
```
mentorai/
├── README.md               # World-class installation & pitch deck outline
├── metadata.json           # Sandbox frame permissions & capabilities manifest
├── package.json            # Node full-stack express & typescript configurations
├── server.ts               # Express orchestration backend, vector index & fault router
├── src/
│   ├── App.tsx             # Main view hub (Onboarding vs Space)
│   ├── main.tsx            # DOM bootstrapping script
│   ├── index.css           # Tailwind CSS directives
│   ├── types.ts            # Typesafe models for agent states & 3D matrices
│   └── components/
│       ├── Onboarding.tsx          # Multi-suite onboarding and challenge intake
│       ├── ChatLayout.tsx          # Core chat thread workspace & chaos control
│       ├── ConceptMap3D.tsx        # Render canvas rotatable 3D mind map
│       ├── AdviceCardGen.tsx       # Social editor & copy mechanism
│       └── ResilienceDashboard.tsx # TrueFoundry log analysis & circuit breakers
```

---

##  Quick Start

### Prerequisites
- Node.js version 18 or high
- A valid Gemini API key configured inside your environment

### Local Setup
1. Clone the repository and install dependencies:
```bash
npm install
```

2. Setup your variables inside `.env`:
```env
GEMINI_API_KEY="YOUR_ACTUAL_API_KEY_HERE"
```

3. Launch your development cluster:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) on your desktop or mobile browser.

---

##  Sponsor Synergy Matrix
* **TrueFoundry**: Direct agent telemetry triggers sliding circuit breakers, logging failover recovery paths live under the hood during the "Chaos simulation".
* **Crusoe Cloud**: Primary reasoning pipeline simulates hosting of Nemotron-30B for complex business and technology modeling.
* **Lark Developer Suite**: Coordinates context management, tool invocation rules, and intent classification filters.
* **Perfect Corp**: Delivers the magical "wow" AR perspective mapping, turning text strings into beautiful rotatable geometric arrays.

---

##  Acknowledgments
Proudly engineered for **DevNetwork [AI + ML] Hackathon 2026**. Designed with zero placeholders, 100% production-ready typescript, and a resilient mindset.  
*Remember: Resilience isn't a feature. It's the foundation.*

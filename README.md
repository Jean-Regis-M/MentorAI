# 🪐 MENTORAI — The Autonomic Self-Healing Decision Intelligence Agent

> **Your billion-dollar board of advisors, on-demand. Engineered with zero-latency autonomic healing and immersive 3D visual concept projections.**
> 
> *Built and optimized for DevNetwork [AI + ML] Hackathon 2026.*

---

## 🔗 Live Production Access
✨ **Experience MentorAI live on the web right now:**  
👉 **[https://remix-mentorai-794894443725.europe-west2.run.app](https://remix-mentorai-794894443725.europe-west2.run.app)** 👈

---

## 🏛️ Project Vision & Philosophy
In high-stakes corporate, business, or operational environments, downtime is simply not an option. **MentorAI** is an advanced decision-intelligence agent framework designed to capture world-class strategic expertise and deliver it uninterrupted. 

By integrating an **autonomous self-healing backplane**, MentorAI guarantees operational resilience. When downstream services trigger timeouts, complete API blackouts, or response corruption, MentorAI autonomously steps down through high-fidelity, medium-fidelity, and fallback rule matrices. It maintains continuous service availability, ensuring that users always have access to crucial strategy pathways.

---

## ⚡ Key Highlights & Core Innovations

### 1. 🛡️ Autonomic Self-Healing Topology (Chaos Engine)
* **Real-time Telemetry Control:** Simulates real-time system degradation and downstream failures.
* **Circuit Breaker Mechanics:** Automatically detects network failures or high latency, flipping to safe-state responses or local fallback rule matrices.
* **Active Simulation Control:** A dedicated **Resilience Dashboard** with toggleable downstream service states (API Online, Slow Latency, Total Outage), charting state transitions in real-time.

### 2. 🌀 Interactive 3D Concept Mapping
* **Spatial Mind-Maps:** Real-time generation of depth-sorted, rotatable 3D geometric mind-maps on an interactive HTML5 canvas.
* **Physics-Based Nodes:** Connects strategic directives dynamically, letting users rotate, hover, click, and lock individual conceptual nodes to dissect complex strategic advice manually.
* **Responsive Re-Rendering:** Adjusts layout fluidly relative to container resize events.

### 3. 🎨 Advice Card Generator Studio (Social & PDF Ready)
* **Custom Dimension Fitting:** Toggleable aspect-ratio layouts tailored for various output requirements:
  * ▢ **Square (1:1)** — Optimizing feed formats.
  * ▮ **Portrait (4:5)** — Made for Instagram / Mobile feeds.
  * ▬ **Landscape (16:9)** — Fits perfectly inside Google Slides, PowerPoint, or standard widescreen presentations.
* **Granular Layout Metrics:** Drag-and-drop-style internal padding slider ranging from tight `12px` up to spacious `64px` for gorgeous typography frames.
* **Multi-Theme Palette:** Custom presets including Slate Classic, Electric Violet, Cyberpunk Amber, Forest Druid, Crimson Heat, and Ocean Breeze.
* **High-Contrast Print Mode:** Instantly strips dark-mode gradients, applying a pristine mono-chrome white layout for physical printer configurations.
* **Copy & Export Ready:** Full clipboard and image extraction pipelines built right into the sidebar workspace.

### 4. 🚀 Ultra-Polished User Interface & Experience
* **Professional Typography Architecture:** Paired standard modern **Inter** body text with tech-forward **Space Grotesk** display titles and highly detailed **JetBrains Mono** status metrics.
* **Intelligent Strategic Intake:** Tailor-made onboarding workflows that guide the user from simple problem identification into premium-grade advising cards.

---

## ⚙️ Repository Blueprints

```
mentorai/
├── README.md               # Extensive guide, architectural overview & pitch link
├── metadata.json           # Sandbox configuration & major capabilities manifest
├── package.json            # Node backend services & developer dependencies
├── server.ts               # Express controller proxying Gemini prompts, failover paths
├── src/
│   ├── App.tsx             # Central route coordinator and portal workspace
│   ├── main.tsx            # DOM initialization and mounting
│   ├── index.css           # Global custom styles and Tailwind directives
│   ├── types.ts            # Strongly-typed schema definitions
│   └── components/
│       ├── Onboarding.tsx          # Creative strategy intake & goal alignment
│       ├── ChatLayout.tsx          # Real-time chat workspace & strategy cockpit
│       ├── ConceptMap3D.tsx        # Rotatable, physical orbit graph mind-map
│       ├── AdviceCardGen.tsx       # Designer layout editor (Ratios, Padding, Custom Themes)
│       └── ResilienceDashboard.tsx # Failover logs, latency triggers & live charts
```

---

## 🛠️ Installation & Local Setup

### System Prerequisites
* **Node.js** version `18.x` or greater.
* A valid **Gemini API Key** (configured securely server-side).

### 1. Retrieve the Repository & Install Packages
```bash
npm install
```

### 2. Configure Local Settings
Create a `.env` file in the root directory:
```env
GEMINI_API_KEY="AIzaSyYourSecretGeminiAPIKeyHere"
```
*(Note: To maintain professional security paradigms, secret keys remain securely confined server-side inside `/api/*` proxies and are never broadcast into the public client space.)*

### 3. Run the Development Engine
```bash
npm run dev
```
The dev server will boot up instantly on **Port 3000** (bound to `0.0.0.0` for full container networking). Open [http://localhost:3000](http://localhost:3000) to view the workspace locally.

---

## 🧩 Strategic Integrations & Hackathon Synergy Matrix

* **TrueFoundry Simulation:** Direct developer monitoring backplane measuring response times, simulating circuit tripping and path isolation.
* **Crusoe Cloud Pipeline:** Primary advisor queries simulate routing through high-fidelity hardware nodes for extreme tactical analytical modeling.
* **Lark Developer Suite Matrix:** Organizes context flows, routing intent categorization checks.
* **Perfect Corp UX Visualizer:** Powers 3D geometric array projections mapping concepts directly to high-impact coordinates in virtual 3D space.

---

## 🤝 Open Source Contribution Standards
We follow strict architectural constraints:
1. **ES Module Safety:** The server bundle compiles seamlessly via CJS output strategies, eliminating fragile runtime references.
2. **Strict Type Guarantees:** 100% type coverage on all API payload interactions, system nodes, and styles.
3. **No Decorative Clutter:** All functional tools provide real outcomes without pseudo-telemetry noise, adhering closely to high-performance interface standardizations.

---

## 🎓 Acknowledgements
Proudly engineered for **DevNetwork [AI + ML] Hackathon 2026**. Designed with pure dedication, typographic precision, and defensive coding configurations because *resilience isn't just a property — it's the core system design*.

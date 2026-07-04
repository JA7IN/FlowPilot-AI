# ✈️ FlowPilot AI: Autonomous RevOps & Pipeline Recovery Agent

FlowPilot AI is a state-of-the-art, autonomous sales operations assistant designed to prevent lead drop-offs, optimize objection handling, and recover lost pipeline in real-time. 

By combining stateful agentic loops with multi-model classification, FlowPilot automatically intercepts buying roadblocks, qualifies inbound leads, synchronizes records with CRMs, and instantly routes hot leads or frustrated support escalations.

### 🌟 Key Features
* **Stateful Conversational Sandbox**: Retains context across multi-turn customer dialogues to resolve complex sales objections.
* **Contextual Objection Router (powered by Gemini 1.5 Flash)**: Automatically handles enterprise security compliance (SSO/SAML), pricing reservations, and demo bookings.
* **Dynamic Lead Scorer & Sentiment Profiler**: Computes real-time lead value (0-100), conversion probability, and churn risk markers.
* **RevOps Automation Workflows**:
  * *wf-1 (Inactive Re-engagement)*: Triggers automated offers to silent prospects.
  * *wf-2 (Hot Lead Route)*: Instantly assigns high-value leads and alerts Slack channels.
  * *wf-3 (Frustration Escalation)*: Pauses AI replies and opens manual support tickets when frustration is detected.
* **Operations Command Console**: High-end glassmorphic dashboard tracking pipeline metrics, agent states, and live execution logs.

### 🛠️ Tech Stack
* **Frontend**: Next.js 15, React 19, Vanilla CSS Modules
* **Backend**: FastAPI, LangGraph, Pydantic, Python-Dotenv
* **AI Engine**: Google Gemini 1.5 Flash

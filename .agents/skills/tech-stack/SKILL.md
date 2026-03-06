---
name: tech-stack
description: Use when writing, modifying, or generating code for the project. Ensures the agent follows the defined stack (Next.js App Router + React + TypeScript + Tailwind + shadcn/ui, Convex backend, and Python worker on Railway) and selects the correct libraries for UI, visualization, data, and AI processing.
---

## The Tech Stack

### **A. The Frontend (The Dashboard)**
*   **Framework:** **Next.js 16 (App Router)** + **React**.
*   **Language:** **TypeScript** (Strict Mode).
*   **Styling:** **Tailwind CSS** + **shadcn/ui** (Dark mode "Radar" aesthetic).
*   **Visualization:**
    *   **3D Universe:** **React Three Fiber** (Three.js) for the interactive "Semantic River."
    *   **2D Charts:** **D3.js** for the timelines and bias meters.
    *   **Networks:** **React Flow** for the Entity-Claim graphs.
    *   **Data Grid:** **TanStack Table** for the "Master Matrix."
*   **State Sync:** **Convex React Client** (Real-time WebSockets).

### **B. The Backend & Database (The Brain)**
*   **Platform:** **Convex**.
    *   **Relational DB:** Stores Articles, Entities, Claims, and Profiles.
    *   **Vector DB:** Native vector search for the 1536D embeddings.
    *   **API:** Auto-generated type-safe API for the frontend.

### **C. The Engine Room (The Worker)**
*   **Hosting:** **Railway** (Deployed as a Background Worker Service).
*   **Runtime:** **Python 3.11+**.
*   **AI Structuring:** **Google `langextract`** powered by **gemini-3.1-flash-lite-preview**.
    *   *Why:* Extremely fast, massive context window, and the "Lite" version is optimized for high-volume tasks on a budget.
*   **Rate Limiting:** Custom Python `asyncio` semaphore to respect Gemini Free Tier limits (to be safe 5 RPM).
*   **Ingestion:** `requests` (GDELT) + `trafilatura` (Scraping).
*   **Math:** `sentence-transformers` (Embeddings), `umap-learn` (3D Reduction), `hdbscan` (Clustering).
*   **Environment** All api keys are availabe and complete in .env.local as in .env.example file.
---
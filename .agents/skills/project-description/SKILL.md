---
name: project-description
description: The high level project description, for the agent to understand the context of the project. Follow it as a guide, always ask for clarifications if something is not clear, and if you propose a change/improvement, always ask for approval.
---


# Project: MediaEcho Romania
### *Real-Time Media Forensics, Bias Tracking, and Narrative Auditing*

**The Vision:** Moving beyond simple "sentiment analysis" to build an automated, mathematically rigorous watchdog for the Romanian media ecosystem. MediaEcho doesn't just track *what* is published; it proves *who* broke the news, *how* they spun the baseline facts, *who* they attacked, and what truths they deliberately ignored.

**Target Ecosystem:** Strictly Romanian media, categorized into **National** (e.g., Digi24, Antena 3 CNN, ProTV) and **Local/Minority** (e.g., Maszol).

---

## 1. The Tech Stack & Architecture
*   **Data Ingestion:** GDELT DOC 2.0 API (real-time discovery) + `trafilatura` (full-text scraping).
*   **Social Impact APIs:** Fetching share/like/follower counts from Facebook, Instagram, X, and TikTok to calculate "Narrative Virality."
*   **AI Structuring:** Google `langextract` using our **"Hybrid Master Schema"** to extract grounded facts, subjective spin, and entity relationships.
*   **Vector Math:** `sentence-transformers` (multilingual embeddings), **UMAP** (dimensionality reduction to 3D), and **HDBSCAN** (density-based clustering).
*   **Backend & Database:** **Convex**. Handles the unified relational data, vector searches, state-machines, and nightly CRON aggregations.
*   **Frontend UI/UX:** Next.js / React, utilizing **Plotly.js 3D**, **React Flow** (for network graphs), and **TanStack Table** (for the data matrix).

---

## 2. Methodological Rigor (The Scientific Pipeline)
To ensure the platform is trusted by researchers and journalists, the backend relies on strict scientific protocols:

1.  **HDBSCAN Semantic Clustering:** Instead of arbitrary "85% similarity" thresholds, we use HDBSCAN on UMAP coordinates. This mathematically identifies dense "Event Clusters" of varying shapes and filters out irrelevant articles as "noise."
2.  **Unified Entity Resolution:** To prevent graph fragmentation, all extracted entities pass through a Convex master dictionary. *"Premierul"*, *"Liderul PSD"*, and *"Marcel Ciolacu"* are automatically resolved to a single `entity_id`.
3.  **LLM Self-Consistency:** For highly sensitive extractions (e.g., tagging a claim as "Hostile Spin"), the LangExtract prompt runs 3 times. It only enters the database if the LLM achieves a 3/3 consensus, ensuring zero hallucination.
4.  **The Event State Machine:** Every news cycle is tracked linearly in Convex: *Emerging* (plotting vectors) → *Consensus Forming* (locking in baseline facts) → *Spin Phase* (tracking outlet deviations) → *Resolved* (logging omissions).
5.  **Graceful Degradation:** If `trafilatura` fails to scrape a dynamically loaded page, the system falls back to the GDELT summary. If LangExtract fails schema validation, it retries with `temperature=0.0` before flagging for manual review.

---

## 3. The UI/UX Journey & Core Features

### The Entry Point: The "Morning Briefing" & Global Controls
*   **The Concept:** Managing cognitive load. Instead of dropping users into a complex 3D galaxy immediately, they land on a clean, LLM-generated daily briefing.
*   **UI/UX:** A plain-text summary of the data state: *"Good morning. Today, 3 major events are unfolding. The biggest divergence is regarding the Tax Reform, where Antena 3 CNN is heavily using anonymous sources to attack the PSD, while Digi24 is focusing on BNR quotes."*
*   **Global Time Controls:** A prominent sticky header allows users to filter the *entire* dashboard's data by rolling windows: **[ 24h ] | [ 48h ] |[ 96h ]**.

### Feature 1: The 3D Event Universe (Impact-Weighted)
*   **The Concept:** An interactive 3D map where physical distance equals narrative similarity.
*   **UI/UX:** A Plotly 3D scatter plot. Nodes are color-coded by Typology (National vs. Local). 
*   **The Impact Upgrade:** The *size* of each node is dictated by its Social Media Virality (aggregated Facebook/Insta/X/TikTok metrics). You visually see not just the narrative cluster, but which specific article "infected" the public consciousness the most.

### Feature 2: Relational Deep Structuring & Exportable Receipts
*   **The Concept:** Visualizing the Knowledge Graph of an article: *[Who spoke?] -> [What did they say?] -> [Who did they attack?]*
*   **UI/UX:** Clicking an article opens a React Flow graph of entities and colored claim-edges. Hovering over an edge highlights the exact grounded quote in the text below.
*   **The Virality Upgrade:** The **"Generate Audit Card"** button. Users can click this to generate a clean, branded PNG "receipt" showing an outlet's exact biased quote vs. the baseline fact. This image is perfectly sized for sharing on X or LinkedIn.

### Feature 3: The Consensus vs. Spin Tracker
*   **The Concept:** Tracking how a story mutates from the moment it breaks.
*   **UI/UX:** A Diff Timeline. The center spine shows the "Baseline Facts." Branches show individual outlets adding "Editorial Spin" (green highlights) or quietly dropping facts (red strikethroughs) as the 24h/48h/96h clock ticks.

### Feature 4: The Typology Divide (National vs. Local)
*   **The Concept:** Quantifying the friction between Bucharest-centric narratives and regional realities.
*   **UI/UX:** A Split-Pane Dashboard showing National Entities on the left and Local Entities on the right. A "Narrative Divergence Score" dial (0-100%) sits in the middle.

### Feature 5: Propensity-Weighted Bias & Ghosting Tracker
*   **The Concept:** Tracking "News by Omission."
*   **The Scientific Upgrade:** We use *Propensity-Weighting*. Maszol (Local) will not be penalized for ignoring a Bucharest traffic jam. A "Ghosting Event" is only logged if the ignored event mathematically matches the outlet's historical publishing profile.
*   **UI/UX:** A Coverage Heatmap. Y-axis = Top Macro-Events. X-axis = Outlets. Deep Red tiles scream: *This outlet systematically suppressed this story.*

### Feature 6: The Outlet & Journalist Dossiers
*   **The Concept:** A living, auto-updating institutional audit, powered by nightly Convex CRON jobs.
*   **UI/UX:** A `/profile/[name]` dashboard applicable to **both Newspapers and Individual Authors**. It includes:
    1.  *Partisan Fingerprint:* Bar chart of net hostility vs. support for specific politicians.
    2.  *The "Surse" Gauge:* Donut chart showing reliance on Anonymous Sources vs. Verifiable Documents.
    3.  *Speed vs. Clickbait:* Scatter plot showing if they are a "Fast & Factual Leader" or a "Late & Sensational Follower."

### Feature 7: The Multi-Outlet Comparison Engine
*   **The Concept:** A researcher-grade tool to compare 2 to all tracked outlets simultaneously.
*   **UI/UX:** Users select their targets (e.g., Digi24 vs. Antena 3 CNN) and choose a mode:
    *   **Visual Arena (Max 3 Features):** To prevent chart-clutter, users select up to 3 visual widgets (e.g., a shared Entity-Bias Radar Chart and a Speed Box-Plot).
    *   **Master Matrix (All Features):** A dense TanStack Table showing all metrics side-by-side. Heatmapping (conditional formatting) makes the highest sensationalism scores or worst omission counts glow red for instant tabular analysis.

---

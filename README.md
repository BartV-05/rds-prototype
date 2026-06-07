# AI Transparency Tool

**INFOB3RDS Group Assignment 2 — Group 01 (Bart, Khadija, Annemiek)**
Universiteit Utrecht, 2025-2026

A reflective tool that helps students disclose their AI use in academic writing and check compliance with the UU AI Index (July 2025). All text analysis runs client-side in the browser — no data is sent to any server.

## Live version

A deployed version is available at: **https://ai-transparency-tool.vercel.app**
(No setup required — open the link and use it directly.)

---

## Run with Docker (recommended for evaluators)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/) (or Docker Engine + Compose on Linux).

```bash
# 1. Clone or unzip the project, then enter the folder
cd Prototype

# 2. Build the image and start the container
docker compose up --build

# 3. Open your browser and go to:
#    http://localhost:8080
```

To stop the container, press `Ctrl+C` in the terminal, then run:

```bash
docker compose down
```

The build takes about 60-90 seconds on first run (downloading base images + installing dependencies). Subsequent runs reuse the cache and start in a few seconds.

---

## Run without Docker

Requires [Node.js](https://nodejs.org/) v18 or higher, or [Deno](https://deno.land/) v2.

**With Node.js / npm:**
```bash
cd Prototype
npm install
npm run dev
# Open http://localhost:5173
```

**With Deno:**
```bash
cd Prototype
deno task dev --open
```

---

## How to exercise the prototype (grader walkthrough)

1. **Step 1 — Paste text**: paste or load the sample academic paper. The tool counts words, paragraphs, and sentences live. Minimum 100 words required to proceed.

2. **Step 2 — AI questionnaire**: select a UU AI Index level (1-5), the AI tools used, their purposes, and answer the fact-checking questions. A live compliance indicator (green/yellow/red) updates as you answer.

3. **Step 3 — Text analysis**: the dataset-driven classifier highlights sentences that appear to make unsupported factual claims (epistemic generalisations, statistical claims, causal claims, etc.) without a nearby APA or IEEE citation. The paragraph table shows citation density and flagged claim counts.

4. **Step 4 — Statement review**: an AI usage statement is generated, pre-filled with your answers and the analysis summary. You must tick the approval checkbox before you can copy or download it.

**To see the RDS compliance feature**: in Step 2, select Level 2 (Planning & brainstormen) and then tick "Text generation / revision" as a purpose. A red compliance warning appears immediately, explaining that text generation is not permitted at Level 2.

**Classifier**: For each sentence, the tool sums the weights of all matching dataset phrases. If the total score exceeds 0.50 and no APA or IEEE citation appears within a one-sentence context window, the sentence is flagged as potentially unsupported.

## Technology

- **Framework**: SvelteKit 2 with Svelte 5 (runes syntax)
- **Styling**: Tailwind CSS v4, UU Huisstijl (yellow `#FFCD00`, Merriweather + Open Sans)
- **Build**: Vite 6, `@sveltejs/adapter-static` (fully prerendered static site)
- **Runtime**: client-side TypeScript only, no backend

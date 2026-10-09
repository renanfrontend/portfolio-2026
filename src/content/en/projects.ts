import type { ProjectCopy } from "@/features/projects/types";

export const projectsCopy: Record<string, ProjectCopy> = {
  "logiflow-3d": {
    title: "LogiFlow 3D",
    summary:
      "Interactive 3D distribution center for simulating operational decisions, with indicators and comparable scenarios.",
    coverAlt: "LogiFlow 3D screen with stock and throughput indicators and the isometric model of the logistics center.",
    galleryAlt: [],
    challenge:
      "Isolated spreadsheets don't always show where a bottleneck happens. The idea was to connect a spatial view of a logistics center to indicators and scenarios that can be compared, such as demand peaks and a blocked dock.",
    solution:
      "A procedural isometric scene in React Three Fiber with selectable warehouses, docks, trucks and forklifts, shipment tracking across five stages and indicators derived from the same domain functions. Rules live in Clean Architecture-inspired layers with no React dependency.",
    contribution:
      "Solo portfolio project: concept, domain modeling, interface, 3D scene, tests and deployment. It is a visual proof of concept, not connected to real facilities.",
    outcomes: [
      "Demo published on GitHub Pages with a CI pipeline.",
      "Keyboard shortcuts, sector selection through accessible HTML buttons and reduced-motion support.",
      "Fallback for browsers without WebGL.",
    ],
  },
  "visionstock-ai": {
    title: "VisionStock",
    summary:
      "E-commerce catalog proof of concept: from a product photo to an AI-filled listing, 3D warehouse slotting, storefront and XML reports.",
    coverAlt: "VisionStock registration screen with an upload area for a product photo or video and the AI-filled form.",
    galleryAlt: [],
    challenge:
      "Registering products is repetitive: title, description, category, attributes, stock and publishing to different channels. The goal was to reduce that manual work without losing human control over what gets published.",
    solution:
      "A vision model fills in the listing from a photo or a short video whose frames are extracted in the browser. The flow continues to a drag-and-drop 3D warehouse, a publishing board with per-stage requirements and XML, CSV and JSON exports. Model output is treated as untrusted input and validated with Zod.",
    contribution:
      "Solo project: layered architecture (domain, use cases, infrastructure), vision provider integration behind a replaceable port, interface, domain tests and deployment.",
    outcomes: [
      "Demo published on Vercel.",
      "Business rules tested without rendering the interface.",
      "Interchangeable AI provider (Gemini or Anthropic) behind the same interface.",
    ],
  },
  "gemini-beyond-prompts": {
    title: "Gemini Beyond Prompts",
    summary: "AI dashboard prototype combining a Google Gemini chat with document analysis (RAG) and agent screens in a single interface.",
    coverAlt: "Gemini Beyond Prompts home screen with the chat, document analysis and assistant modules.",
    galleryAlt: [],
    challenge:
      "Explore how generative AI features go beyond a prompt box: conversations with context, semantic search over your own documents and tasks carried out by agents.",
    solution:
      "A React, Vite and TypeScript application with three modules: a Google Gemini chat that keeps the conversation context, a RAG-style document library and an assistant with research, planning and execution agents inspired by LangGraph. The chat calls the API for real; document analysis and agents are interface prototypes with simulated processing, and the database for the full version (Supabase with pgvector) is already modeled.",
    contribution: "Solo study project: interface, Gemini API integration and module structure.",
    outcomes: [
      "Demo published on Vercel.",
      "Working chat with the Gemini API, using the visitor's own key.",
      "Database modeled in Supabase with pgvector for the next step: semantic search.",
    ],
  },
  "fnaf-web": {
    title: "Five Nights at Freddy's Web",
    summary: "Browser remaster of a fan project of the horror classic, with a new game engine, automated tests and continuous deployment.",
    coverAlt: "Five Nights at Freddy's Web menu showing Freddy, Bonnie, Chica and Foxy and the Start button.",
    galleryAlt: [],
    challenge:
      "The original fan project (Wendell de Sousa, 2021) no longer ran on current Node and had state bugs: timers that were never cleared, animatronics ignoring what happened and screens that did not update.",
    solution:
      "Migration to Vite 6 and React 18 and a new tick-based game engine with no setTimeout, replacing the Redux reducers and loose timers: it can be paused, restarted and tested deterministically. Behavior is closer to the original: random routes, rising difficulty and a three-phase blackout.",
    contribution:
      "Solo remaster: bug diagnosis and fixes, engine rewrite, 20 automated tests with Vitest, accessibility (keyboard, aria-label, reduced motion) and automatic deployment to GitHub Pages. Five Nights at Freddy's © Scott Cawthon; non-profit fan project.",
    outcomes: [
      "Game published on GitHub Pages, deployed on every push.",
      "Testable engine with 20 automated tests.",
      "Auto-pause when switching tabs, saved progress and keyboard shortcuts.",
    ],
  },
  "upbeats-karaoke-player": {
    title: "UP! BEATS Karaoke",
    summary:
      "Karaoke that runs in the browser: synced lyrics, real-time removal of the original vocals and a microphone with echo, all processed on the device.",
    coverAlt: "UP! BEATS karaoke mode with the original vocals removed, the voice and microphone controls, the audio visualizer and the synced lyrics filling the line being sung.",
    galleryAlt: [],
    challenge:
      "Build real karaoke without an audio server: strip the vocals from regular songs, show the lyrics on time and let people hear their own voice along with the track, without lag or feedback, in any browser.",
    solution:
      "A single Web Audio API graph mixes music and microphone. Vocals are removed by subtracting the right channel from the left, while bass and treble come back through cascaded filters outside the vocal range, with a smooth control between Original, Guide and Karaoke. Synced lyrics come from LRCLIB and can be calibrated by tapping the line being sung, with the offset saved per song. The microphone has a compressor, echo and two modes: speakers (with echo cancellation) and headphones.",
    contribution:
      "Personal project: audio engine, integration with the iTunes (search and previews) and LRCLIB (lyrics) APIs, lyric calibration, playback of local files, a three-language interface and automatic deployment to GitHub Pages.",
    outcomes: [
      "Published on GitHub Pages, deployed on every push.",
      "Vocal removal and microphone processed in the browser, with no server.",
      "Interface in Portuguese, English and Spanish.",
    ],
  },
  "mwm-portal": {
    title: "MWM Portal",
    summary: "Frontend for corporate and logistics systems: operations dashboards, gate management and cooperative member data.",
    galleryAlt: [],
    challenge:
      "Bring operational and logistics data together in interfaces that work well day to day, while modernizing legacy screens and automating application delivery.",
    solution:
      "SPAs and PWAs in React, TypeScript and Vite, with logistics and quality dashboards, migration of legacy interfaces to Tailwind CSS and Shadcn/UI and integration with Java Spring Boot REST APIs.",
    contribution:
      "I worked as a Senior Frontend Engineer (Sep 2025 to Sep 2026) as part of a team: building the interfaces, modernizing legacy code and automating build and deployment with Docker, Azure Container Apps and Azure DevOps pipelines.",
    outcomes: [
      "Gate management, member and operational data centralized in dashboards.",
      "Legacy interfaces modernized with better responsiveness and accessibility.",
      "Automated build and deployment on Azure DevOps.",
    ],
  },
  "manor-escape": {
    title: "Manor Escape",
    summary: "A Victorian escape room playable in the browser, with four chained puzzles and an interactive 3D safe.",
    coverAlt: "Grandfather clock puzzle in Manor Escape, with a Roman-numeral dial, hour and minute controls and the hint button.",
    galleryAlt: [],
    challenge: "Model a game with a non-linear flow, timer, hints and saved progress without scattering rules across the interface.",
    solution:
      "Game flow in an XState state machine, UI state in Zustand with persistence, a 3D safe in React Three Fiber and puzzles validated by pure functions, all organized with Clean Architecture.",
    contribution: "Solo study project: architecture, interface, 3D scene, unit tests and a full end-to-end walkthrough with Playwright.",
    outcomes: ["Game published on GitHub Pages.", "Reloading the page keeps the game progress."],
  },
  "escudo-cidadao": {
    title: "Escudo Cidadão",
    summary: "A B2C cybersecurity application that helps everyday people protect themselves from online fraud.",
    coverAlt: "Escudo Cidadão dashboard with a security score and link checker in dark mode.",
    galleryAlt: [],
    challenge: "Make anti-scam features, such as checking suspicious links, accessible to non-technical people.",
    solution:
      "A React, TypeScript and Material UI interface with a security score dashboard, link checking and monitoring, backed by a dedicated Node.js and Express API.",
    contribution: "Solo project: full frontend, Node.js API and deployment on Netlify (frontend) and Render (API).",
    outcomes: ["Application published and publicly accessible.", "Environment-based configuration to switch between local and production APIs."],
  },
  "aster-ct": {
    title: "Aster Centro Terapêutico",
    summary: "Institutional website for a therapy clinic, with a blog, contact options and SEO and privacy care.",
    coverAlt: "Home page of the Aster Centro Terapêutico website.",
    galleryAlt: [],
    challenge: "Present the clinic and its services in a welcoming way and make it easy for patients and families to get in touch.",
    solution:
      "A responsive landing page with light and dark themes, a gallery of the facilities, a blog with article pages and sharing, a contact form, a cookie consent banner, sitemap and Open Graph metadata.",
    contribution: "Built the complete website, from layout to deployment.",
    outcomes: ["Website published on GitHub Pages.", "Sitemap, robots and Open Graph configured for search and sharing."],
  },
  "helios-lab": {
    title: "HELIOS Lab",
    summary: "Playable fixed-camera suspense and horror prototype where the puzzles are real physical systems simulated in the browser.",
    coverAlt: "HELIOS Lab repository card on GitHub.",
    galleryAlt: [],
    challenge:
      "Build puzzles that depend on real physics, such as a chaotic double pendulum and fluid convection, with no game engine and running smoothly in the browser.",
    solution:
      "Vite and strict TypeScript with no runtime dependencies: a custom pseudo-3D Canvas 2D renderer, fully procedural Web Audio sound and numerical integrators (Runge-Kutta 4) isolated in a pure domain layer, also used by calibration scripts.",
    contribution:
      "Solo study project: layered architecture, physics simulations, renderer, audio and automated playtest scripts. The final build is a single HTML file.",
    outcomes: ["Three playable physical systems: double pendulum, centrifuge and Galton board.", "Physics domain testable without DOM or Canvas."],
  },
  gascontrol: {
    title: "GasControl",
    summary: "Interface for managing gas consumption in residential buildings, with KPIs, charts, meters and alerts.",
    coverAlt: "GasControl dashboard with meter, reading and alert indicators and a consumption chart.",
    galleryAlt: [],
    challenge: "Give visibility into each building's gas consumption and alerts through an interface that is simple to operate.",
    solution:
      "A React and TypeScript dashboard with KPIs, a daily consumption chart, meter and alert screens, protected routes, a collapsible sidebar and light, dark or system themes.",
    contribution: "Solo frontend project. It runs on a mocked API; backend integration and E2E tests are the next steps.",
    outcomes: ["Complete interface for all planned flows, running on simulated data."],
  },
};

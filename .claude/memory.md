# Memory

## Project
- **Nom:** Liseuse — lecteur Markdown raffiné (français)
- **Type:** Produit web statique destiné publication (GitHub + Vercel)
- **Fichiers:** `index.html` + `styles.css` + `manifest.json` + `sw.js` + `src/*.js` (modules ES)
- **Stack:** HTML/CSS/JS vanilla, `marked.js` 11.1.1, `highlight.js` 11.9.0 (CDN)
- **Design:** thèmes light (papier terracotta) + dark (ambre), Fraunces/Source Serif 4/Inter Tight/JetBrains Mono
- **Backend prévu:** Supabase (auth + storage), Klaviyo (email)
- **Déploiement:** Vercel, repo GitHub

## Now
- v2 Tier 1 + Tier 2 complets (testés en prod via Claude in Chrome)
- Tier 1: ES modules, PWA, IndexedDB library, stats+streak, annotations W3C-anchored, focus mode
- Tier 2: front matter YAML cover (eyebrow/title/subtitle/author/date/tags), inline editor drawer (Cmd+S), print/PDF (@media print)
- Stable alias créé: https://liseuse-datbeat.vercel.app (mais 401 — SSO Auth à désactiver dans dashboard)
- Latest deploy: https://liseuse-36r20rrij-datbeatbusiness.vercel.app
- ⚠⚠ Chaque URL deploy = origin différent → IDB séparé. SEUL l'alias stable préserve les données utilisateur. CRITIQUE: désactiver Vercel Auth dashboard avant launch.
- Prochain: Tier 2.2 (Supabase sync — agent du 03/05 prépare schéma), ou TTS, ou stop
- Repo: https://github.com/DatBeat/liseuse

## Goals
- Publier produit fini multi-utilisateurs
- Roadmap restante:
  1. Sync Supabase (auth + cloud library)
  2. URLs publiques de partage + OG images
  3. AI: résumé / Q&A / auto-tagging
  4. Email digest hebdo (Klaviyo)
- Done v2: bibliothèque locale, PWA, stats+streak, annotations, focus, front matter, édition inline, export PDF
- Pain points: SSO Vercel à désactiver, parsing edge cases gros fichiers MD

## Workflow
- Solo + Claude Code exclusif
- Itération: édit → refresh navigateur
- Publish: push GitHub → auto-deploy Vercel
- Backend Supabase pour auth/storage, Klaviyo pour emails utilisateurs

## Open Threads
- Schéma Supabase: PR de l'agent planifié pour 03/05
- Wire Supabase client + auth magic link (post-PR)
- Sync IDB ↔ Supabase: queue offline-first à designer

## Recent Decisions
- Split mono-fichier en modules ES (042626)
- Stack: GitHub + Vercel + Supabase + Klaviyo (042626)
- Print CSS plutôt que jsPDF/server-side pour export PDF (042626)
- Annotations: W3C TextQuoteSelector (prefix+text+suffix, 30 chars) (042626)

## Blockers
- Vercel SSO Authentication empêche accès public à l'alias stable — désactivation dashboard requise par l'utilisateur

## Key Paths
- App: `index.html` / `styles.css` / `src/main.js` (entry)
- Modules: `src/storage.js`, `src/library.js`, `src/reader.js`, `src/stats.js`, `src/annotations.js`, `src/focus.js`, `src/editor.js`, `src/print.js`, `src/frontmatter.js`
- PWA: `manifest.json` + `sw.js` + `icons/icon.svg`
- Tâches: `Task Board.md` · Daily Notes: `Daily Notes/` · Scratchpad: `Scratchpad.md`
- GitHub: `DatBeat/liseuse` · Vercel project: `datbeatbusiness/liseuse` · Stable alias: `liseuse-datbeat.vercel.app`

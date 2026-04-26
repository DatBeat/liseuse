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
- v2 Wave 1 livrée: ES modules, PWA, IndexedDB library
- À tester sur prod: install PWA, library drawer, search, persistence après reload
- Prochain: Wave 2 (stats + streak) puis Wave 3 (annotations + focus)
- App live: https://liseuse-qsookxbaz-datbeatbusiness.vercel.app
- Repo: https://github.com/DatBeat/liseuse

## Goals
- Publier produit fini multi-utilisateurs
- Roadmap features:
  1. Multi-fichiers + bibliothèque
  2. Sauvegarde (Supabase)
  3. Export PDF
  4. Retouche / édition fichiers MD
  5. Recherche
- Pain points actuels: design qualité production + parsing fiable de fichiers MD originels variés

## Workflow
- Solo + Claude Code exclusif
- Itération: édit → refresh navigateur
- Publish: push GitHub → auto-deploy Vercel
- Backend Supabase pour auth/storage, Klaviyo pour emails utilisateurs

## Open Threads
- Architecture multi-fichiers (modules JS, CSS séparé, build tool ou non?)
- Schéma Supabase pour bibliothèque MD
- Stratégie export PDF (print CSS vs jsPDF vs server-side)

## Recent Decisions
- Split mono-fichier OK (autorisé par utilisateur 042626)
- Stack confirmée: GitHub + Vercel + Supabase + Klaviyo

## Blockers
- (none)

## Key Paths
- App: `index.html` / `styles.css` / `src/main.js` (entry)
- Modules: `src/storage.js` (IDB), `src/library.js`, `src/reader.js`, `src/stats.js`, `src/annotations.js`, `src/focus.js`
- PWA: `manifest.json` + `sw.js` + `icons/icon.svg`
- Tâches: `Task Board.md`
- Daily Notes: `Daily Notes/`
- Scratchpad: `Scratchpad.md`
- GitHub: `DatBeat/liseuse`
- Vercel project: `datbeatbusiness/liseuse`

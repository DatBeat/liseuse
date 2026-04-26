# Memory

## Project
- **Nom:** Liseuse — lecteur Markdown raffiné (français)
- **Type:** Produit web statique destiné publication (GitHub + Vercel)
- **Fichiers:** `index.html` (markup) + `styles.css` (design) + `app.js` (comportement)
- **Stack:** HTML/CSS/JS vanilla, `marked.js` 11.1.1, `highlight.js` 11.9.0 (CDN)
- **Design:** thèmes light (papier terracotta) + dark (ambre), Fraunces/Source Serif 4/Inter Tight/JetBrains Mono
- **Backend prévu:** Supabase (auth + storage), Klaviyo (email)
- **Déploiement:** Vercel, repo GitHub

## Now
- Onboarding Claudify ✓ + split modules ✓ + GitHub ✓ + Vercel ✓
- App live: https://liseuse-qsookxbaz-datbeatbusiness.vercel.app
- Repo: https://github.com/DatBeat/liseuse
- Prochain: tester déploiement, planifier schéma Supabase

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
- App: `index.html` / `styles.css` / `app.js`
- Tâches: `Task Board.md`
- Daily Notes: `Daily Notes/`
- Scratchpad: `Scratchpad.md`
- GitHub: `DatBeat/liseuse`
- Vercel project: `datbeatbusiness/liseuse`

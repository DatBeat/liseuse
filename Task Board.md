# Task Board

## Today (2026-04-27 — tomorrow's priorities)
- [ ] **Désactiver Vercel Authentication** — Dashboard → Project → Settings → Deployment Protection. Débloque `liseuse-datbeat.vercel.app` public + auto-tracking dernier prod
- [ ] Vérifier `liseuse-datbeat.vercel.app` répond 200 sans auth après #1, et que IDB persiste cross-deploy via cet alias
- [ ] Tester parsing edge cases: charger un gros fichier MD réel (>500 ko) et vérifier perf + rendu

## This Week
- [ ] Review PR de l'agent planifié 03/05 (Supabase schema draft + health check)
- [ ] Une fois PR mergée: wire client Supabase, auth magic link, sync IDB ↔ Supabase (offline-first queue)
- [ ] Améliorer parsing fichiers MD originels (edge cases identifiés)
- [ ] (Optionnel) Configurer domaine custom `.app`/`.fr`

## Backlog
- [ ] Phase 3 — URLs publiques de partage (doc → URL unique read-only) + OG images auto
- [ ] Phase 3 — AI assistant (résumé / Q&A / auto-tagging) — premium feature
- [ ] Phase 3 — Email digest hebdo via Klaviyo (streak + recommandations)
- [ ] TTS / lecture audio (Web Speech API)
- [ ] Multi-fichiers UI sidebar persistante
- [ ] Heatmap calendrier 12 semaines (extension stats modal)
- [ ] Icônes PNG haute-résolution (actuellement SVG seul)
- [ ] Mermaid diagrams + KaTeX math support
- [ ] Wiki-links `[[doc]]` style Obsidian

## Done
- [x] [042626] Onboarding Claudify (`/start`)
- [x] [042626] Init git + push GitHub `DatBeat/liseuse`
- [x] [042626] Connect Vercel deployment + project `datbeatbusiness/liseuse`
- [x] [042626] Split mono-fichier `liseuse.html` → `index.html` + `styles.css` + `app.js`
- [x] [042626] v2 Wave 1: ES modules + PWA (manifest + SW + icône SVG) + IndexedDB library + drawer + auto-restore (testé prod ✓)
- [x] [042626] v2 Wave 2: stats tracking (5s tick + idle 60s) + badge topbar + modal hero/chart/totals + streak (testé ✓)
- [x] [042626] v2 Wave 3: annotations (3 colors + notes, W3C anchoring prefix/suffix) + focus mode (testé ✓)
- [x] [042626] v2 Tier 2: front matter YAML cover + inline editor drawer (Cmd+S) + print/PDF (@media print) (testé ✓)
- [x] [042626] Setup alias Vercel `liseuse-datbeat.vercel.app` (auth pending)
- [x] [042626] Schedule remote agent 2026-05-03: health check + Supabase schema PR draft

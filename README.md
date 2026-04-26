# MDRead

Un lecteur Markdown raffiné. Lire, en paix.

Site: [mdread.com](https://mdread.com) *(domaine en cours d'acquisition)*

## Stack

- HTML / CSS / JavaScript vanilla — **ES modules**, pas de build tool
- IndexedDB pour la persistance locale (bibliothèque, annotations, stats)
- PWA installable (manifest + service worker)
- [marked.js](https://marked.js.org/) 11.1.1 — parser Markdown
- [highlight.js](https://highlightjs.org/) 11.9.0 — coloration syntaxique
- Polices: Fraunces, Source Serif 4, Inter Tight, JetBrains Mono

## Fonctionnalités

**Lecture**
- Typographie soignée, thèmes light (papier terracotta) et dark (ambre)
- Mode focus — paragraphe central net, le reste en retrait
- Sommaire automatique avec scroll-spy
- Drop cap, end-mark décoratif

**Bibliothèque**
- Drag & drop de fichiers `.md`, `.markdown`, `.txt`, `.mdx`
- Sauvegarde locale (IndexedDB), recherche full-text, ⌘K pour ouvrir le drawer
- Auto-restore du dernier document à la réouverture
- Front matter YAML (titre, sous-titre, auteur, date, tags) → couverture stylisée

**Annotations**
- Surlignage 3 couleurs + notes attachées
- Anchoring W3C TextQuoteSelector (prefix + texte + suffix) — survit aux re-rendus
- Persistance cross-session via IndexedDB

**Statistiques**
- Suivi du temps de lecture actif (5s tick, idle 60s)
- Streak de jours consécutifs (≥ 1 min/jour)
- Modal avec hero, graphique 14 jours, totaux

**Édition**
- Drawer d'édition avec textarea Markdown
- ⌘S pour enregistrer, sauvegarde dans IndexedDB

**Export**
- Print / PDF via le navigateur (CSS `@media print` soigné, page-break, URL des liens)

**Hors-ligne**
- Service Worker — l'application charge depuis le cache après la première visite

## Structure

```
.
├── index.html         # markup + drawers (library + editor) + modals (stats)
├── styles.css         # design system + composants + @media print
├── manifest.json      # PWA
├── sw.js              # service worker (cache-first shell)
├── icons/icon.svg     # icône maskable
├── src/
│   ├── main.js        # entry point — initialise tous les modules
│   ├── storage.js     # wrapper IndexedDB (documents, annotations, stats, meta)
│   ├── reader.js      # rendu Markdown + thème + TOC + scroll-spy
│   ├── frontmatter.js # parser YAML head + cover renderer
│   ├── library.js     # drawer bibliothèque + recherche + CRUD docs
│   ├── stats.js       # tracking lecture + streak + modal stats
│   ├── annotations.js # surlignage W3C-anchored + toolbar
│   ├── focus.js       # mode focus paragraphe central
│   ├── editor.js      # drawer édition inline + save back IDB
│   └── print.js       # déclenche window.print() (CSS gère le rendu)
└── .claude/           # Claudify operating system (mémoire, agents, hooks)
```

## Lancer en local

Les ES modules nécessitent un serveur HTTP (pas `file://`). Au choix :

```bash
npx serve .
# ou
python -m http.server
```

Puis ouvrir `http://localhost:3000` (ou le port indiqué).

## Roadmap

**v2 — habit foundation** *(livré)*
- [x] Bibliothèque locale (IndexedDB) + recherche
- [x] PWA installable + offline
- [x] Reading stats + streak
- [x] Annotations / highlights
- [x] Mode focus
- [x] Front matter + couverture
- [x] Édition inline
- [x] Export PDF (`@media print`)

**v2.2 — sync & viralité** *(à venir)*
- [ ] Sync Supabase (auth + cloud library)
- [ ] URLs publiques de partage + OG images
- [ ] AI assistant (résumé, Q&A, auto-tagging)
- [ ] Email digest hebdo (Klaviyo)

## Licence

Tous droits réservés — DatBeat © 2026.

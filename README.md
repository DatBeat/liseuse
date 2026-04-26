# Liseuse

Un lecteur Markdown raffiné — lire, en paix.

## Stack

- HTML / CSS / JavaScript vanilla — **ES modules**, pas de build tool
- IndexedDB pour la persistance locale (bibliothèque, annotations, stats)
- PWA installable (manifest + service worker)
- [marked.js](https://marked.js.org/) 11.1.1 — parser Markdown
- [highlight.js](https://highlightjs.org/) 11.9.0 — coloration syntaxique
- Polices: Fraunces, Source Serif 4, Inter Tight, JetBrains Mono

## Structure

```
.
├── index.html         # markup + drawer bibliothèque
├── styles.css         # design system + composants
├── manifest.json      # PWA
├── sw.js              # service worker (offline + cache)
├── icons/             # icônes PWA
├── src/
│   ├── main.js        # entry point
│   ├── storage.js     # IndexedDB wrapper
│   ├── reader.js      # rendu Markdown + thème + TOC
│   ├── library.js     # bibliothèque + recherche
│   ├── stats.js       # tracking lecture (Wave 2)
│   ├── annotations.js # surlignage (Wave 3)
│   └── focus.js       # mode focus (Wave 3)
└── .claude/           # Claudify operating system
```

## Lancer en local

Les ES modules nécessitent un serveur HTTP (pas `file://`). Au choix:

```bash
npx serve .          # rapide
python -m http.server # ou
```

Puis ouvrir `http://localhost:3000` (ou port indiqué).

## Déploiement

Push sur `main` → Vercel déploie automatiquement.

## Roadmap

**v2.0 — habit foundation**
- [x] Bibliothèque locale (IndexedDB) + recherche
- [x] PWA installable + offline
- [ ] Reading stats + streak (Wave 2)
- [ ] Annotations / highlights (Wave 3)
- [ ] Mode focus (Wave 3)

**v2.1 — différenciation**
- [ ] Édition inline + save-back
- [ ] Export PDF beau
- [ ] Front matter + métadonnées

**v2.2 — sync & viralité**
- [ ] Sync Supabase (auth + storage)
- [ ] URLs publiques de partage
- [ ] AI assistant (résumé, Q&A)
- [ ] Email digest hebdo (Klaviyo)

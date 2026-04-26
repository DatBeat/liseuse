# Liseuse

Un lecteur Markdown raffiné — lire, en paix.

## Stack

- HTML / CSS / JavaScript vanilla (pas de build tool)
- [marked.js](https://marked.js.org/) 11.1.1 — parser Markdown
- [highlight.js](https://highlightjs.org/) 11.9.0 — coloration syntaxique
- Polices: Fraunces, Source Serif 4, Inter Tight, JetBrains Mono

## Structure

```
.
├── index.html      # markup
├── styles.css      # design system + composants
├── app.js          # comportement (parser, thème, TOC, drop)
└── .claude/        # Claudify operating system
```

## Lancer en local

Ouvrir `index.html` dans un navigateur. Aucun build, aucun serveur requis pour l'usage de base.

## Déploiement

Push sur `main` → Vercel déploie automatiquement.

## Roadmap

- [ ] Multi-fichiers + bibliothèque
- [ ] Sauvegarde Supabase
- [ ] Export PDF
- [ ] Édition / retouche
- [ ] Recherche

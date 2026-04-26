/* Liseuse v2 — entry point */

import { initTheme, initProgressBar, renderMarkdown, showUploadView } from './reader.js';
import {
  initLibraryUI,
  importFile,
  importText,
  restoreLastDocument,
  openLibrary,
} from './library.js';
import { initStats } from './stats.js';
import { initAnnotations } from './annotations.js';
import { initFocusMode } from './focus.js';
import { initEditor } from './editor.js';
import { initPrint } from './print.js';

const $ = (s) => document.querySelector(s);

function initFileHandling() {
  const fileInput = $('#file-input');
  const dropzone = $('#dropzone');
  const uploadView = $('#upload-view');
  const newFileBtn = $('#new-file-btn');

  fileInput.addEventListener('change', (e) => importFile(e.target.files[0]));

  ['dragenter', 'dragover'].forEach((ev) => {
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragging');
    });
  });
  ['dragleave', 'drop'].forEach((ev) => {
    dropzone.addEventListener(ev, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragging');
    });
  });
  dropzone.addEventListener('drop', (e) => {
    importFile(e.dataTransfer?.files?.[0]);
  });

  document.addEventListener('dragover', (e) => e.preventDefault());
  document.addEventListener('drop', (e) => {
    e.preventDefault();
    if (uploadView.style.display !== 'none') {
      importFile(e.dataTransfer?.files?.[0]);
    }
  });

  newFileBtn.addEventListener('click', showUploadView);
}

const SAMPLE_MD = `# Le Plaisir de Lire

*Une méditation sur les mots, le papier, et le temps retrouvé.*

Il existe quelque chose de **profondément mystérieux** dans l'acte de lire. Un simple arrangement de caractères sur une page — noirs sur blanc, ou blancs sur noir — parvient à transporter l'esprit dans des mondes lointains, à faire surgir des voix disparues, à ressusciter des paysages jamais vus.

La lecture, au fond, est une forme de magie lente.

## L'origine des signes

> Les livres sont des amis silencieux, et le papier un miroir de l'âme.
>
> — Proverbe attribué à Cicéron

Depuis l'invention de l'écriture cunéiforme en Mésopotamie, vers 3200 avant notre ère, l'humanité n'a cessé de perfectionner l'art de consigner la pensée.

### Les grandes étapes

1. **L'écriture cunéiforme** — Mésopotamie, vers 3200 av. J.-C.
2. **Les hiéroglyphes égyptiens** — vers 3100 av. J.-C.
3. **L'alphabet phénicien** — vers 1050 av. J.-C.
4. **L'imprimerie de Gutenberg** — Mayence, 1450.
5. **Le livre numérique** — années 1970.

## La typographie, art discret

La typographie, cet art discret mais essentiel, façonne notre lecture plus qu'on ne l'imagine.

\`\`\`javascript
function lire(livre) {
  return livre.pages
    .flatMap(page => page.mots)
    .reduce((esprit, mot) => {
      esprit.songe(mot);
      return esprit;
    }, new Esprit());
}
\`\`\`

| Famille | Exemple | Usage |
|---------|---------|-------|
| Sérif humaniste | Garamond | Textes longs |
| Sans-sérif | Inter | Interface |
| Monospace | JetBrains Mono | Code |

## L'expérience de lecture

Lire, c'est ralentir.

- **La patience retrouvée**
- **L'empathie élargie**
- **Le silence intérieur**

---

*Bonne lecture.*`;

function initSampleButton() {
  $('#sample-btn').addEventListener('click', () => {
    importText(SAMPLE_MD, 'Le Plaisir de Lire — extrait');
  });
}

function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('SW registration failed:', err);
      });
    });
  }
}

// ─── Boot ───
async function boot() {
  initTheme();
  initProgressBar();
  initFileHandling();
  initSampleButton();
  initLibraryUI();
  initStats();
  initAnnotations();
  initFocusMode();
  initEditor();
  initPrint();
  initServiceWorker();

  // Try to restore last opened document
  const restored = await restoreLastDocument();
  if (!restored) {
    showUploadView();
  }
}

boot();

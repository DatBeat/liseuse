/* ═══════════════════════════════════════════════════════
   LISEUSE — behaviour
   ═══════════════════════════════════════════════════════ */

const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

marked.setOptions({
  breaks: false,
  gfm: true,
});

// ─── Theme toggle ───
const themeBtn = $('#toggle-theme');
const iconTheme = $('#icon-theme');
const sunIcon = `<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>`;
const moonIcon = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;

function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  iconTheme.innerHTML = t === 'dark' ? sunIcon : moonIcon;
}

const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
setTheme(prefersDark ? 'dark' : 'light');

themeBtn.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
});

// ─── File handling ───
const fileInput = $('#file-input');
const dropzone = $('#dropzone');
const uploadView = $('#upload-view');
const readerView = $('#reader-view');
const content = $('#content');
const filenameDisplay = $('#filename-display');
const newFileBtn = $('#new-file-btn');

function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function buildTOC() {
  const tocList = $('#toc-list');
  tocList.innerHTML = '';
  const headings = content.querySelectorAll('h1, h2, h3, h4');
  if (headings.length < 2) {
    $('#toc').style.display = 'none';
    document.querySelector('.reader-layout').style.gridTemplateColumns = '1fr';
    return;
  }
  $('#toc').style.display = '';
  headings.forEach((h, i) => {
    const text = h.textContent;
    const id = 'sec-' + i + '-' + slugify(text).slice(0, 40);
    h.id = id;
    const level = parseInt(h.tagName.substring(1));
    const li = document.createElement('li');
    li.className = 'level-' + level;
    const a = document.createElement('a');
    a.href = '#' + id;
    a.textContent = text;
    a.dataset.target = id;
    li.appendChild(a);
    tocList.appendChild(li);
  });
  setupScrollSpy();
}

function setupScrollSpy() {
  const headings = content.querySelectorAll('h1, h2, h3, h4');
  const tocLinks = $$('#toc-list a');
  if (!headings.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        tocLinks.forEach((l) => l.classList.remove('active'));
        const active = document.querySelector(`#toc-list a[data-target="${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, {
    rootMargin: '-80px 0px -70% 0px',
    threshold: 0,
  });

  headings.forEach((h) => observer.observe(h));
}

function renderMarkdown(text, filename) {
  const html = marked.parse(text);
  content.innerHTML = html;

  const endMark = document.createElement('div');
  endMark.className = 'end-mark';
  endMark.textContent = '❋  F I N  ❋';
  content.appendChild(endMark);

  content.querySelectorAll('pre code').forEach((block) => {
    try { hljs.highlightElement(block); } catch (e) { /* ok */ }
  });

  buildTOC();

  filenameDisplay.textContent = filename || 'Document';
  newFileBtn.style.display = 'inline-flex';

  uploadView.style.display = 'none';
  readerView.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'instant' });
}

function handleFile(file) {
  if (!file) return;
  const name = file.name.toLowerCase();
  const isValid = /\.(md|markdown|mdx|txt)$/.test(name) || file.type.includes('markdown') || file.type === 'text/plain';
  if (!isValid) {
    dropzone.animate(
      [{ transform: 'translateX(0)' }, { transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'translateX(0)' }],
      { duration: 350 }
    );
    return;
  }
  const reader = new FileReader();
  reader.onload = (e) => renderMarkdown(e.target.result, file.name);
  reader.readAsText(file);
}

fileInput.addEventListener('change', (e) => handleFile(e.target.files[0]));

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
  const file = e.dataTransfer?.files?.[0];
  handleFile(file);
});

document.addEventListener('dragover', (e) => { e.preventDefault(); });
document.addEventListener('drop', (e) => {
  e.preventDefault();
  if (uploadView.style.display !== 'none') {
    handleFile(e.dataTransfer?.files?.[0]);
  }
});

newFileBtn.addEventListener('click', () => {
  readerView.classList.remove('active');
  uploadView.style.display = '';
  filenameDisplay.textContent = '';
  newFileBtn.style.display = 'none';
  fileInput.value = '';
  window.scrollTo({ top: 0, behavior: 'instant' });
});

// ─── Reading progress bar ───
const progress = $('#progress');
function updateProgress() {
  if (!readerView.classList.contains('active')) {
    progress.style.width = '0';
    return;
  }
  const scrolled = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const pct = max > 0 ? Math.min(100, (scrolled / max) * 100) : 0;
  progress.style.width = pct + '%';
}
window.addEventListener('scroll', updateProgress, { passive: true });

// ─── Sample content ───
const SAMPLE_MD = `# Le Plaisir de Lire

*Une méditation sur les mots, le papier, et le temps retrouvé.*

Il existe quelque chose de **profondément mystérieux** dans l'acte de lire. Un simple arrangement de caractères sur une page — noirs sur blanc, ou blancs sur noir — parvient à transporter l'esprit dans des mondes lointains, à faire surgir des voix disparues, à ressusciter des paysages jamais vus.

La lecture, au fond, est une forme de magie lente.

## L'origine des signes

> Les livres sont des amis silencieux, et le papier un miroir de l'âme.
>
> — Proverbe attribué à Cicéron

Depuis l'invention de l'écriture cunéiforme en Mésopotamie, vers 3200 avant notre ère, l'humanité n'a cessé de perfectionner l'art de consigner la pensée. De la tablette d'argile au parchemin, du codex au livre imprimé, puis à l'écran — chaque support a transformé notre rapport au texte.

### Les grandes étapes

1. **L'écriture cunéiforme** — Mésopotamie, vers 3200 av. J.-C.
2. **Les hiéroglyphes égyptiens** — vers 3100 av. J.-C.
3. **L'alphabet phénicien** — vers 1050 av. J.-C.
4. **L'imprimerie de Gutenberg** — Mayence, 1450.
5. **Le livre numérique** — années 1970.

Chacune de ces révolutions a démocratisé un peu plus l'accès au savoir, élargi le cercle des lecteurs, et bouleversé les équilibres culturels de son temps.

## La typographie, art discret

La typographie, cet art discret mais essentiel, façonne notre lecture plus qu'on ne l'imagine. Chaque caractère a été dessiné avec soin — son galbe, son contraste, ses proportions répondent à des siècles d'affinage patient.

Les polices *sérif*, avec leurs petites pattes héritées de la gravure romaine, guident l'œil sur la ligne ; les *sans-sérif*, plus modernes, incarnent la clarté fonctionnelle du XXᵉ siècle.

\`\`\`javascript
// Une métaphore en code
function lire(livre) {
  return livre.pages
    .flatMap(page => page.mots)
    .reduce((esprit, mot) => {
      esprit.songe(mot);
      return esprit;
    }, new Esprit());
}

const moi = lire(nouveauLivre);
console.log(moi.reveries); // → infinies
\`\`\`

### Les familles typographiques

| Famille | Exemple | Usage principal |
|---------|---------|-----------------|
| Sérif humaniste | Garamond, Jenson | Textes longs, littérature |
| Sérif moderne | Bodoni, Didot | Éditorial, mode |
| Sans-sérif géométrique | Futura, Avenir | Signalétique, titrage |
| Sans-sérif humaniste | Optima, Gill Sans | Interface, corps de texte |
| Monospace | Courier, JetBrains Mono | Code, données techniques |

Chaque famille porte en elle une intention, presque une philosophie : la sobriété luxueuse du Didot n'a rien à voir avec la chaleur rustique du Caslon, ni avec la neutralité scientifique du Helvetica.

## L'expérience de lecture

Lire, c'est ralentir. C'est s'offrir le luxe du temps suspendu, à rebours de notre époque pressée. Dans un monde qui accélère — alertes, notifications, flux infinis — le livre demeure. Immuable. Patient. Prêt à nous accueillir sans nous juger, sans nous réclamer une réponse immédiate.

Certains appellent cela un *refuge*. D'autres, un *exercice*. Peu importe le mot : ce qui compte, c'est le geste.

### Quelques vertus secrètes

- **La patience retrouvée** : apprendre à nouveau à tenir sur une phrase longue.
- **L'empathie élargie** : habiter, l'espace d'un chapitre, la conscience d'un autre.
- **Le silence intérieur** : cette voix qui lit dans notre tête, et nous appartient en propre.

---

*Bonne lecture.*`;

$('#sample-btn').addEventListener('click', () => {
  renderMarkdown(SAMPLE_MD, 'Le Plaisir de Lire — extrait');
});

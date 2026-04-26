/* MDRead — Markdown rendering, TOC, theme */

import { parseFrontMatter, renderFrontMatterCover } from './frontmatter.js';

const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => root.querySelectorAll(s);

window.marked.setOptions({ breaks: false, gfm: true });

// ─── Theme ───
const themeBtn = $('#toggle-theme');
const iconTheme = $('#icon-theme');
const sunIcon = `<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>`;
const moonIcon = `<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>`;

export function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  iconTheme.innerHTML = t === 'dark' ? sunIcon : moonIcon;
  localStorage.setItem('liseuse-theme', t);
}

export function initTheme() {
  const stored = localStorage.getItem('liseuse-theme');
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  setTheme(stored || (prefersDark ? 'dark' : 'light'));
  themeBtn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    setTheme(current === 'dark' ? 'light' : 'dark');
  });
}

// ─── Slugify (preserves accents stripping) ───
export function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

// ─── TOC ───
function buildTOC(content) {
  const tocList = $('#toc-list');
  tocList.innerHTML = '';
  const headings = content.querySelectorAll('h1, h2, h3, h4');
  if (headings.length < 2) {
    $('#toc').style.display = 'none';
    $('.reader-layout').style.gridTemplateColumns = '1fr';
    return;
  }
  $('#toc').style.display = '';
  $('.reader-layout').style.gridTemplateColumns = '';
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
  setupScrollSpy(content);
}

function setupScrollSpy(content) {
  const headings = content.querySelectorAll('h1, h2, h3, h4');
  const tocLinks = $$('#toc-list a');
  if (!headings.length) return;
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        tocLinks.forEach((l) => l.classList.remove('active'));
        const active = $(`#toc-list a[data-target="${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 });
  headings.forEach((h) => observer.observe(h));
}

// ─── Render ───
export function renderMarkdown(text, filename) {
  const content = $('#content');
  const uploadView = $('#upload-view');
  const readerView = $('#reader-view');
  const filenameDisplay = $('#filename-display');
  const newFileBtn = $('#new-file-btn');

  const { data: frontMatter, body } = parseFrontMatter(text);
  const cover = renderFrontMatterCover(frontMatter);
  const html = cover + window.marked.parse(body);
  content.innerHTML = html;

  const endMark = document.createElement('div');
  endMark.className = 'end-mark';
  endMark.textContent = '❋  F I N  ❋';
  content.appendChild(endMark);

  content.querySelectorAll('pre code').forEach((block) => {
    try { window.hljs.highlightElement(block); } catch (e) {}
  });

  buildTOC(content);

  filenameDisplay.textContent = filename || 'Document';
  newFileBtn.style.display = 'inline-flex';

  uploadView.style.display = 'none';
  readerView.classList.add('active');

  window.scrollTo({ top: 0, behavior: 'instant' });

  // Notify subscribers (stats, annotations will hook in)
  window.dispatchEvent(new CustomEvent('liseuse:document-rendered', {
    detail: { text, filename }
  }));
}

export function showUploadView() {
  $('#reader-view').classList.remove('active');
  $('#upload-view').style.display = '';
  $('#filename-display').textContent = '';
  $('#new-file-btn').style.display = 'none';
  $('#file-input').value = '';
  window.scrollTo({ top: 0, behavior: 'instant' });
  window.dispatchEvent(new CustomEvent('liseuse:upload-shown'));
}

// ─── Reading progress bar ───
export function initProgressBar() {
  const progress = $('#progress');
  const readerView = $('#reader-view');
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
}

/* Library — sidebar with doc list, search, recent files */

import * as store from './storage.js';
import { renderMarkdown, showUploadView } from './reader.js';

const $ = (s) => document.querySelector(s);

let currentDocId = null;

export function getCurrentDocId() {
  return currentDocId;
}

export async function openDocument(id) {
  const doc = await store.getDocument(id);
  if (!doc) return;
  currentDocId = doc.id;
  await store.setMeta('last_opened', doc.id);
  renderMarkdown(doc.content, doc.title);
  closeLibrary();
  refreshList();
}

export async function importFile(file) {
  if (!file) return null;
  const name = file.name.toLowerCase();
  const isValid = /\.(md|markdown|mdx|txt)$/.test(name) || file.type.includes('markdown') || file.type === 'text/plain';
  if (!isValid) return null;
  const text = await file.text();
  const title = file.name.replace(/\.[^.]+$/, '');
  const doc = await store.saveDocument({ title, content: text });
  currentDocId = doc.id;
  await store.setMeta('last_opened', doc.id);
  renderMarkdown(doc.content, doc.title);
  refreshList();
  return doc;
}

export async function importText(text, title = 'Document') {
  const doc = await store.saveDocument({ title, content: text });
  currentDocId = doc.id;
  await store.setMeta('last_opened', doc.id);
  renderMarkdown(doc.content, doc.title);
  refreshList();
  return doc;
}

export async function deleteCurrentDoc() {
  if (!currentDocId) return;
  await store.deleteDocument(currentDocId);
  currentDocId = null;
  showUploadView();
  refreshList();
}

// ─── Sidebar UI ───
export function openLibrary() {
  $('#library-drawer').classList.add('open');
  $('#library-backdrop').classList.add('visible');
  refreshList();
  setTimeout(() => $('#library-search').focus(), 100);
}

export function closeLibrary() {
  $('#library-drawer').classList.remove('open');
  $('#library-backdrop').classList.remove('visible');
}

async function refreshList(query = '') {
  const list = $('#library-list');
  const empty = $('#library-empty');
  const docs = query ? await store.searchDocuments(query) : await store.listDocuments();

  list.innerHTML = '';

  if (docs.length === 0) {
    empty.style.display = '';
    list.style.display = 'none';
    return;
  }

  empty.style.display = 'none';
  list.style.display = '';

  docs.forEach((doc) => {
    const li = document.createElement('li');
    li.className = 'lib-item' + (doc.id === currentDocId ? ' active' : '');
    li.innerHTML = `
      <button class="lib-open" data-id="${doc.id}">
        <span class="lib-title">${escapeHtml(doc.title)}</span>
        <span class="lib-meta">${formatDate(doc.updated_at)} · ${formatSize(doc.file_size)}</span>
      </button>
      <button class="lib-delete" data-id="${doc.id}" title="Supprimer" aria-label="Supprimer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/></svg>
      </button>
    `;
    list.appendChild(li);
  });

  list.querySelectorAll('.lib-open').forEach((btn) => {
    btn.addEventListener('click', () => openDocument(btn.dataset.id));
  });
  list.querySelectorAll('.lib-delete').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (!confirm('Supprimer ce document ?')) return;
      await store.deleteDocument(btn.dataset.id);
      if (btn.dataset.id === currentDocId) {
        currentDocId = null;
        showUploadView();
      }
      refreshList(query);
    });
  });
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function formatDate(ts) {
  const d = new Date(ts);
  const now = new Date();
  const dayMs = 86400000;
  const diff = now - d;
  if (diff < dayMs && d.getDate() === now.getDate()) return 'aujourd’hui';
  if (diff < 2 * dayMs) return 'hier';
  if (diff < 7 * dayMs) return `il y a ${Math.floor(diff / dayMs)} j`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} ko`;
  return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
}

export function initLibraryUI() {
  $('#library-btn').addEventListener('click', openLibrary);
  $('#library-close').addEventListener('click', closeLibrary);
  $('#library-backdrop').addEventListener('click', closeLibrary);
  $('#library-search').addEventListener('input', (e) => refreshList(e.target.value));

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && $('#library-drawer').classList.contains('open')) {
      closeLibrary();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      openLibrary();
    }
  });
}

export async function restoreLastDocument() {
  const lastId = await store.getMeta('last_opened');
  if (!lastId) return false;
  const doc = await store.getDocument(lastId);
  if (!doc) return false;
  currentDocId = doc.id;
  renderMarkdown(doc.content, doc.title);
  return true;
}

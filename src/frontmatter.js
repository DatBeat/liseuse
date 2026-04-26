/* Simple YAML front matter parser (no deps) */

const FM_RE = /^---\s*\n([\s\S]*?)\n---\s*\n/;

function parseValue(v) {
  v = v.trim();
  if (!v) return '';
  if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1);
  if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
  if (v.startsWith('[') && v.endsWith(']')) {
    return v.slice(1, -1).split(',').map((s) => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  }
  return v;
}

export function parseFrontMatter(text) {
  const match = text.match(FM_RE);
  if (!match) return { data: null, body: text };
  const yaml = match[1];
  const data = {};
  let currentKey = null;
  let listItems = null;
  for (const line of yaml.split('\n')) {
    if (!line.trim()) continue;
    if (line.match(/^\s+-\s+/) && currentKey) {
      if (!Array.isArray(listItems)) listItems = [];
      listItems.push(parseValue(line.replace(/^\s+-\s+/, '')));
      data[currentKey] = listItems;
      continue;
    }
    const m = line.match(/^([\w-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    currentKey = m[1];
    const val = parseValue(m[2]);
    if (val === '' || val === null) {
      listItems = [];
      data[currentKey] = listItems;
    } else {
      listItems = null;
      data[currentKey] = val;
    }
  }
  return { data, body: text.slice(match[0].length) };
}

export function renderFrontMatterCover(data) {
  if (!data) return '';
  const parts = [];
  parts.push('<div class="fm-cover">');
  if (data.eyebrow || data.category) {
    parts.push(`<div class="fm-eyebrow">${escapeHtml(data.eyebrow || data.category)}</div>`);
  }
  if (data.title) {
    parts.push(`<h1 class="fm-title">${escapeHtml(data.title)}</h1>`);
  }
  if (data.subtitle) {
    parts.push(`<p class="fm-subtitle">${escapeHtml(data.subtitle)}</p>`);
  }
  const meta = [];
  if (data.author) meta.push(`<span class="fm-author">${escapeHtml(data.author)}</span>`);
  if (data.date) meta.push(`<time class="fm-date">${escapeHtml(formatDate(data.date))}</time>`);
  if (meta.length) {
    parts.push(`<div class="fm-meta">${meta.join('<span class="fm-sep">·</span>')}</div>`);
  }
  if (Array.isArray(data.tags) && data.tags.length) {
    parts.push(`<div class="fm-tags">${data.tags.map((t) => `<span class="fm-tag">${escapeHtml(t)}</span>`).join('')}</div>`);
  }
  parts.push('</div>');
  return parts.join('');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function formatDate(d) {
  try {
    const date = new Date(d);
    if (isNaN(date)) return d;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  } catch (e) {
    return d;
  }
}

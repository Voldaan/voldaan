export function ensureKnowledgeState(state) {
  if (!state) return null;

  state.feed = state.feed || {
    currentIndex: 0,
    savedTips: [],
  };

  state.feed.savedTips = state.feed.savedTips || [];
  return state.feed;
}

export function addKnowledgeTip({ title, text, tag = 'Opmerking' }) {
  const state = window.VoldaanApp?.state;
  if (!state || !text) return null;

  const feed = ensureKnowledgeState(state);
  feed.savedTips.unshift({
    id: Date.now(),
    title: title || 'Kennisblok',
    text,
    tag,
    createdAt: new Date().toISOString(),
  });

  if (typeof window.VoldaanApp?.saveState === 'function') {
    window.VoldaanApp.saveState(state);
  }

  return feed.savedTips;
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderKnowledgeState() {
  const state = window.VoldaanApp?.state;
  if (!state) return;

  const feed = ensureKnowledgeState(state);
  let container = document.getElementById('hacks-panel');

  if (!container) {
    const root = document.querySelector('.container') || document.body;
    container = document.createElement('section');
    container.id = 'hacks-panel';
    container.className = 'app-shell-panel';
    root.appendChild(container);
  }

  const tips = feed.savedTips.length
    ? feed.savedTips.slice(0, 6).map((tip) => `
        <div style="background:var(--card-bg); border:1.5px solid var(--input-border); border-radius:14px; padding:14px; box-shadow:var(--shadow);">
          <div style="font-size:0.68rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); margin-bottom:8px;">${escapeHtml(tip.tag || 'Opmerking')}</div>
          <div style="font-weight:700; margin-bottom:6px;">${escapeHtml(tip.title || 'Kennisblok')}</div>
          <div style="font-size:0.88rem; line-height:1.5; color:var(--text-main);">${escapeHtml(tip.text || '').replace(/\n/g, '<br>')}</div>
        </div>
      `).join('')
    : '<div style="color:var(--text-muted);">Nog geen kennisblokken opgeslagen.</div>';

  container.innerHTML = `
    <div style="display:grid; gap:12px;">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
        <div style="font-size:1.08rem; font-weight:700; color:var(--text-main);">💡 Kennis & Hacks</div>
        <div style="font-size:0.76rem; color:var(--text-muted);">Minder zoeken, meer doen</div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:12px;">
        ${tips}
      </div>
    </div>
  `;
}

export function initKnowledgeModule() {
  const state = window.VoldaanApp?.state;
  if (!state) return;

  ensureKnowledgeState(state);
  renderKnowledgeState();
}

if (typeof window !== 'undefined') {
  window.initKnowledgeModule = initKnowledgeModule;
  window.VoldaanKnowledge = {
    ensureKnowledgeState,
    addKnowledgeTip,
    renderKnowledgeState,
  };
}

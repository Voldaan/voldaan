export function ensureInsightsState(state) {
  if (!state) return null;

  state.ui = state.ui || {};
  state.ui.insights = state.ui.insights || {
    cards: [],
  };

  state.ui.insights.cards = state.ui.insights.cards || [];
  return state.ui.insights;
}

export function addInsight({ title, value, text, tone = 'neutral' }) {
  const state = window.VoldaanApp?.state;
  if (!state || !title) return null;

  const insights = ensureInsightsState(state);
  insights.cards.unshift({
    id: Date.now(),
    title,
    value,
    text,
    tone,
    createdAt: new Date().toISOString(),
  });

  if (typeof window.VoldaanApp?.saveState === 'function') {
    window.VoldaanApp.saveState(state);
  }

  return insights.cards;
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderInsightsState() {
  const state = window.VoldaanApp?.state;
  if (!state) return;

  const insights = ensureInsightsState(state);
  let container = document.getElementById('insights-panel');

  if (!container) {
    const root = document.querySelector('.container') || document.body;
    container = document.createElement('section');
    container.id = 'insights-panel';
    container.className = 'app-shell-panel';
    root.appendChild(container);
  }

  const cardsMarkup = insights.cards.length
    ? insights.cards.slice(0, 6).map((card) => `
        <div style="background:var(--card-bg); border:1.5px solid var(--input-border); border-radius:14px; padding:16px; box-shadow:var(--shadow);">
          <div style="font-size:0.68rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); margin-bottom:8px;">${escapeHtml(card.title || 'Inzicht')}</div>
          <div style="font-size:1.6rem; font-weight:700; color:var(--text-main); margin-bottom:6px;">${escapeHtml(card.value || '—')}</div>
          <div style="font-size:0.88rem; line-height:1.5; color:var(--text-main);">${escapeHtml(card.text || '').replace(/\n/g, '<br>')}</div>
        </div>
      `).join('')
    : '<div style="color:var(--text-muted);">Nog geen inzichten verzameld.</div>';

  container.innerHTML = `
    <div style="display:grid; gap:12px;">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
        <div style="font-size:1.08rem; font-weight:700; color:var(--text-main);">📊 Inzichten</div>
        <div style="font-size:0.76rem; color:var(--text-muted);">Patronen in je ritme</div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">
        ${cardsMarkup}
      </div>
    </div>
  `;
}

export function initInsightsModule() {
  const state = window.VoldaanApp?.state;
  if (!state) return;

  ensureInsightsState(state);
  renderInsightsState();
}

if (typeof window !== 'undefined') {
  window.initInsightsModule = initInsightsModule;
  window.VoldaanInsights = {
    ensureInsightsState,
    addInsight,
    renderInsightsState,
  };
}

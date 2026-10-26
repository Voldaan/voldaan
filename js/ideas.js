export function ensureIdeasState(state) {
  if (!state) return null;

  state.ideas = state.ideas || {
    items: [],
  };

  state.ideas.items = state.ideas.items || [];

  return state.ideas;
}

export function addIdea({ title, text, color = 'yellow' }) {
  const state = window.VoldaanApp?.state;
  if (!state || !text) return null;

  const ideas = ensureIdeasState(state);
  ideas.items.push({
    id: Date.now(),
    title: title || 'Idee',
    text,
    color,
    createdAt: new Date().toISOString(),
  });

  if (typeof window.VoldaanApp?.saveState === 'function') {
    window.VoldaanApp.saveState(state);
  }

  return ideas.items;
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderIdeasState() {
  const state = window.VoldaanApp?.state;
  if (!state) return;

  const ideas = ensureIdeasState(state);
  let container = document.getElementById('ideas-status-panel');

  if (!container) {
    const root = document.querySelector('.container') || document.body;
    container = document.createElement('section');
    container.id = 'ideas-status-panel';
    container.className = 'app-shell-panel';
    root.appendChild(container);
  }

  const colors = {
    yellow: '#FDE68A',
    blue: '#BFDBFE',
    green: '#BBF7D0',
    pink: '#FBCFE8',
    purple: '#DDD6FE',
  };

  const itemsMarkup = ideas.items.length
    ? ideas.items.slice().reverse().map((idea) => {
        const bg = colors[idea.color] || colors.yellow;
        return `
          <div style="background:${bg}; border:1.5px solid rgba(0,0,0,0.08); border-radius:12px; padding:14px; min-height:120px; position:relative; box-shadow:2px 4px 12px rgba(0,0,0,0.06);">
            <div style="position:absolute; top:-8px; left:50%; transform:translateX(-50%); font-size:1.1rem;">📌</div>
            <div style="font-weight:700; margin-top:12px;">${escapeHtml(idea.title || 'Idee')}</div>
            <div style="margin-top:8px; font-size:0.86rem; line-height:1.4;">${escapeHtml(idea.text || '').replace(/\n/g, '<br>')}</div>
          </div>
        `;
      }).join('')
    : '<div style="color:var(--text-muted);">Nog geen ideeën opgeslagen.</div>';

  container.innerHTML = `
    <div style="display:grid; gap:12px;">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
        <div style="font-size:1.08rem; font-weight:700; color:var(--text-main);">📌 Ideeënkluis</div>
        <div style="font-size:0.76rem; color:var(--text-muted);">Grote ideeën, kleine stappen</div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">
        ${itemsMarkup}
      </div>
    </div>
  `;
}

export function initIdeasModule() {
  const state = window.VoldaanApp?.state;
  if (!state) return;

  ensureIdeasState(state);

  const form = document.getElementById('add-idea-form');
  const titleInput = document.getElementById('idea-title-input');
  const textInput = document.getElementById('idea-text-input');
  const colorInput = document.getElementById('idea-color-select');

  const saveButtons = Array.from(document.querySelectorAll('button')).filter((button) => {
    const text = (button.textContent || '').trim().toLowerCase();
    return button.closest('#add-idea-form') && text.includes('opslaan');
  });

  const saveButton = saveButtons[0];

  if (form && titleInput && textInput && saveButton) {
    saveButton.addEventListener('click', () => {
      const title = titleInput.value.trim();
      const text = textInput.value.trim();
      const color = (colorInput && colorInput.value) || 'yellow';

      if (!text) return;

      addIdea({ title, text, color });
      titleInput.value = '';
      textInput.value = '';
      if (colorInput) colorInput.value = 'yellow';
      form.classList.add('hidden');
      renderIdeasState();
    });
  }

  renderIdeasState();
}

if (typeof window !== 'undefined') {
  window.initIdeasModule = initIdeasModule;
  window.VoldaanIdeas = {
    ensureIdeasState,
    addIdea,
    renderIdeasState,
  };
}

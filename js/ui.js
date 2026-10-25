export function applyActiveView(viewName) {
  const map = {
    today: document.getElementById('view-today'),
    plan: document.getElementById('view-plan'),
    vitality: document.getElementById('view-vitality'),
    money: document.getElementById('view-money'),
    hacks: document.getElementById('view-hacks'),
    ideas: document.getElementById('view-ideas'),
    fun: document.getElementById('view-fun'),
    insights: document.getElementById('view-insights'),
  };

  Object.entries(map).forEach(([name, element]) => {
    if (!element) return;
    element.classList.toggle('hidden', name !== viewName);
  });

  document.querySelectorAll('.tab-btn').forEach((button) => {
    const isActive = button.id === `tab-${viewName}`;
    button.classList.toggle('active', isActive);
  });
}

export function renderAllViews(state) {
  const activeTab = state?.settings?.activeTab || 'today';
  applyActiveView(activeTab);
}

export function switchView(viewName) {
  const state = window.VoldaanApp?.state || { settings: { activeTab: viewName } };
  state.settings = state.settings || {};
  state.settings.activeTab = viewName;
  applyActiveView(viewName);
}

export function toggleTheme() {
  const nextTheme = document.body.classList.contains('dark-theme') ? 'light' : 'dark';
  document.body.classList.toggle('dark-theme', nextTheme === 'dark');
  if (window.VoldaanApp?.setTheme) {
    window.VoldaanApp.setTheme(nextTheme);
  }
}

if (typeof window !== 'undefined') {
  if (typeof window.switchView !== 'function') {
    window.switchView = switchView;
  }

  if (typeof window.toggleTheme !== 'function') {
    window.toggleTheme = toggleTheme;
  }

  if (typeof window.renderAllViews !== 'function') {
    window.renderAllViews = renderAllViews;
  }
}

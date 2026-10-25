import { loadState, saveState, exportBackupData, importBackupData, hydrateTheme, setTheme } from './storage.js';
import { initTodayModule } from './today.js';
import { initPlanModule } from './plan.js';
import { initVitalityModule } from './vitality.js';
import { initMoneyModule } from './money.js';
import { initIdeasModule } from './ideas.js';

window.VoldaanApp = {
  state: null,
  loadState,
  saveState,
  exportBackupData,
  importBackupData,
  hydrateTheme,
  setTheme,
};

function getTabList() {
  return Array.from(document.querySelectorAll('.tab-btn'));
}

function getModulePanelMap() {
  return {
    today: document.getElementById('today-dashboard'),
    plan: document.getElementById('plan-panel'),
    vitality: document.getElementById('vitality-status-panel'),
    money: document.getElementById('money-status-panel'),
    hacks: document.getElementById('hacks-panel'),
    ideas: document.getElementById('ideas-status-panel'),
    fun: document.getElementById('fun-panel'),
    insights: document.getElementById('insights-panel'),
  };
}

function syncTabUi(activeTab = 'today') {
  const tabs = getTabList();

  tabs.forEach((tab) => {
    const tabName = tab.id.replace('tab-', '');
    const isActive = tabName === activeTab;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
  });

  const panels = getModulePanelMap();
  Object.entries(panels).forEach(([name, panel]) => {
    if (!panel) return;
    const isVisible = name === activeTab;
    panel.style.display = isVisible ? '' : 'none';
  });
}

function switchView(nextTab) {
  const state = window.VoldaanApp?.state;
  if (!state) return;

  state.settings = state.settings || { theme: 'light', activeTab: 'today' };
  state.settings.activeTab = nextTab;

  if (typeof window.VoldaanApp?.saveState === 'function') {
    window.VoldaanApp.saveState(state);
  }

  syncTabUi(nextTab);
}

function renderAllViews(state) {
  if (!state) return;

  state.settings = state.settings || { theme: 'light', activeTab: 'today' };
  const activeTab = state.settings.activeTab || 'today';

  if (typeof window.renderTodayDashboard === 'function') {
    window.renderTodayDashboard();
  }

  if (typeof window.renderVitalityState === 'function') {
    window.renderVitalityState();
  }

  if (typeof window.renderMoneyState === 'function') {
    window.renderMoneyState();
  }

  if (typeof window.renderIdeasState === 'function') {
    window.renderIdeasState();
  }

  syncTabUi(activeTab);
}

function initializeApp() {
  const state = loadState();
  window.VoldaanApp.state = state;
  hydrateTheme();

  if (!state.settings) {
    state.settings = { theme: 'light', activeTab: 'today' };
  }

  if (!state.settings.activeTab) {
    state.settings.activeTab = 'today';
  }

  if (typeof window.renderAllViews === 'function') {
    window.renderAllViews(state);
  } else {
    renderAllViews(state);
  }

  if (typeof window.initTodayModule === 'function') {
    window.initTodayModule();
  } else {
    initTodayModule();
  }

  if (typeof window.initPlanModule === 'function') {
    window.initPlanModule();
  } else {
    initPlanModule();
  }

  if (typeof window.initVitalityModule === 'function') {
    window.initVitalityModule();
  } else {
    initVitalityModule();
  }

  if (typeof window.initMoneyModule === 'function') {
    window.initMoneyModule();
  } else {
    initMoneyModule();
  }

  if (typeof window.initIdeasModule === 'function') {
    window.initIdeasModule();
  } else {
    initIdeasModule();
  }

  syncTabUi(state.settings.activeTab || 'today');
  console.log('Voldaan modular scaffold geladen');
}

document.addEventListener('DOMContentLoaded', initializeApp);
window.initTodayModule = initTodayModule;
window.initPlanModule = initPlanModule;
window.initVitalityModule = initVitalityModule;
window.initMoneyModule = initMoneyModule;
window.initIdeasModule = initIdeasModule;
window.switchView = switchView;
window.renderAllViews = renderAllViews;
window.syncTabUi = syncTabUi;

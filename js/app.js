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

const VALID_TABS = ['today', 'plan', 'vitality', 'money', 'hacks', 'ideas', 'fun', 'insights'];

function getTabButtons() {
  return Array.from(document.querySelectorAll('.tab-btn'));
}

function getModulePanelMap() {
  const knownPanels = {
    today: document.getElementById('today-dashboard') || document.querySelector('#today-panel') || document.querySelector('[data-panel="today"]'),
    plan: document.getElementById('plan-panel') || document.querySelector('[data-panel="plan"]'),
    vitality: document.getElementById('vitality-status-panel') || document.querySelector('[data-panel="vitality"]'),
    money: document.getElementById('money-status-panel') || document.querySelector('[data-panel="money"]'),
    hacks: document.getElementById('hacks-panel') || document.querySelector('[data-panel="hacks"]'),
    ideas: document.getElementById('ideas-status-panel') || document.querySelector('[data-panel="ideas"]'),
    fun: document.getElementById('fun-panel') || document.querySelector('[data-panel="fun"]'),
    insights: document.getElementById('insights-panel') || document.querySelector('[data-panel="insights"]'),
  };

  const fallbackPanels = Array.from(document.querySelectorAll('.app-shell-panel'));
  fallbackPanels.forEach((panel) => {
    const id = panel.id || '';
    const tabName = id.replace('-panel', '').replace('-dashboard', '').replace('-status', '').replace('-panel', '');
    if (tabName && !knownPanels[tabName]) {
      knownPanels[tabName] = panel;
    }
  });

  return knownPanels;
}

function syncTabUi(activeTab = 'today') {
  const safeTab = VALID_TABS.includes(activeTab) ? activeTab : 'today';
  const tabs = getTabButtons();

  tabs.forEach((tab) => {
    const tabName = tab.id.replace('tab-', '');
    const isActive = tabName === safeTab;
    tab.classList.toggle('active', isActive);
    tab.setAttribute('aria-selected', String(isActive));
    tab.setAttribute('tabindex', isActive ? '0' : '-1');
  });

  const panels = getModulePanelMap();

  Object.entries(panels).forEach(([name, panel]) => {
    if (!panel) return;

    const isVisible = name === safeTab;
    panel.classList.toggle('active-panel', isVisible);
    panel.classList.toggle('hidden', !isVisible);
    panel.style.display = isVisible ? '' : 'none';
  });
}

function switchView(nextTab) {
  const safeTab = VALID_TABS.includes(nextTab) ? nextTab : 'today';
  const state = window.VoldaanApp?.state;

  if (state) {
    state.settings = state.settings || { theme: 'light', activeTab: 'today' };
    state.settings.activeTab = safeTab;

    if (typeof window.VoldaanApp?.saveState === 'function') {
      window.VoldaanApp.saveState(state);
    }
  }

  syncTabUi(safeTab);
}

function renderAllViews(state) {
  if (!state) return;

  state.settings = state.settings || { theme: 'light', activeTab: 'today' };
  const activeTab = VALID_TABS.includes(state.settings.activeTab) ? state.settings.activeTab : 'today';

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

  state.settings = state.settings || { theme: 'light', activeTab: 'today' };
  state.settings.activeTab = VALID_TABS.includes(state.settings.activeTab) ? state.settings.activeTab : 'today';

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

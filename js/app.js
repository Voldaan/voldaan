import { loadState, saveState, exportBackupData, importBackupData, hydrateTheme, setTheme } from './storage.js';
import { initTodayModule } from './today.js';
import { initPlanModule } from './plan.js';
import { initVitalityModule } from './vitality.js';
import { initMoneyModule } from './money.js';

window.VoldaanApp = {
  state: null,
  loadState,
  saveState,
  exportBackupData,
  importBackupData,
  hydrateTheme,
  setTheme,
};

function initializeApp() {
  const state = loadState();
  window.VoldaanApp.state = state;
  hydrateTheme();

  if (typeof window.renderAllViews === 'function') {
    window.renderAllViews(state);
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

  console.log('Voldaan modular scaffold geladen');
}

document.addEventListener('DOMContentLoaded', initializeApp);
window.initTodayModule = initTodayModule;
window.initPlanModule = initPlanModule;
window.initVitalityModule = initVitalityModule;
window.initMoneyModule = initMoneyModule;

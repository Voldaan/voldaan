import { createInitialState, mergeStateWithDefaults } from './state.js';
import { loadState, saveState, exportBackupData, importBackupData, hydrateTheme, setTheme } from './storage.js';

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

  console.log('Voldaan modular scaffold geladen');
}

document.addEventListener('DOMContentLoaded', initializeApp);

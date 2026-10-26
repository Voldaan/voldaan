import { STORAGE_KEY, createInitialState, mergeStateWithDefaults } from './state.js';

export function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    const initialState = createInitialState();
    saveState(initialState);
    return initialState;
  }

  try {
    const parsed = JSON.parse(raw);
    return mergeStateWithDefaults(parsed);
  } catch (error) {
    console.warn('Voldaan: data kon niet worden geladen. Nieuwe state wordt gemaakt.', error);
    const initialState = createInitialState();
    saveState(initialState);
    return initialState;
  }
}

export function saveState(state) {
  const safeState = mergeStateWithDefaults(state);
  safeState.meta.lastUpdated = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safeState));
  return safeState;
}

export function exportBackupData() {
  const latestState = loadState();
  const blob = new Blob([JSON.stringify(latestState, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `voldaan-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function importBackupData(file) {
  if (!file) return null;

  const text = await file.text();

  try {
    const parsed = JSON.parse(text);
    const normalized = mergeStateWithDefaults(parsed);
    saveState(normalized);
    return normalized;
  } catch (error) {
    console.error('Voldaan: backup import mislukt', error);
    throw new Error('Backup kon niet worden gelezen. Controleer het JSON-bestand.');
  }
}

export function setTheme(nextTheme) {
  const currentState = loadState();
  currentState.settings.theme = nextTheme;
  saveState(currentState);

  document.body.classList.toggle('dark-theme', nextTheme === 'dark');
  document.body.classList.toggle('light-theme', nextTheme !== 'dark');
}

export function hydrateTheme() {
  const currentState = loadState();
  const theme = currentState.settings.theme || 'light';
  document.body.classList.toggle('dark-theme', theme === 'dark');
  document.body.classList.toggle('light-theme', theme !== 'dark');
  return theme;
}

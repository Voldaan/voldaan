export function ensureVitalityState(state) {
  if (!state) return null;

  state.habits = state.habits || {
    sleep: null,
    steps: null,
    smokeCount: 0,
    fitness: [],
    nutrition: [],
    snackWait: [],
  };

  state.habits.fitness = state.habits.fitness || [];
  state.habits.nutrition = state.habits.nutrition || [];
  state.habits.snackWait = state.habits.snackWait || [];

  return state.habits;
}

export function logSleep(value) {
  const state = window.VoldaanApp?.state;
  if (!state) return null;

  const habits = ensureVitalityState(state);
  habits.sleep = value;
  window.VoldaanApp.saveState(state);
  return habits.sleep;
}

export function logSteps(value) {
  const state = window.VoldaanApp?.state;
  if (!state) return null;

  const habits = ensureVitalityState(state);
  habits.steps = value;
  window.VoldaanApp.saveState(state);
  return habits.steps;
}

export function logFitnessActivity(label) {
  const state = window.VoldaanApp?.state;
  if (!state || !label) return null;

  const habits = ensureVitalityState(state);
  habits.fitness.push({
    id: Date.now(),
    label,
    createdAt: new Date().toISOString(),
  });

  window.VoldaanApp.saveState(state);
  return habits.fitness;
}

export function logNutrition(label) {
  const state = window.VoldaanApp?.state;
  if (!state || !label) return null;

  const habits = ensureVitalityState(state);
  habits.nutrition.push({
    id: Date.now(),
    label,
    createdAt: new Date().toISOString(),
  });

  window.VoldaanApp.saveState(state);
  return habits.nutrition;
}

export function addSnackWait(text) {
  const state = window.VoldaanApp?.state;
  if (!state || !text) return null;

  const habits = ensureVitalityState(state);
  habits.snackWait.push({
    id: Date.now(),
    text,
    createdAt: new Date().toISOString(),
  });

  window.VoldaanApp.saveState(state);
  return habits.snackWait;
}

export function renderVitalityState() {
  const state = window.VoldaanApp?.state;
  if (!state) return;

  const habits = ensureVitalityState(state);

  const sleepText = document.getElementById('vitality-sleep-status');
  if (sleepText && habits.sleep) {
    sleepText.textContent = habits.sleep;
  }

  const stepsText = document.getElementById('vitality-steps-status');
  if (stepsText && habits.steps !== null && habits.steps !== undefined) {
    stepsText.textContent = String(habits.steps);
  }
}

export function initVitalityModule() {
  const state = window.VoldaanApp?.state;
  if (!state) return;

  ensureVitalityState(state);

  const sleepButtons = Array.from(document.querySelectorAll('button')).filter((button) => {
    const text = (button.textContent || '').trim().toLowerCase();
    return text.includes('goed') || text.includes('geslapen') || text.includes('onrustig') || text.includes('korter');
  });

  sleepButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const label = (button.textContent || '').trim();
      if (!label) return;
      logSleep(label);
      renderVitalityState();
    });
  });

  const stepsButtons = Array.from(document.querySelectorAll('button')).filter((button) => {
    const text = (button.textContent || '').trim().toLowerCase();
    return text.includes('stappen') || text.includes('loop') || text.includes('wandel') || text.includes('beweging');
  });

  stepsButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const label = (button.textContent || '').trim();
      logSteps(label.includes('stappen') ? 'stappen' : label);
      renderVitalityState();
    });
  });

  const fitnessButtons = Array.from(document.querySelectorAll('button')).filter((button) => {
    const text = (button.textContent || '').trim().toLowerCase();
    return text.includes('fitness') || text.includes('training') || text.includes('kracht') || text.includes('beweging');
  });

  fitnessButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const label = (button.textContent || '').trim();
      logFitnessActivity(label);
      renderVitalityState();
    });
  });

  const snackButtons = Array.from(document.querySelectorAll('button')).filter((button) => {
    const text = (button.textContent || '').trim().toLowerCase();
    return text.includes('snack') || text.includes('pauze') || text.includes('wachten') || text.includes('later');
  });

  snackButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const label = (button.textContent || '').trim();
      addSnackWait(label);
      renderVitalityState();
    });
  });

  renderVitalityState();
}

if (typeof window !== 'undefined') {
  window.initVitalityModule = initVitalityModule;
  window.VoldaanVitality = {
    ensureVitalityState,
    logSleep,
    logSteps,
    logFitnessActivity,
    logNutrition,
    addSnackWait,
    renderVitalityState,
  };
}

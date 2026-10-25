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

  let container = document.getElementById('vitality-status-panel');
  if (!container) {
    const root = document.querySelector('.container') || document.body;
    container = document.createElement('section');
    container.id = 'vitality-status-panel';
    container.style.background = 'var(--card-bg)';
    container.style.border = '1.5px solid var(--input-border)';
    container.style.borderRadius = '16px';
    container.style.padding = '20px';
    container.style.boxShadow = 'var(--shadow)';
    root.appendChild(container);
  }

  const sleepText = habits.sleep || 'Nog niet vastgelegd';
  const stepsText = habits.steps || 'Nog niet vastgelegd';
  const fitnessText = habits.fitness.length
    ? habits.fitness.map((item) => `<li>${item.label}</li>`).join('')
    : '<li>Nog geen fitnessactiviteit geregistreerd.</li>';

  container.innerHTML = `
    <h2 style="font-size:1.1rem; margin:0 0 10px;">🌿 Vitaliteit</h2>
    <div style="display:grid; gap:10px; font-size:0.9rem;">
      <div style="background:var(--item-bg); border:1.5px solid var(--input-border); border-radius:12px; padding:12px;">
        <strong>Slaap</strong><br>
        <span>${sleepText}</span>
      </div>
      <div style="background:var(--item-bg); border:1.5px solid var(--input-border); border-radius:12px; padding:12px;">
        <strong>Stappen</strong><br>
        <span>${stepsText}</span>
      </div>
      <div style="background:var(--item-bg); border:1.5px solid var(--input-border); border-radius:12px; padding:12px;">
        <strong>Fitness</strong>
        <ul style="margin:8px 0 0 18px; padding:0;">${fitnessText}</ul>
      </div>
    </div>
  `;
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

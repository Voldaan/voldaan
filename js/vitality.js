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

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
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
    container.className = 'app-shell-panel';
    root.appendChild(container);
  }

  const sleepText = habits.sleep || 'Nog niet vastgelegd';
  const stepsText = habits.steps || 'Nog niet vastgelegd';

  const fitnessItems = habits.fitness.length
    ? habits.fitness.slice(-3).map((item) => `<li style="margin-top:6px;">${escapeHtml(item.label)}</li>`).join('')
    : '<li>Nog geen fitnessactiviteit geregistreerd.</li>';

  const nutritionItems = habits.nutrition.length
    ? habits.nutrition.slice(-3).map((item) => `<li style="margin-top:6px;">${escapeHtml(item.label)}</li>`).join('')
    : '<li>Nog geen voedingscheck geregistreerd.</li>';

  const snackItems = habits.snackWait.length
    ? habits.snackWait.slice(-3).map((item) => `<li style="margin-top:6px;">${escapeHtml(item.text)}</li>`).join('')
    : '<li>Geen snackpauze of later-items.</li>';

  container.innerHTML = `
    <div style="display:grid; gap:12px;">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
        <div style="font-size:1.08rem; font-weight:700; color:var(--text-main);">🌿 Vitaliteit</div>
        <div style="font-size:0.76rem; color:var(--text-muted);">Je lichaam, je ritme</div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(160px, 1fr)); gap:12px;">
        <div style="background:linear-gradient(135deg, rgba(90,103,216,0.12), rgba(90,103,216,0.04)); border:1.5px solid rgba(90,103,216,0.18); border-radius:14px; padding:16px;">
          <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); margin-bottom:6px;">Slaap</div>
          <div style="font-size:1.05rem; font-weight:700; color:var(--text-main);">${escapeHtml(sleepText)}</div>
        </div>

        <div style="background:linear-gradient(135deg, rgba(45,212,191,0.12), rgba(45,212,191,0.04)); border:1.5px solid rgba(45,212,191,0.18); border-radius:14px; padding:16px;">
          <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); margin-bottom:6px;">Stappen</div>
          <div style="font-size:1.05rem; font-weight:700; color:var(--text-main);">${escapeHtml(stepsText)}</div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); gap:12px;">
        <div style="background:var(--card-bg); border:1.5px solid var(--input-border); border-radius:14px; padding:16px; box-shadow:var(--shadow);">
          <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); margin-bottom:8px;">Fitness</div>
          <ul style="padding-left:18px; margin:0; color:var(--text-main);">${fitnessItems}</ul>
        </div>

        <div style="background:var(--card-bg); border:1.5px solid var(--input-border); border-radius:14px; padding:16px; box-shadow:var(--shadow);">
          <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); margin-bottom:8px;">Voeding</div>
          <ul style="padding-left:18px; margin:0; color:var(--text-main);">${nutritionItems}</ul>
        </div>

        <div style="background:var(--card-bg); border:1.5px solid var(--input-border); border-radius:14px; padding:16px; box-shadow:var(--shadow);">
          <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); margin-bottom:8px;">Snack / later</div>
          <ul style="padding-left:18px; margin:0; color:var(--text-main);">${snackItems}</ul>
        </div>
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

  const nutritionButtons = Array.from(document.querySelectorAll('button')).filter((button) => {
    const text = (button.textContent || '').trim().toLowerCase();
    return text.includes('voeding') || text.includes('gezond') || text.includes('balans') || text.includes('eten');
  });

  nutritionButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const label = (button.textContent || '').trim();
      logNutrition(label);
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

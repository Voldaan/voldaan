export function initVitalityModule() {
  const sleepButtons = Array.from(document.querySelectorAll('button')).filter((button) => {
    const text = (button.textContent || '').trim();
    return text.includes('goed / voldoende geslapen') || text.includes('Onrustig / Korter geslapen');
  });

  sleepButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const state = window.VoldaanApp?.state;
      if (!state) return;

      const label = (button.textContent || '').trim();
      state.habits = state.habits || {
        sleep: null,
        steps: null,
        smokeCount: 0,
        fitness: [],
        nutrition: [],
        snackWait: [],
      };

      state.habits.sleep = label;
      if (typeof window.VoldaanApp?.saveState === 'function') {
        window.VoldaanApp.saveState(state);
      }
    });
  });
}

if (typeof window !== 'undefined') {
  window.initVitalityModule = initVitalityModule;
}

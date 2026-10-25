export function initPlanModule() {
  const pactInput = document.getElementById('pact-input');
  const savePactBtn = Array.from(document.querySelectorAll('button')).find((button) =>
    button.textContent && button.textContent.includes('Leg vast voor morgen')
  );

  if (pactInput && savePactBtn) {
    savePactBtn.addEventListener('click', () => {
      if (window.VoldaanApp?.state) {
        const state = window.VoldaanApp.state;
        state.pact = state.pact || { current: null, history: [] };
        const value = pactInput.value.trim();
        if (!value) return;

        state.pact.current = value;
        state.pact.history = [value, ...state.pact.history].slice(0, 25);
        saveState(state);
      }
    });
  }

  const taskInput = document.getElementById('task-input');
  const addTaskBtn = Array.from(document.querySelectorAll('button')).find((button) =>
    button.textContent && button.textContent.includes('Toevoegen') && button.textContent.includes('Toevoegen')
  );

  if (taskInput && addTaskBtn) {
    addTaskBtn.addEventListener('click', () => {
      if (window.VoldaanApp?.state) {
        const state = window.VoldaanApp.state;
        state.taskList = state.taskList || [];
        const value = taskInput.value.trim();
        if (!value) return;

        state.taskList.unshift({
          id: Date.now(),
          title: value,
          done: false,
          category: document.getElementById('task-category-select')?.value || 'Privé',
          createdAt: new Date().toISOString(),
        });

        taskInput.value = '';
        saveState(state);
      }
    });
  }
}

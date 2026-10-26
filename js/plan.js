export function renderPlanModule() {
  const state = window.VoldaanApp?.state;
  if (!state) return;

  let container = document.getElementById('plan-panel');
  if (!container) {
    const root = document.querySelector('.container') || document.body;
    container = document.createElement('section');
    container.id = 'plan-panel';
    container.className = 'app-shell-panel';
    root.appendChild(container);
  }

  const pact = state.pact?.current || 'Nog geen pact vastgelegd';
  const taskList = Array.isArray(state.taskList) ? state.taskList : [];
  const tasksMarkup = taskList.length
    ? taskList.slice(0, 4).map((task) => `
        <li style="list-style:none; margin-top:8px; padding:10px 12px; border-radius:10px; background:rgba(90,103,216,0.06); border:1px solid rgba(90,103,216,0.1);">
          <div style="font-weight:600;">${(task.title || 'Taak').replace(/</g, '&lt;')}</div>
          <div style="font-size:0.78rem; color:var(--text-muted); margin-top:4px;">${task.category || 'Privé'}</div>
        </li>
      `).join('')
    : '<li style="list-style:none; color:var(--text-muted);">Nog geen taken toegevoegd.</li>';

  container.innerHTML = `
    <div style="display:grid; gap:14px;">
      <div class="card" style="padding:18px;">
        <h2 style="margin:0 0 10px; font-size:1.05rem;">🎯 Pact voor morgen</h2>
        <div style="background:var(--item-bg); border:1.5px solid var(--input-border); border-radius:12px; padding:12px; margin-bottom:10px; color:var(--text-main);">
          ${pact}
        </div>
        <input id="pact-input" type="text" placeholder="Wat kies je voor morgen?" value="${(state.pact?.current || '').replace(/"/g, '&quot;')}" />
        <button id="save-pact-btn" class="btn btn-small" style="width:auto;">Pact vastleggen</button>
      </div>

      <div class="card" style="padding:18px;">
        <h2 style="margin:0 0 10px; font-size:1.05rem;">✅ Taaklijst</h2>
        <div style="display:flex; gap:8px; margin-bottom:10px;">
          <input id="task-input" type="text" placeholder="Voeg taak toe" style="margin:0;" />
        </div>
        <div style="display:flex; gap:8px; margin-bottom:12px;">
          <select id="task-category-select" style="margin:0; flex:1;">
            <option>Privé</option>
            <option>Werk</option>
            <option>Gezond</option>
            <option>Persoonlijk</option>
          </select>
          <button id="add-task-btn" class="btn btn-small" style="width:auto;">Toevoegen</button>
        </div>
        <ul style="padding:0; margin:0;">${tasksMarkup}</ul>
      </div>
    </div>
  `;
}

export function initPlanModule() {
  renderPlanModule();

  const pactInput = document.getElementById('pact-input');
  const savePactBtn = document.getElementById('save-pact-btn');

  if (pactInput && savePactBtn) {
    savePactBtn.addEventListener('click', () => {
      const value = pactInput.value.trim();
      if (!value || !window.VoldaanApp?.state) return;

      const state = window.VoldaanApp.state;
      state.pact = state.pact || { current: null, history: [] };
      state.pact.current = value;
      state.pact.history = [value, ...state.pact.history].slice(0, 25);
      window.VoldaanApp.saveState(state);
      renderPlanModule();
    });
  }

  const taskInput = document.getElementById('task-input');
  const taskCategory = document.getElementById('task-category-select');
  const addTaskBtn = document.getElementById('add-task-btn');

  if (taskInput && addTaskBtn) {
    addTaskBtn.addEventListener('click', () => {
      if (!window.VoldaanApp?.state) return;
      const value = taskInput.value.trim();
      if (!value) return;

      const state = window.VoldaanApp.state;
      state.taskList = state.taskList || [];
      state.taskList.unshift({
        id: Date.now(),
        title: value,
        done: false,
        category: taskCategory?.value || 'Privé',
        createdAt: new Date().toISOString(),
      });

      taskInput.value = '';
      window.VoldaanApp.saveState(state);
      renderPlanModule();
    });
  }
}

if (typeof window !== 'undefined') {
  window.initPlanModule = initPlanModule;
  window.renderPlanState = renderPlanModule;
}

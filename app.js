// ==========================================
// 1. UTILITIES & ALGEMENE INSTELLINGEN
// ==========================================

function getNowDateTimeStr() {
  return new Date().toLocaleDateString('nl-NL', { 
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit' 
  });
}

function triggerConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  let particles = [];
  const colors = ['#5A67D8', '#B2F5EA', '#E9D8FD', '#FEEBC8', '#38A169', '#319795'];

  for (let i = 0; i < 60; i++) {
    particles.push({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 12,
      vy: (Math.random() - 0.5) * 12 - 4,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 100
    });
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;
    particles.forEach(p => {
      if (p.life > 0) {
        active = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25;
        p.life -= 2;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
    });
    if (active) requestAnimationFrame(render);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  render();
}

function switchView(viewName) {
  ['today', 'plan', 'vitality', 'hacks', 'ideas', 'money', 'fun', 'insights'].forEach(v => {
    const el = document.getElementById(`view-${v}`);
    const tab = document.getElementById(`tab-${v}`);
    if (el) el.classList.add('hidden');
    if (tab) tab.classList.remove('active');
  });

  const activeEl = document.getElementById(`view-${viewName}`);
  const activeTab = document.getElementById(`tab-${viewName}`);
  if (activeEl) activeEl.classList.remove('hidden');
  if (activeTab) activeTab.classList.add('active');

  if (viewName === 'today') { renderTodayDashboard(); renderMarbleJar(); renderBuddyGrid(); renderRandomIdea(); }
  if (viewName === 'plan') { renderTasks(); renderCompassGoals(); renderContacts(); renderPact(); }
  if (viewName === 'vitality') renderVitalityView();
  if (viewName === 'money') renderMoneyView();
  if (viewName === 'hacks') renderHacksView();
  if (viewName === 'ideas') { renderIdeas(); renderProjects(); }
  if (viewName === 'insights') renderInsightsView();
}

function initTheme() {
  if (localStorage.getItem('voldaan_theme') === 'dark') {
    document.body.classList.add('dark-theme');
    const btn = document.getElementById('theme-btn');
    if (btn) btn.innerText = '☀️ Dag';
  }
}

function toggleTheme() {
  document.body.classList.toggle('dark-theme');
  const isDark = document.body.classList.contains('dark-theme');
  localStorage.setItem('voldaan_theme', isDark ? 'dark' : 'light');
  document.getElementById('theme-btn').innerText = isDark ? '☀️ Dag' : '🌙 Nacht';
}


// ==========================================
// 2. MOOD & START DAG LOGICA (AANPASSING 1)
// ==========================================

let selectedEnergyLevel = null;
function selectEnergy(btn, level) {
  document.querySelectorAll('.energy-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedEnergyLevel = level;
  document.getElementById('start-action').classList.remove('hidden');
}

function startDay() {
  if (!selectedEnergyLevel) return;
  let energyLogs = JSON.parse(localStorage.getItem('voldaan_energy_logs') || '[]');
  const now = new Date();
  energyLogs.unshift({
    id: Date.now(),
    energy: selectedEnergyLevel,
    dateStr: getNowDateTimeStr(),
    timestamp: now.getTime()
  });
  localStorage.setItem('voldaan_energy_logs', JSON.stringify(energyLogs));

  let starts = parseInt(localStorage.getItem('voldaan_stat_starts') || '0') + 1;
  localStorage.setItem('voldaan_stat_starts', starts.toString());

  addMarble(`Dagstart check-in (${selectedEnergyLevel})`, 'Dagstart');
  triggerConfetti();
  renderTodayDashboard();
}

function openMoodHistoryModal() {
  document.getElementById('mood-history-modal').classList.remove('hidden');
  renderMoodHistory();
}

function closeMoodHistoryModal() { document.getElementById('mood-history-modal').classList.add('hidden'); }

function renderMoodHistory() {
  let energyLogs = JSON.parse(localStorage.getItem('voldaan_energy_logs') || '[]');
  const container = document.getElementById('mood-history-list');
  const chartContainer = document.getElementById('mood-chart-bars');
  const modeSelect = document.getElementById('mood-history-filter-mode');
  const dateInput = document.getElementById('mood-history-filter-date');
  const trendTextEl = document.getElementById('mood-trend-positive-text');

  if (!container || !chartContainer) return;

  container.innerHTML = '';
  chartContainer.innerHTML = '';

  const mode = modeSelect ? modeSelect.value : 'WEEK';
  if (mode === 'DAY') { dateInput.classList.remove('hidden'); }
  else { dateInput.classList.add('hidden'); }

  const now = new Date();
  let filteredLogs = energyLogs.filter(item => {
    const ts = item.timestamp || item.id;
    const itemDate = new Date(ts);

    if (mode === 'DAY') {
      const selDateStr = dateInput.value ? new Date(dateInput.value).toLocaleDateString('nl-NL') : now.toLocaleDateString('nl-NL');
      return itemDate.toLocaleDateString('nl-NL') === selDateStr;
    } else if (mode === 'WEEK') {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).getTime();
      return ts >= startOfWeek;
    } else if (mode === 'MONTH') {
      return itemDate.getMonth() === new Date().getMonth() && itemDate.getFullYear() === new Date().getFullYear();
    } else if (mode === 'YEAR') {
      return itemDate.getFullYear() === new Date().getFullYear();
    }
    return true;
  });

  const moodValues = { 'Wazig / Moe': 1, 'Chaotisch': 2, 'Oké': 3, 'Gefocust': 4 };
  if (filteredLogs.length > 0) {
    const displayLogs = filteredLogs.slice(0, 10).reverse();
    displayLogs.forEach(l => {
      const val = moodValues[l.energy] || 2;
      const pct = (val / 4) * 100;
      const wrapper = document.createElement('div');
      wrapper.className = 'chart-bar-wrapper';
      wrapper.innerHTML = `
        <div class="chart-bar" style="height: ${pct}%; background-color: var(--accent-primary);" title="${l.energy}"></div>
        <span class="chart-label">${l.dateStr ? l.dateStr.slice(0,5) : 'Dag'}</span>
      `;
      chartContainer.appendChild(wrapper);
    });
  } else {
    chartContainer.innerHTML = '<span style="font-size:0.78rem; color:var(--text-muted); margin:auto;">Geen data in gekozen periode.</span>';
  }

  if (trendTextEl) {
    trendTextEl.innerText = `In deze periode heb je ${filteredLogs.length} check-ins vastgelegd. Je bewustzijn groeit gestaag!`;
  }

  filteredLogs.forEach(item => {
    const div = document.createElement('div');
    div.className = 'item-card';
    div.innerHTML = `<div><strong>Mood: ${item.energy}</strong><span class="time-badge">🕒 ${item.dateStr || 'Eerder'}</span></div>`;
    container.appendChild(div);
  });
}


// ==========================================
// 3. TROTS-KLUIS & KNIKKERS (AANPASSING 2)
// ==========================================

const marbleColors = ['#5A67D8', '#38A169', '#ED8936', '#9F7AEA', '#E53E3E', '#319795', '#D69E2E', '#ED64A6'];

function addMarble(reason, category = 'Algemeen') {
  let marbles = JSON.parse(localStorage.getItem('voldaan_marbles') || '[]');
  const randomColor = marbleColors[Math.floor(Math.random() * marbleColors.length)];
  const now = new Date();
  marbles.push({
    id: Date.now(),
    color: randomColor,
    reason: reason || 'Kleine zege',
    category: category || 'Algemeen',
    date: getNowDateTimeStr(),
    timestamp: now.getTime()
  });
  localStorage.setItem('voldaan_marbles', JSON.stringify(marbles));
  renderMarbleJar();
  updateStats();
}

function renderMarbleJar() {
  let marbles = JSON.parse(localStorage.getItem('voldaan_marbles') || '[]');
  const container = document.getElementById('marble-jar-visual');
  const badge = document.getElementById('marble-count-badge');
  if (!container || !badge) return;

  const modeSelect = document.getElementById('marble-filter-mode');
  const dateInput = document.getElementById('marble-filter-date');
  const catFilter = document.getElementById('marble-filter-cat') ? document.getElementById('marble-filter-cat').value : 'ALL';

  const mode = modeSelect ? modeSelect.value : 'ALL';
  if (mode === 'DAY') { dateInput.classList.remove('hidden'); }
  else { dateInput.classList.add('hidden'); }

  const now = new Date();
  let filteredMarbles = marbles.filter(m => {
    const ts = m.timestamp || m.id;
    const itemDate = new Date(ts);

    let matchPeriod = true;
    if (mode === 'DAY') {
      const selDateStr = dateInput.value ? new Date(dateInput.value).toLocaleDateString('nl-NL') : now.toLocaleDateString('nl-NL');
      matchPeriod = itemDate.toLocaleDateString('nl-NL') === selDateStr;
    } else if (mode === 'WEEK') {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).getTime();
      matchPeriod = ts >= startOfWeek;
    } else if (mode === 'MONTH') {
      matchPeriod = itemDate.getMonth() === new Date().getMonth() && itemDate.getFullYear() === new Date().getFullYear();
    } else if (mode === 'YEAR') {
      matchPeriod = itemDate.getFullYear() === new Date().getFullYear();
    }

    let matchCat = (catFilter === 'ALL') || (m.category === catFilter);
    return matchPeriod && matchCat;
  });

  badge.innerText = `${filteredMarbles.length} Knikker${filteredMarbles.length === 1 ? '' : 's'}`;
  container.innerHTML = '';

  if (filteredMarbles.length === 0) {
    container.innerHTML = '<span style="font-size:0.82rem; color:var(--text-muted); text-align:center;">Geen knikkers gevonden voor deze selectie.</span>';
    return;
  }

  filteredMarbles.forEach(m => {
    const div = document.createElement('div');
    div.className = 'marble';
    div.style.backgroundColor = m.color;
    div.title = `[${m.category || 'Algemeen'}] ${m.reason} (${m.date})`;
    container.appendChild(div);
  });
}


// ==========================================
// 4. TAKEN PLANBORD & ARCHIEF (AANPASSING 3)
// ==========================================

function addTask() {
  const input = document.getElementById('task-input');
  const catSelect = document.getElementById('task-category-select');
  const text = input.value.trim();
  if (!text) return;

  let tasks = JSON.parse(localStorage.getItem('voldaan_tasks') || '[]');
  tasks.unshift({
    id: Date.now(),
    text: text,
    category: catSelect ? catSelect.value : 'Privé',
    done: false,
    createdAt: getNowDateTimeStr()
  });
  localStorage.setItem('voldaan_tasks', JSON.stringify(tasks));
  input.value = '';
  renderTasks();
  renderTodayDashboard();
}

function toggleTask(id) {
  let tasks = JSON.parse(localStorage.getItem('voldaan_tasks') || '[]');
  const idx = tasks.findIndex(t => t.id === id);
  if (idx !== -1) {
    tasks[idx].done = !tasks[idx].done;
    if (tasks[idx].done) {
      tasks[idx].doneAt = getNowDateTimeStr();
      let taskStat = parseInt(localStorage.getItem('voldaan_stat_tasks') || '0') + 1;
      localStorage.setItem('voldaan_stat_tasks', taskStat.toString());
      addMarble(`Taak afgevinkt: "${tasks[idx].text}"`, 'Taken');
      triggerConfetti();
    }
    localStorage.setItem('voldaan_tasks', JSON.stringify(tasks));
    renderTasks();
    renderTodayDashboard();
    renderTaskArchiveModal();
  }
}

function deleteTask(id) {
  let tasks = JSON.parse(localStorage.getItem('voldaan_tasks') || '[]');
  tasks = tasks.filter(t => t.id !== id);
  localStorage.setItem('voldaan_tasks', JSON.stringify(tasks));
  renderTasks();
  renderTodayDashboard();
}

function renderTasks() {
  let tasks = JSON.parse(localStorage.getItem('voldaan_tasks') || '[]');
  const container = document.getElementById('tasks-list');
  const filterCat = document.getElementById('tasks-filter-category') ? document.getElementById('tasks-filter-category').value : 'ALL';
  if (!container) return;

  container.innerHTML = '';
  let activeTasks = tasks.filter(t => !t.done);
  if (filterCat !== 'ALL') activeTasks = activeTasks.filter(t => t.category === filterCat);

  if (activeTasks.length === 0) {
    container.innerHTML = '<span style="font-size:0.85rem; color:var(--text-muted);">Geen actieve taken. Alles is rustig! ✨</span>';
    return;
  }

  activeTasks.forEach(task => {
    const div = document.createElement('div');
    div.className = 'item-card';
    div.innerHTML = `
      <div>
        <span>⚪ <strong>[${task.category || 'Privé'}]</strong> ${task.text}</span>
        <span class="time-badge">Toegevoegd: ${task.createdAt || 'Eerder'}</span>
      </div>
      <div style="display:flex; gap:4px;">
        <button class="btn btn-small" style="font-size:0.75rem;" onclick="toggleTask(${task.id})">✅ Afvinken</button>
        <button style="background:none; border:none; color:#E53E3E; cursor:pointer;" onclick="deleteTask(${task.id})">🗑️</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function openTaskArchiveModal() {
  document.getElementById('task-archive-modal').classList.remove('hidden');
  renderTaskArchiveModal();
}

function closeTaskArchiveModal() { document.getElementById('task-archive-modal').classList.add('hidden'); }

function renderTaskArchiveModal() {
  let tasks = JSON.parse(localStorage.getItem('voldaan_tasks') || '[]');
  const container = document.getElementById('task-archive-modal-list');
  const searchVal = (document.getElementById('task-archive-search') ? document.getElementById('task-archive-search').value : '').toLowerCase();
  const modeSelect = document.getElementById('task-archive-filter-mode');
  const dateInput = document.getElementById('task-archive-date');

  if (!container) return;
  container.innerHTML = '';
  const mode = modeSelect ? modeSelect.value : 'ALL';
  if (mode === 'DAY') { dateInput.classList.remove('hidden'); }
  else { dateInput.classList.add('hidden'); }

  const now = new Date();
  let doneTasks = tasks.filter(t => t.done);

  if (searchVal) doneTasks = doneTasks.filter(t => t.text.toLowerCase().includes(searchVal));

  doneTasks = doneTasks.filter(t => {
    const ts = t.id;
    const itemDate = new Date(ts);
    if (mode === 'DAY') {
      const selDateStr = dateInput.value ? new Date(dateInput.value).toLocaleDateString('nl-NL') : now.toLocaleDateString('nl-NL');
      return itemDate.toLocaleDateString('nl-NL') === selDateStr;
    } else if (mode === 'WEEK') {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())).getTime();
      return ts >= startOfWeek;
    } else if (mode === 'MONTH') {
      return itemDate.getMonth() === new Date().getMonth() && itemDate.getFullYear() === new Date().getFullYear();
    } else if (mode === 'YEAR') {
      return itemDate.getFullYear() === new Date().getFullYear();
    }
    return true;
  });

  if (doneTasks.length === 0) {
    container.innerHTML = '<span style="font-size:0.85rem; color:var(--text-muted);">Geen voltooide taken gevonden voor deze selectie.</span>';
    return;
  }

  doneTasks.forEach(task => {
    const div = document.createElement('div');
    div.className = 'item-card done';
    div.innerHTML = `
      <div>
        <span>✅ <strong>[${task.category || 'Privé'}]</strong> ${task.text}</span>
        <span class="time-badge">Voltooid: ${task.doneAt || 'Eerder'}</span>
      </div>
      <div style="display:flex; gap:6px;">
        <button class="btn btn-small" style="font-size:0.75rem; background-color:#38A169; color:white;" onclick="toggleTask(${task.id})">🔄 Terugzetten</button>
      </div>
    `;
    container.appendChild(div);
  });
}


// ==========================================
// 5. ZACHT KOMPAS DOELEN BEHEER & ARCHIEF (AANPASSING 4)
// ==========================================

function openGoalArchiveModal() {
  document.getElementById('goal-archive-modal').classList.remove('hidden');
  renderGoalArchiveModal();
}

function closeGoalArchiveModal() { document.getElementById('goal-archive-modal').classList.add('hidden'); }

function renderGoalArchiveModal() {
  let goals = JSON.parse(localStorage.getItem('voldaan_compass_goals') || '[]');
  const archived = goals.filter(g => g.archived);
  const container = document.getElementById('goal-archive-modal-list');
  if (!container) return;
  container.innerHTML = '';

  if (archived.length === 0) {
    container.innerHTML = '<span style="font-size:0.85rem; color:var(--text-muted);">Geen gearchiveerde doelen.</span>';
    return;
  }

  archived.forEach(g => {
    container.innerHTML += `
      <div class="item-card">
        <div>
          <strong>🎯 ${g.title}</strong>
          <span class="time-badge">Gearchiveerd</span>
        </div>
        <button class="btn btn-small" style="font-size:0.72rem; background-color:#38A169;" onclick="restoreCompassGoal(${g.id})">🔄 Terugzetten</button>
      </div>
    `;
  });
}

function archiveCompassGoal(id) {
  let goals = JSON.parse(localStorage.getItem('voldaan_compass_goals') || '[]');
  const idx = goals.findIndex(g => g.id === id);
  if (idx !== -1) {
    goals[idx].archived = true;
    localStorage.setItem('voldaan_compass_goals', JSON.stringify(goals));
    renderCompassGoals();
  }
}

function restoreCompassGoal(id) {
  let goals = JSON.parse(localStorage.getItem('voldaan_compass_goals') || '[]');
  const idx = goals.findIndex(g => g.id === id);
  if (idx !== -1) {
    goals[idx].archived = false;
    localStorage.setItem('voldaan_compass_goals', JSON.stringify(goals));
    renderCompassGoals();
    renderGoalArchiveModal();
  }
}

function editCompassGoal(id) {
  let goals = JSON.parse(localStorage.getItem('voldaan_compass_goals') || '[]');
  const g = goals.find(item => item.id === id);
  if (!g) return;

  document.getElementById('goal-edit-id').value = g.id;
  document.getElementById('goal-title-input').value = g.title;
  document.getElementById('goal-pitfall-input').value = g.pitfall || '';
  document.getElementById('goal-shield-input').value = g.shield || '';
  document.getElementById('goal-form-title').innerText = '✏️ Doel Bewerken';
  document.getElementById('add-goal-form').classList.remove('hidden');
}

function saveNewGoal() {
  const editId = document.getElementById('goal-edit-id').value;
  const title = document.getElementById('goal-title-input').value;
  const pitfall = document.getElementById('goal-pitfall-input').value;
  const shield = document.getElementById('goal-shield-input').value;

  if (!title.trim()) return;

  let goals = JSON.parse(localStorage.getItem('voldaan_compass_goals') || '[]');

  if (editId) {
    const idx = goals.findIndex(g => g.id === parseInt(editId));
    if (idx !== -1) {
      goals[idx].title = title.trim();
      goals[idx].pitfall = pitfall.trim();
      goals[idx].shield = shield.trim();
    }
  } else {
    goals.unshift({ id: Date.now(), title: title.trim(), pitfall: pitfall.trim(), shield: shield.trim(), lastLoggedDate: null, lastStatus: null, archived: false });
  }

  localStorage.setItem('voldaan_compass_goals', JSON.stringify(goals));
  document.getElementById('goal-edit-id').value = '';
  document.getElementById('goal-title-input').value = '';
  document.getElementById('goal-pitfall-input').value = '';
  document.getElementById('goal-shield-input').value = '';
  toggleAddGoalForm();
  renderCompassGoals();
  renderTodayDashboard();
}

function renderCompassGoals() {
  let goals = JSON.parse(localStorage.getItem('voldaan_compass_goals') || '[]');
  const container = document.getElementById('compass-goals-list');
  if (!container) return;
  container.innerHTML = '';

  const activeGoals = goals.filter(g => !g.archived);

  if (activeGoals.length === 0) {
    container.innerHTML = '<span style="font-size:0.82rem; color:var(--text-muted);">Nog geen doelen.</span>';
    return;
  }

  activeGoals.forEach(goal => {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.style.flexDirection = 'column';
    card.style.alignItems = 'stretch';

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start;">
        <div>
          <strong style="font-size:0.95rem;">🎯 ${goal.title}</strong>
          ${goal.pitfall ? `<div style="font-size:0.78rem; color:var(--text-muted);">🕳️ Valkuil: ${goal.pitfall}</div>` : ''}
          ${goal.shield ? `<div style="font-size:0.78rem; color:var(--accent-primary);">🛡️ Zacht Schild: ${goal.shield}</div>` : ''}
        </div>
        <div style="display:flex; gap:4px;">
          <button class="btn btn-secondary btn-small" style="font-size:0.72rem; padding:2px 6px;" onclick="editCompassGoal(${goal.id})">✏️</button>
          <button class="btn btn-secondary btn-small" style="font-size:0.72rem; padding:2px 6px;" onclick="archiveCompassGoal(${goal.id})">📦</button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function toggleAddGoalForm() { document.getElementById('add-goal-form').classList.toggle('hidden'); }


// ==========================================
// 6. CONTACT-KOMPAS LOGICA
// ==========================================

function addContactPrompt() {
  const name = prompt("Naam van je contact:");
  if (!name) return;
  let contacts = JSON.parse(localStorage.getItem('voldaan_contacts') || '[]');
  contacts.push({ id: Date.now(), name: name, lastContact: getNowDateTimeStr() });
  localStorage.setItem('voldaan_contacts', JSON.stringify(contacts));
  renderContacts();
}

function touchContact(id) {
  let contacts = JSON.parse(localStorage.getItem('voldaan_contacts') || '[]');
  const idx = contacts.findIndex(c => c.id === id);
  if (idx !== -1) {
    contacts[idx].lastContact = getNowDateTimeStr();
    let cStat = parseInt(localStorage.getItem('voldaan_stat_contacts') || '0') + 1;
    localStorage.setItem('voldaan_stat_contacts', cStat.toString());
    addMarble(`Contact gehad met ${contacts[idx].name}`, 'Contacten');
    triggerConfetti();
    localStorage.setItem('voldaan_contacts', JSON.stringify(contacts));
    renderContacts();
  }
}

function deleteContact(id) {
  let contacts = JSON.parse(localStorage.getItem('voldaan_contacts') || '[]');
  contacts = contacts.filter(c => c.id !== id);
  localStorage.setItem('voldaan_contacts', JSON.stringify(contacts));
  renderContacts();
}

function renderContacts() {
  let contacts = JSON.parse(localStorage.getItem('voldaan_contacts') || '[]');
  const container = document.getElementById('contacts-list');
  if (!container) return;
  container.innerHTML = '';

  if (contacts.length === 0) {
    container.innerHTML = '<span style="font-size:0.82rem; color:var(--text-muted);">Nog geen contacten toegevoegd.</span>';
    return;
  }

  contacts.forEach(c => {
    const div = document.createElement('div');
    div.className = 'item-card';
    div.innerHTML = `
      <div>
        <strong>💜 ${c.name}</strong>
        <span class="time-badge">Laatst gesproken: ${c.lastContact}</span>
      </div>
      <div style="display:flex; gap:4px;">
        <button class="btn btn-small" style="font-size:0.75rem;" onclick="touchContact(${c.id})">💬 Signaal</button>
        <button style="background:none; border:none; color:#E53E3E; cursor:pointer;" onclick="deleteContact(${c.id})">🗑️</button>
      </div>
    `;
    container.appendChild(div);
  });
}


// ==========================================
// 7. VITALITEIT & SPORT LOGS (AANPASSING 5)
// ==========================================

function logSleep(status) {
  const todayStr = new Date().toLocaleDateString('nl-NL');
  let sleepLogs = JSON.parse(localStorage.getItem('voldaan_sleep_logs') || '{}');
  sleepLogs[todayStr] = { status: status, time: getNowDateTimeStr() };
  localStorage.setItem('voldaan_sleep_logs', JSON.stringify(sleepLogs));
  addMarble(`Slaapvastlegging (${status})`, 'Gezondheid');
  renderVitalityView();
}

function resetSleepLog() {
  const todayStr = new Date().toLocaleDateString('nl-NL');
  let sleepLogs = JSON.parse(localStorage.getItem('voldaan_sleep_logs') || '{}');
  delete sleepLogs[todayStr];
  localStorage.setItem('voldaan_sleep_logs', JSON.stringify(sleepLogs));
  renderVitalityView();
}

function logSteps(achieved) {
  const todayStr = new Date().toLocaleDateString('nl-NL');
  let stepsLogs = JSON.parse(localStorage.getItem('voldaan_steps_logs') || '{}');
  stepsLogs[todayStr] = { achieved: achieved, time: getNowDateTimeStr() };
  localStorage.setItem('voldaan_steps_logs', JSON.stringify(stepsLogs));
  if (achieved) {
    addMarble('8.000+ Stappen Behaald! 👟', 'Gezondheid');
    triggerConfetti();
  }
  renderVitalityView();
}

function resetStepsLog() {
  const todayStr = new Date().toLocaleDateString('nl-NL');
  let stepsLogs = JSON.parse(localStorage.getItem('voldaan_steps_logs') || '{}');
  delete stepsLogs[todayStr];
  localStorage.setItem('voldaan_steps_logs', JSON.stringify(stepsLogs));
  renderVitalityView();
}

function logFitnessActivity(act) {
  let logs = JSON.parse(localStorage.getItem('voldaan_fitness_logs') || '[]');
  logs.unshift({ id: Date.now(), name: act, date: getNowDateTimeStr() });
  localStorage.setItem('voldaan_fitness_logs', JSON.stringify(logs));
  addMarble(`Sport / Fitheid: ${act}`, 'Gezondheid');
  triggerConfetti();
  renderVitalityView();
}

function addSmokeLog() {
  const todayStr = new Date().toLocaleDateString('nl-NL');
  let smokeLogs = JSON.parse(localStorage.getItem('voldaan_smoke_logs') || '{}');
  smokeLogs[todayStr] = (smokeLogs[todayStr] || 0) + 1;
  localStorage.setItem('voldaan_smoke_logs', JSON.stringify(smokeLogs));
  renderVitalityView();
}

function resetSmokeLog() {
  const todayStr = new Date().toLocaleDateString('nl-NL');
  let smokeLogs = JSON.parse(localStorage.getItem('voldaan_smoke_logs') || '{}');
  smokeLogs[todayStr] = 0;
  localStorage.setItem('voldaan_smoke_logs', JSON.stringify(smokeLogs));
  renderVitalityView();
}

function logBalanceHabit(habitName, category = 'Gezondheid') {
  addMarble(`Balans-gewoonte: ${habitName}`, category);
  triggerConfetti();
}

function addSnackWait() {
  const input = document.getElementById('snack-input');
  if (!input) return;
  const val = input.value.trim();
  if (!val) return;

  let snacks = JSON.parse(localStorage.getItem('voldaan_snack_waits') || '[]');
  snacks.unshift({ id: Date.now(), text: val, time: getNowDateTimeStr() });
  localStorage.setItem('voldaan_snack_waits', JSON.stringify(snacks));
  input.value = '';
  renderVitalityView();
}

function renderVitalityView() {
  const todayStr = new Date().toLocaleDateString('nl-NL');

  let sleepLogs = JSON.parse(localStorage.getItem('voldaan_sleep_logs') || '{}');
  const sleepBox = document.getElementById('sleep-checkin-box');
  const sleepStatus = document.getElementById('sleep-logged-status');
  if (sleepBox && sleepStatus) {
    if (sleepLogs[todayStr]) {
      sleepBox.classList.add('hidden');
      sleepStatus.classList.remove('hidden');
      document.getElementById('sleep-logged-text').innerText = sleepLogs[todayStr].status;
    } else {
      sleepBox.classList.remove('hidden');
      sleepStatus.classList.add('hidden');
    }
  }

  let stepsLogs = JSON.parse(localStorage.getItem('voldaan_steps_logs') || '{}');
  const stepsBox = document.getElementById('steps-checkin-box');
  const stepsStatus = document.getElementById('steps-logged-status');
  if (stepsBox && stepsStatus) {
    if (stepsLogs[todayStr]) {
      stepsBox.classList.add('hidden');
      stepsStatus.classList.remove('hidden');
      document.getElementById('steps-logged-text').innerText = stepsLogs[todayStr].achieved ? "👟 8.000+ Stappen gehaald!" : "🍃 Rustige dag qua stappen";
    } else {
      stepsBox.classList.remove('hidden');
      stepsStatus.classList.add('hidden');
    }
  }

  const sleepBarsContainer = document.getElementById('sleep-chart-bars');
  if (sleepBarsContainer) {
    sleepBarsContainer.innerHTML = '';
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toLocaleDateString('nl-NL');
      const isGood = sleepLogs[dStr] && sleepLogs[dStr].status.includes('Goed');
      const wrapper = document.createElement('div');
      wrapper.className = 'chart-bar-wrapper';
      wrapper.innerHTML = `
        <div class="chart-bar" style="height: ${isGood ? 85 : 30}%; background-color: ${isGood ? '#38A169' : '#CBD5E0'};"></div>
        <span class="chart-label">${dStr.slice(0,5)}</span>
      `;
      sleepBarsContainer.appendChild(wrapper);
    }
  }

  const stepsBarsContainer = document.getElementById('steps-chart-bars');
  if (stepsBarsContainer) {
    stepsBarsContainer.innerHTML = '';
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toLocaleDateString('nl-NL');
      const isAchieved = stepsLogs[dStr] && stepsLogs[dStr].achieved;
      const wrapper = document.createElement('div');
      wrapper.className = 'chart-bar-wrapper';
      wrapper.innerHTML = `
        <div class="chart-bar" style="height: ${isAchieved ? 90 : 35}%; background-color: ${isAchieved ? '#319795' : '#CBD5E0'};"></div>
        <span class="chart-label">${dStr.slice(0,5)}</span>
      `;
      stepsBarsContainer.appendChild(wrapper);
    }
  }

  let fitnessLogs = JSON.parse(localStorage.getItem('voldaan_fitness_logs') || '[]');
  const fitnessContainer = document.getElementById('fitness-activity-list');
  if (fitnessContainer) {
    fitnessContainer.innerHTML = '';
    fitnessLogs.slice(0, 4).forEach(item => {
      const div = document.createElement('div');
      div.className = 'item-card';
      div.style.fontSize = '0.82rem';
      div.innerHTML = `<span>💪 ${item.name}</span><span class="time-badge">${item.date}</span>`;
      fitnessContainer.appendChild(div);
    });
  }

  let smokeLogs = JSON.parse(localStorage.getItem('voldaan_smoke_logs') || '{}');
  const currentSmoke = smokeLogs[todayStr] || 0;
  const smokeText = document.getElementById('smoke-count-text');
  if (smokeText) smokeText.innerText = `${currentSmoke} / 5`;

  let snacks = JSON.parse(localStorage.getItem('voldaan_snack_waits') || '[]');
  const snackContainer = document.getElementById('snack-wait-list');
  if (snackContainer) {
    snackContainer.innerHTML = '';
    snacks.slice(0, 3).forEach(s => {
      const div = document.createElement('div');
      div.className = 'item-card';
      div.style.fontSize = '0.8rem';
      div.innerHTML = `<span>🛑 ${s.text}</span><span class="time-badge">${s.time}</span>`;
      snackContainer.appendChild(div);
    });
  }
}


// ==========================================
// 8. GELD-KOMPAS, STUDIESCHULD & VASTE LASTEN
// ==========================================

function openRuimteProjectsModal() {
  document.getElementById('ruimte-projects-modal').classList.remove('hidden');
  renderRuimteProjects();
}

function closeRuimteProjectsModal() { document.getElementById('ruimte-projects-modal').classList.add('hidden'); }

function renderRuimteProjects() {
  let projects = JSON.parse(localStorage.getItem('voldaan_ruimte_projects') || '[]');
  const container = document.getElementById('ruimte-projects-list');
  if (!container) return;
  container.innerHTML = '';

  let totalOriginal = 0;
  let totalRepaid = 0;

  projects.forEach(p => {
    totalOriginal += parseFloat(p.original || 0);
    totalRepaid += parseFloat(p.repaid || 0);

    const div = document.createElement('div');
    div.className = 'item-card';
    div.style.flexDirection = 'column';
    div.style.alignItems = 'stretch';

    const rem = p.original - p.repaid;
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between;">
        <strong>🌱 ${p.title}</strong>
        <span>€${p.repaid} / €${p.original}</span>
      </div>
      <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">Nog te doen: €${rem}</div>
    `;
    container.appendChild(div);
  });

  const badge = document.getElementById('ruimte-project-count-badge');
  if (badge) badge.innerText = `${projects.length} Projecten`;

  const repaidText = document.getElementById('ruimte-total-repaid-text');
  if (repaidText) repaidText.innerText = `€${totalRepaid}`;

  const remainingText = document.getElementById('ruimte-total-remaining-text');
  if (remainingText) remainingText.innerText = `€${totalOriginal - totalRepaid}`;

  const originalText = document.getElementById('ruimte-total-original-text');
  if (originalText) originalText.innerText = `€${totalOriginal}`;

  const bar = document.getElementById('ruimte-total-progress-bar');
  if (bar) {
    const pct = totalOriginal > 0 ? Math.min(100, (totalRepaid / totalOriginal) * 100) : 0;
    bar.style.width = `${pct}%`;
  }
}

function openStudyDebtModal() {
  let debt = JSON.parse(localStorage.getItem('voldaan_study_debt') || 'null');
  if (debt) {
    document.getElementById('study-total-input').value = debt.total || '';
    document.getElementById('study-repaid-input').value = debt.repaid || '';
    document.getElementById('study-monthly-input').value = debt.monthly || '';
  }
  document.getElementById('study-debt-modal').classList.remove('hidden');
}

function closeStudyDebtModal() { document.getElementById('study-debt-modal').classList.add('hidden'); }

function saveStudyDebt() {
  const total = parseFloat(document.getElementById('study-total-input').value) || 0;
  const repaid = parseFloat(document.getElementById('study-repaid-input').value) || 0;
  const monthly = parseFloat(document.getElementById('study-monthly-input').value) || 0;

  localStorage.setItem('voldaan_study_debt', JSON.stringify({ total, repaid, monthly }));
  closeStudyDebtModal();
  renderStudyDebtDisplay();
}

function deleteStudyDebt() {
  if (confirm("Studieschuld wissen?")) {
    localStorage.removeItem('voldaan_study_debt');
    closeStudyDebtModal();
    renderStudyDebtDisplay();
  }
}

function addQuickStudyRepayment() {
  const input = document.getElementById('study-quick-repay-input');
  const val = parseFloat(input.value);
  if (!val || val <= 0) return;

  let debt = JSON.parse(localStorage.getItem('voldaan_study_debt') || 'null');
  if (!debt) { alert("Stel eerst je studieschuld in!"); return; }

  debt.repaid = (debt.repaid || 0) + val;
  localStorage.setItem('voldaan_study_debt', JSON.stringify(debt));
  input.value = '';

  let mStat = parseInt(localStorage.getItem('voldaan_stat_money') || '0') + 1;
  localStorage.setItem('voldaan_stat_money', mStat.toString());

  addMarble(`Aflossing studieschuld (€${val})`, 'Geld & Aflossingen');
  triggerConfetti();
  renderStudyDebtDisplay();
  updateStats();
}

function renderStudyDebtDisplay() {
  let debt = JSON.parse(localStorage.getItem('voldaan_study_debt') || 'null');
  const box = document.getElementById('study-debt-display-box');
  if (!box) return;

  if (!debt) {
    box.innerHTML = `<div style="text-align:center; padding:10px; color:var(--text-muted); font-size:0.85rem;">🎓 Geen studieschuld ingesteld. Klik op 'Instellen'.</div>`;
    return;
  }

  const remaining = Math.max(0, debt.total - debt.repaid);
  const pct = debt.total > 0 ? Math.min(100, Math.round((debt.repaid / debt.total) * 100)) : 0;

  box.innerHTML = `
    <div style="display:flex; justify-content:space-between; font-size:0.85rem; font-weight:600;">
      <span>🎓 Afgelost: <strong style="color:#38A169;">€${debt.repaid}</strong> (${pct}%)</span>
      <span>Resterend: <strong>€${remaining}</strong></span>
    </div>
    <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${pct}%;"></div></div>
  `;
}

// IMPULS WACHTKAMER
function addImpulseItem() {
  const nameInput = document.getElementById('impulse-name');
  const priceInput = document.getElementById('impulse-price');
  if (!nameInput || !priceInput) return;

  const name = nameInput.value.trim();
  const price = priceInput.value.trim();
  if (!name) return;

  let items = JSON.parse(localStorage.getItem('voldaan_impulse_items') || '[]');
  items.unshift({ id: Date.now(), name: name, price: price, date: getNowDateTimeStr() });
  localStorage.setItem('voldaan_impulse_items', JSON.stringify(items));

  nameInput.value = '';
  priceInput.value = '';
  renderImpulseItems();
}

function deleteImpulseItem(id) {
  let items = JSON.parse(localStorage.getItem('voldaan_impulse_items') || '[]');
  items = items.filter(i => i.id !== id);
  localStorage.setItem('voldaan_impulse_items', JSON.stringify(items));
  renderImpulseItems();
}

function renderImpulseItems() {
  let items = JSON.parse(localStorage.getItem('voldaan_impulse_items') || '[]');
  const container = document.getElementById('impulse-list');
  if (!container) return;
  container.innerHTML = '';

  if (items.length === 0) {
    container.innerHTML = '<span style="font-size:0.82rem; color:var(--text-muted);">Geen geparkeerde aankopen. Lekker bezig! 🎉</span>';
    return;
  }

  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'item-card';
    div.innerHTML = `
      <div>
        <strong>🛑 ${item.name} ${item.price ? '(€' + item.price + ')' : ''}</strong>
        <span class="time-badge">Geparkeerd: ${item.date}</span>
      </div>
      <button style="background:none; border:none; color:#E53E3E; cursor:pointer;" onclick="deleteImpulseItem(${item.id})">🗑️</button>
    `;
    container.appendChild(div);
  });
}

// VASTE LASTEN BEHEER
function toggleAddBillForm() { document.getElementById('add-bill-form').classList.toggle('hidden'); }

function saveFixedBill() {
  const name = document.getElementById('bill-name-input').value.trim();
  const amount = document.getElementById('bill-amount-input').value.trim();
  const day = document.getElementById('bill-day-input').value.trim();
  const type = document.getElementById('bill-type-select').value;

  if (!name) return;

  let bills = JSON.parse(localStorage.getItem('voldaan_fixed_bills') || '[]');
  bills.push({ id: Date.now(), name, amount, day, type, archived: false });
  localStorage.setItem('voldaan_fixed_bills', JSON.stringify(bills));

  document.getElementById('bill-name-input').value = '';
  document.getElementById('bill-amount-input').value = '';
  document.getElementById('bill-day-input').value = '';
  toggleAddBillForm();
  renderFixedBills();
}

function renderFixedBills() {
  let bills = JSON.parse(localStorage.getItem('voldaan_fixed_bills') || '[]');
  const container = document.getElementById('fixed-bills-list');
  if (!container) return;
  container.innerHTML = '';

  const activeBills = bills.filter(b => !b.archived).sort((a,b) => (parseInt(a.day)||0) - (parseInt(b.day)||0));

  if (activeBills.length === 0) {
    container.innerHTML = '<span style="font-size:0.82rem; color:var(--text-muted);">Geen vaste lasten ingevoerd.</span>';
    return;
  }

  activeBills.forEach(b => {
    const div = document.createElement('div');
    div.className = 'item-card';
    div.innerHTML = `
      <div>
        <strong>💳 ${b.name} (€${b.amount || 0})</strong>
        <span class="time-badge">Afschrijfdag: ${b.day}e (${b.type})</span>
      </div>
      <button class="btn btn-secondary btn-small" style="font-size:0.72rem;" onclick="archiveFixedBill(${b.id})">📦 Archiveren</button>
    `;
    container.appendChild(div);
  });
}

function archiveFixedBill(id) {
  let bills = JSON.parse(localStorage.getItem('voldaan_fixed_bills') || '[]');
  const idx = bills.findIndex(b => b.id === id);
  if (idx !== -1) {
    bills[idx].archived = true;
    localStorage.setItem('voldaan_fixed_bills', JSON.stringify(bills));
    renderFixedBills();
  }
}

function openBillArchiveModal() {
  document.getElementById('bill-archive-modal').classList.remove('hidden');
  renderBillArchiveModalList();
}

function closeBillArchiveModal() { document.getElementById('bill-archive-modal').classList.add('hidden'); }

function renderBillArchiveModalList() {
  let bills = JSON.parse(localStorage.getItem('voldaan_fixed_bills') || '[]');
  const searchVal = (document.getElementById('bill-archive-search') ? document.getElementById('bill-archive-search').value : '').toLowerCase();
  const container = document.getElementById('bill-archive-modal-list');
  if (!container) return;
  container.innerHTML = '';

  let archived = bills.filter(b => b.archived);
  if (searchVal) archived = archived.filter(b => b.name.toLowerCase().includes(searchVal));

  if (archived.length === 0) {
    container.innerHTML = '<span style="font-size:0.85rem; color:var(--text-muted);">Geen gearchiveerde vaste lasten.</span>';
    return;
  }

  archived.forEach(b => {
    container.innerHTML += `
      <div class="item-card">
        <div>
          <strong>${b.name} (€${b.amount || 0})</strong>
          <span class="time-badge">Afschrijfdag: ${b.day}e van de maand</span>
        </div>
        <div style="display:flex; gap:4px;">
          <button class="btn btn-small" style="font-size:0.72rem; background-color:#38A169;" onclick="restoreFixedBill(${b.id})">🔄 Terugzetten</button>
          <button style="background:none; border:none; color:#E53E3E; cursor:pointer;" onclick="removeFixedBillPermanently(${b.id})">🗑️</button>
        </div>
      </div>
    `;
  });
}

function restoreFixedBill(id) {
  let bills = JSON.parse(localStorage.getItem('voldaan_fixed_bills') || '[]');
  const idx = bills.findIndex(b => b.id === id);
  if (idx !== -1) {
    bills[idx].archived = false;
    localStorage.setItem('voldaan_fixed_bills', JSON.stringify(bills));
    renderFixedBills();
    renderBillArchiveModalList();
  }
}

function removeFixedBillPermanently(id) {
  if (confirm("Definitief verwijderen?")) {
    let bills = JSON.parse(localStorage.getItem('voldaan_fixed_bills') || '[]');
    bills = bills.filter(b => b.id !== id);
    localStorage.setItem('voldaan_fixed_bills', JSON.stringify(bills));
    renderFixedBills();
    renderBillArchiveModalList();
  }
}

// TOEKOMST ANKERS
function toggleAddAnchorForm() { document.getElementById('add-anchor-form').classList.toggle('hidden'); }

function saveFutureAnchor() {
  const name = document.getElementById('anchor-name-input').value.trim();
  const desc = document.getElementById('anchor-desc-input').value.trim();
  const target = parseFloat(document.getElementById('anchor-target-amount-input').value) || 0;
  const current = parseFloat(document.getElementById('anchor-current-amount-input').value) || 0;

  if (!name) return;

  let anchors = JSON.parse(localStorage.getItem('voldaan_future_anchors') || '[]');
  anchors.push({ id: Date.now(), name, desc, target, current, archived: false });
  localStorage.setItem('voldaan_future_anchors', JSON.stringify(anchors));

  document.getElementById('anchor-name-input').value = '';
  document.getElementById('anchor-desc-input').value = '';
  document.getElementById('anchor-target-amount-input').value = '';
  document.getElementById('anchor-current-amount-input').value = '';
  toggleAddAnchorForm();
  renderFutureAnchors();
}

function renderFutureAnchors() {
  let anchors = JSON.parse(localStorage.getItem('voldaan_future_anchors') || '[]');
  const container = document.getElementById('future-anchors-list');
  if (!container) return;
  container.innerHTML = '';

  const active = anchors.filter(a => !a.archived);

  if (active.length === 0) {
    container.innerHTML = '<span style="font-size:0.82rem; color:var(--text-muted);">Nog geen spaarpotjes aangemaakt.</span>';
    return;
  }

  active.forEach(a => {
    const pct = a.target > 0 ? Math.min(100, Math.round((a.current / a.target) * 100)) : 0;
    const div = document.createElement('div');
    div.className = 'item-card';
    div.style.flexDirection = 'column';
    div.style.alignItems = 'stretch';
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between;">
        <strong>🔮 ${a.name}</strong>
        <span>€${a.current} / €${a.target} (${pct}%)</span>
      </div>
      <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${pct}%;"></div></div>
    `;
    container.appendChild(div);
  });
}

function openAnchorArchiveModal() { document.getElementById('anchor-archive-modal').classList.remove('hidden'); }
function closeAnchorArchiveModal() { document.getElementById('anchor-archive-modal').classList.add('hidden'); }
function openMoneyArchiveModal() { document.getElementById('money-archive-modal').classList.remove('hidden'); }
function closeMoneyArchiveModal() { document.getElementById('money-archive-modal').classList.add('hidden'); }


// ==========================================
// 9. IDEEËNKLUIS, POST-ITS & PROJECTEN
// ==========================================

const postitColors = ['#FEFCBF', '#C6F6D5', '#E9D8FD', '#B2F5EA', '#FEEBC8'];

function addIdea() {
  const textarea = document.getElementById('idea-input');
  const catSelect = document.getElementById('idea-category-select');
  if (!textarea) return;
  const text = textarea.value.trim();
  if (!text) return;

  let ideas = JSON.parse(localStorage.getItem('voldaan_ideas') || '[]');
  const randomColor = postitColors[Math.floor(Math.random() * postitColors.length)];

  ideas.unshift({
    id: Date.now(),
    text: text,
    category: catSelect ? catSelect.value : 'Spontaan',
    color: randomColor,
    date: getNowDateTimeStr(),
    archived: false
  });

  localStorage.setItem('voldaan_ideas', JSON.stringify(ideas));
  textarea.value = '';
  renderIdeas();
  renderRandomIdea();
}

function archiveIdea(id) {
  let ideas = JSON.parse(localStorage.getItem('voldaan_ideas') || '[]');
  const idx = ideas.findIndex(i => i.id === id);
  if (idx !== -1) {
    ideas[idx].archived = true;
    localStorage.setItem('voldaan_ideas', JSON.stringify(ideas));
    renderIdeas();
  }
}

function renderIdeas() {
  let ideas = JSON.parse(localStorage.getItem('voldaan_ideas') || '[]');
  const container = document.getElementById('main-ideas-postit-grid');
  if (!container) return;
  container.innerHTML = '';

  const activeIdeas = ideas.filter(i => !i.archived);

  if (activeIdeas.length === 0) {
    container.innerHTML = '<span style="font-size:0.85rem; color:var(--text-muted); grid-column:1/-1;">De ideeënkluis is leeg. Prik een eerste Post-it! 📌</span>';
    return;
  }

  activeIdeas.slice(0, 3).forEach(idea => {
    const div = document.createElement('div');
    div.className = 'postit';
    div.style.backgroundColor = idea.color;
    div.innerHTML = `
      <div class="postit-pin">📌</div>
      <div class="postit-content">${idea.text}</div>
      <div class="postit-footer">
        <span>${idea.category}</span>
        <button style="background:none; border:none; cursor:pointer;" onclick="archiveIdea(${idea.id})">📦</button>
      </div>
    `;
    container.appendChild(div);
  });

  updateCategorySelects();
}

function renderRandomIdea() {
  let ideas = JSON.parse(localStorage.getItem('voldaan_ideas') || '[]');
  const box = document.getElementById('today-random-idea-box');
  if (!box) return;

  const activeIdeas = ideas.filter(i => !i.archived);
  if (activeIdeas.length === 0) {
    box.innerText = "Nog geen ideeën in de kluis. Prik spontane gedachten op het bord!";
    return;
  }

  const randomIdea = activeIdeas[Math.floor(Math.random() * activeIdeas.length)];
  box.innerHTML = `<strong>📌 [${randomIdea.category}]:</strong> ${randomIdea.text}`;
}

function openGrabbeltonModal() {
  document.getElementById('grabbelton-modal').classList.remove('hidden');
  grabNewRandomIdea();
}

function closeGrabbeltonModal() { document.getElementById('grabbelton-modal').classList.add('hidden'); }

function grabNewRandomIdea() {
  let ideas = JSON.parse(localStorage.getItem('voldaan_ideas') || '[]');
  const container = document.getElementById('grabbelton-card-container');
  if (!container) return;

  const activeIdeas = ideas.filter(i => !i.archived);
  if (activeIdeas.length === 0) {
    container.innerHTML = '<span style="color:var(--text-muted);">Geen ideeën om te grabbelen.</span>';
    return;
  }

  const random = activeIdeas[Math.floor(Math.random() * activeIdeas.length)];
  container.innerHTML = `
    <div class="postit" style="background-color:${random.color}; margin:0 auto; max-width:280px;">
      <div class="postit-pin">🎲</div>
      <div class="postit-content">${random.text}</div>
      <div class="postit-footer"><span>${random.category}</span></div>
    </div>
  `;
}

function updateCategorySelects() {
  let categories = JSON.parse(localStorage.getItem('voldaan_categories') || '["Spontaan", "Werk", "Huis", "Creatief"]');
  const select = document.getElementById('idea-category-select');
  if (!select) return;

  select.innerHTML = '';
  categories.forEach(c => {
    select.innerHTML += `<option value="${c}">${c}</option>`;
  });
}

function addNewCategoryPrompt() {
  const cat = prompt("Nieuwe categorie naam:");
  if (!cat) return;
  let categories = JSON.parse(localStorage.getItem('voldaan_categories') || '["Spontaan", "Werk", "Huis", "Creatief"]');
  if (!categories.includes(cat)) {
    categories.push(cat);
    localStorage.setItem('voldaan_categories', JSON.stringify(categories));
    updateCategorySelects();
  }
}

function openManageCategoriesModal() { document.getElementById('manage-categories-modal').classList.remove('hidden'); }
function closeManageCategoriesModal() { document.getElementById('manage-categories-modal').classList.add('hidden'); }
function openIdeasArchiveModal() { document.getElementById('ideas-archive-modal').classList.remove('hidden'); }
function closeIdeasArchiveModal() { document.getElementById('ideas-archive-modal').classList.add('hidden'); }
function openAllIdeasModal() { document.getElementById('all-ideas-modal').classList.remove('hidden'); }
function closeAllIdeasModal() { document.getElementById('all-ideas-modal').classList.add('hidden'); }

// PROJECTEN BEHEER
function toggleAddProjectForm() { document.getElementById('add-project-form').classList.toggle('hidden'); }

function saveNewProject() {
  const title = document.getElementById('project-title-input').value.trim();
  const desc = document.getElementById('project-desc-input').value.trim();
  if (!title) return;

  let projects = JSON.parse(localStorage.getItem('voldaan_projects') || '[]');
  projects.unshift({ id: Date.now(), title, desc, date: getNowDateTimeStr() });
  localStorage.setItem('voldaan_projects', JSON.stringify(projects));

  document.getElementById('project-title-input').value = '';
  document.getElementById('project-desc-input').value = '';
  toggleAddProjectForm();
  renderProjects();
}

function renderProjects() {
  let projects = JSON.parse(localStorage.getItem('voldaan_projects') || '[]');
  const container = document.getElementById('projects-compact-list');
  if (!container) return;
  container.innerHTML = '';

  if (projects.length === 0) {
    container.innerHTML = '<span style="font-size:0.82rem; color:var(--text-muted);">Nog geen projecten aangemaakt.</span>';
    return;
  }

  projects.forEach(p => {
    const div = document.createElement('div');
    div.className = 'item-card';
    div.innerHTML = `
      <div>
        <strong>🚀 ${p.title}</strong>
        ${p.desc ? `<div style="font-size:0.78rem; color:var(--text-muted);">${p.desc}</div>` : ''}
      </div>
    `;
    container.appendChild(div);
  });
}


// ==========================================
// 10. BUDDY-SYSTEEM
// ==========================================

function openBuddySettingsModal() {
  document.getElementById('buddy-settings-modal').classList.remove('hidden');
  renderBuddyInputs();
}

function closeBuddySettingsModal() { document.getElementById('buddy-settings-modal').classList.add('hidden'); }

function renderBuddyInputs() {
  let buddies = JSON.parse(localStorage.getItem('voldaan_buddies') || '[{"name":"Buddy 1","phone":""},{"name":"Buddy 2","phone":""}]');
  const container = document.getElementById('buddy-inputs-list');
  if (!container) return;
  container.innerHTML = '';

  buddies.forEach((b, idx) => {
    container.innerHTML += `
      <div style="display:flex; gap:8px;">
        <input type="text" id="buddy-name-${idx}" value="${b.name}" placeholder="Naam Buddy ${idx+1}">
        <input type="text" id="buddy-phone-${idx}" value="${b.phone}" placeholder="Telefoonnummer">
      </div>
    `;
  });
}

function saveBuddySettings() {
  let buddies = [];
  for (let i = 0; i < 4; i++) {
    const nameEl = document.getElementById(`buddy-name-${i}`);
    const phoneEl = document.getElementById(`buddy-phone-${i}`);
    if (nameEl && phoneEl) {
      buddies.push({ name: nameEl.value.trim() || `Buddy ${i+1}`, phone: phoneEl.value.trim() });
    }
  }
  localStorage.setItem('voldaan_buddies', JSON.stringify(buddies));
  closeBuddySettingsModal();
  renderBuddyGrid();
}

function renderBuddyGrid() {
  let buddies = JSON.parse(localStorage.getItem('voldaan_buddies') || '[]');
  const container = document.getElementById('buddy-quick-grid');
  if (!container) return;
  container.innerHTML = '';

  buddies.forEach(b => {
    if (b.phone) {
      const btn = document.createElement('button');
      btn.className = 'btn btn-secondary btn-small';
      btn.style.fontSize = '0.8rem';
      btn.innerHTML = `💜 ${b.name}`;
      btn.onclick = () => openBuddyActionModal(b);
      container.appendChild(btn);
    }
  });

  if (container.children.length === 0) {
    container.innerHTML = '<span style="font-size:0.78rem; color:var(--text-muted); grid-column:1/-1;">Stel je buddy\'s in via het tandwieltje ⚙️</span>';
  }
}

let currentSelectedBuddy = null;
function openBuddyActionModal(buddy) {
  currentSelectedBuddy = buddy;
  document.getElementById('buddy-modal-title').innerText = `💜 Signaal naar ${buddy.name}`;
  document.getElementById('buddy-action-modal').classList.remove('hidden');
}

function closeBuddyActionModal() { document.getElementById('buddy-action-modal').classList.add('hidden'); }

function sendBuddySignal(type) {
  if (!currentSelectedBuddy || !currentSelectedBuddy.phone) return;

  let msg = "";
  if (type === 'yellow') msg = "Hey! Ik stuur even Code Geel. Het is even druk in mijn hoofd. Geen haast om te reageren, maar dan weet je het!";
  if (type === 'green') msg = "Hey! Even een eerlijke Code Groen update van mij. Het gaat lekker en ik ben bij met mijn ritme!";
  if (type === 'purple') msg = "Hey! Lichte check-in vanuit Voldaan. Hoe is jouw dag vandaag?";

  window.open(`https://wa.me/${currentSelectedBuddy.phone}?text=${encodeURIComponent(msg)}`, '_blank');
  closeBuddyActionModal();
}


// ==========================================
// 11. KENNISFEED & HACKS
// ==========================================

const feedTips = [
  { id: 1, category: "ADHD & Focus", title: "Het 5-Minuten Experiment", text: "Spreek met jezelf af dat je een taak maar 5 minuten doet. Is het daarna nog verschrikkelijk? Dan mag je stoppen. Meestal is de startdrempel de enige echte horde." },
  { id: 2, category: "Ontprikkelen", title: "Visuele Ruis Verminderen", text: "Een opgeruimd gezichtsveld zorgt voor een rustiger hoofd. Leg spullen die je niet gebruikt simpelweg uit je directe zichtveld." },
  { id: 3, category: "Geld & Balans", title: "De 24-Uurs Impulspauze", text: "Voel je een drang om iets aan te schaffen? Zet het in de Impuls-Wachtkamer. Na 24 uur is de dopamine-piek gedaald en beslis je helder." }
];

let currentFeedIndex = 0;

function renderHacksView() {
  const tip = feedTips[currentFeedIndex];
  if (!tip) return;

  const catBadge = document.getElementById('feed-category-badge');
  const title = document.getElementById('feed-title');
  const text = document.getElementById('feed-text');

  if (catBadge) catBadge.innerText = tip.category;
  if (title) title.innerText = tip.title;
  if (text) text.innerText = tip.text;

  updateSavedTipsCount();
}

function generateNextFeedTip() {
  currentFeedIndex = (currentFeedIndex + 1) % feedTips.length;
  renderHacksView();
}

function toggleSaveCurrentFeedTip() {
  const tip = feedTips[currentFeedIndex];
  let saved = JSON.parse(localStorage.getItem('voldaan_saved_tips') || '[]');
  const idx = saved.findIndex(t => t.id === tip.id);

  if (idx === -1) {
    saved.push(tip);
    alert("Tip bewaard in je favorieten! ❤️");
  } else {
    saved.splice(idx, 1);
    alert("Tip verwijderd uit favorieten.");
  }

  localStorage.setItem('voldaan_saved_tips', JSON.stringify(saved));
  updateSavedTipsCount();
}

function updateSavedTipsCount() {
  let saved = JSON.parse(localStorage.getItem('voldaan_saved_tips') || '[]');
  const countEl = document.getElementById('saved-tips-count');
  if (countEl) countEl.innerText = saved.length;
}

function openSavedTipsModal() { document.getElementById('saved-tips-modal').classList.remove('hidden'); }
function closeSavedTipsModal() { document.getElementById('saved-tips-modal').classList.add('hidden'); }
function openAllTipsModal() { document.getElementById('all-tips-modal').classList.remove('hidden'); }
function closeAllTipsModal() { document.getElementById('all-tips-modal').classList.add('hidden'); }


// ==========================================
// 12. INZICHTEN & CROSS-DATA ANALYSE (AANPASSING 8)
// ==========================================

function renderInsightsView() {
  const sleepChart = document.getElementById('insights-sleep-mood-chart');
  const stepsChart = document.getElementById('insights-steps-marbles-chart');
  const summaryText = document.getElementById('insights-summary-text');

  if (!sleepChart || !stepsChart) return;

  sleepChart.innerHTML = '';
  stepsChart.innerHTML = '';

  let sleepLogs = JSON.parse(localStorage.getItem('voldaan_sleep_logs') || '{}');
  let stepsLogs = JSON.parse(localStorage.getItem('voldaan_steps_logs') || '{}');

  const days = 7;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toLocaleDateString('nl-NL');

    const hasSleep = sleepLogs[dStr] && sleepLogs[dStr].status.includes('Goed');
    const pct = hasSleep ? 85 : 35;

    const wrapper = document.createElement('div');
    wrapper.className = 'chart-bar-wrapper';
    wrapper.innerHTML = `
      <div class="chart-bar" style="height: ${pct}%; background-color: ${hasSleep ? '#38A169' : '#CBD5E0'};"></div>
      <span class="chart-label">${dStr.slice(0,5)}</span>
    `;
    sleepChart.appendChild(wrapper);
  }

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dStr = d.toLocaleDateString('nl-NL');

    const hasSteps = stepsLogs[dStr] && stepsLogs[dStr].achieved;
    const pct = hasSteps ? 90 : 40;

    const wrapper = document.createElement('div');
    wrapper.className = 'chart-bar-wrapper';
    wrapper.innerHTML = `
      <div class="chart-bar" style="height: ${pct}%; background-color: ${hasSteps ? '#319795' : '#CBD5E0'};"></div>
      <span class="chart-label">${dStr.slice(0,5)}</span>
    `;
    stepsChart.appendChild(wrapper);
  }

  if (summaryText) {
    summaryText.innerText = "Uit jouw gegevens blijkt dat dagen met voldoende nachtrust én 8.000+ stappen direct zorgen voor meer behaalde overwinningen en een rustigere dagstart!";
  }
}


// ==========================================
// 13. PACT & DASHBOARD RENDERERS
// ==========================================

function savePact() {
  const input = document.getElementById('pact-input');
  const val = input.value.trim();
  if (!val) return;
  localStorage.setItem('voldaan_pact', val);
  input.value = '';
  renderPact();
  renderTodayDashboard();
}

function renderPact() {
  const pact = localStorage.getItem('voldaan_pact');
  const display = document.getElementById('pact-display');
  const form = document.getElementById('pact-form');
  if (!display || !form) return;
  if (pact) {
    document.getElementById('current-pact-text').innerText = pact;
    display.classList.remove('hidden');
    form.classList.add('hidden');
  } else {
    display.classList.add('hidden');
    form.classList.remove('hidden');
  }
}

function completePact() {
  const pact = localStorage.getItem('voldaan_pact');
  if (pact) {
    let history = JSON.parse(localStorage.getItem('voldaan_pact_history') || '[]');
    history.unshift({ text: pact, date: getNowDateTimeStr() });
    localStorage.setItem('voldaan_pact_history', JSON.stringify(history));

    let pactStat = parseInt(localStorage.getItem('voldaan_stat_pacts') || '0') + 1;
    localStorage.setItem('voldaan_stat_pacts', pactStat.toString());

    addMarble(`Avond-Pact Voldaan: "${pact}"`, 'Doelen');
    triggerConfetti();
    localStorage.removeItem('voldaan_pact');
    renderPact();
    renderTodayDashboard();
  }
}

function deletePact() {
  localStorage.removeItem('voldaan_pact');
  renderPact();
  renderTodayDashboard();
}

function exportBackupData() {
  let data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith('voldaan_')) {
      data[key] = localStorage.getItem(key);
    }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Voldaan_Backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
}

function importBackupData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      const data = JSON.parse(evt.target.result);
      Object.keys(data).forEach(k => localStorage.setItem(k, data[k]));
      alert("Backup succesvol geïmporteerd!");
      location.reload();
    } catch(err) {
      alert("Fout bij importeren van backup bestand.");
    }
  };
  reader.readAsText(file);
}

function updatePaydayCountdown() {
  const now = new Date();
  let payday = new Date(now.getFullYear(), now.getMonth(), 23, 8, 0, 0);
  if (now >= payday) payday = new Date(now.getFullYear(), now.getMonth() + 1, 23, 8, 0, 0);

  const diff = payday.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const dEl = document.getElementById('pd-days');
  if (dEl) {
    dEl.innerText = String(days).padStart(2, '0');
    document.getElementById('pd-hours').innerText = String(hours).padStart(2, '0');
    document.getElementById('pd-mins').innerText = String(minutes).padStart(2, '0');
    document.getElementById('pd-secs').innerText = String(seconds).padStart(2, '0');
  }
}

function renderTodayDashboard() {
  const savedPact = localStorage.getItem('voldaan_pact');
  const pactBox = document.getElementById('today-pact-box');
  if (pactBox) {
    if (savedPact) {
      pactBox.innerHTML = `
        <div class="item-card" style="border-left: 4px solid var(--accent-primary);">
          <div><strong>${savedPact}</strong><span class="time-badge">Aangemaakt voor vandaag</span></div>
          <button class="btn btn-small" style="background-color: #38A169; color: white;" onclick="completePact()">✅ Voltooid</button>
        </div>
      `;
    } else {
      pactBox.innerHTML = '<span style="font-size:0.82rem; color:var(--text-muted);">Nog geen Avond-pact gezet.</span>';
    }
  }

  let tasks = JSON.parse(localStorage.getItem('voldaan_tasks') || '[]');
  const todayTasksBox = document.getElementById('today-tasks-list');
  if (todayTasksBox) {
    todayTasksBox.innerHTML = '';
    const activeTasks = tasks.filter(t => !t.done).sort((a,b) => b.id - a.id);

    if (activeTasks.length === 0) {
      todayTasksBox.innerHTML = '<span style="font-size:0.82rem; color:var(--text-muted);">Geen actieve focus-taken voor vandaag. Rustig aan! 🎉</span>';
    } else {
      activeTasks.slice(0, 3).forEach(task => {
        const div = document.createElement('div');
        div.className = 'item-card';
        div.innerHTML = `
          <span style="cursor:pointer;" onclick="toggleTask(${task.id})">⚪ <strong>[${task.category || 'Privé'}]</strong> ${task.text}</span>
          <button class="btn btn-small" style="font-size:0.75rem; padding: 4px 8px;" onclick="toggleTask(${task.id})">✅ Afvinken</button>
        `;
        todayTasksBox.appendChild(div);
      });
    }
  }

  renderCompassGoals();
  updateStats();
}

function updateStats() {
  const elStarts = document.getElementById('stat-starts');
  if (elStarts) elStarts.innerText = localStorage.getItem('voldaan_stat_starts') || '0';
  const elPacts = document.getElementById('stat-pacts');
  if (elPacts) elPacts.innerText = localStorage.getItem('voldaan_stat_pacts') || '0';
  const elTasks = document.getElementById('stat-tasks');
  if (elTasks) elTasks.innerText = localStorage.getItem('voldaan_stat_tasks') || '0';
  const elMoney = document.getElementById('stat-money');
  if (elMoney) elMoney.innerText = localStorage.getItem('voldaan_stat_money') || '0';
  const elContacts = document.getElementById('stat-contacts');
  if (elContacts) elContacts.innerText = localStorage.getItem('voldaan_stat_contacts') || '0';

  let marbles = JSON.parse(localStorage.getItem('voldaan_marbles') || '[]');
  const elMarbles = document.getElementById('stat-marbles');
  if (elMarbles) elMarbles.innerText = marbles.length;
}

function renderMoneyView() {
  renderRuimteProjects();
  renderStudyDebtDisplay();
  renderImpulseItems();
  renderFixedBills();
  renderFutureAnchors();
  updatePaydayCountdown();
}

const brainTips = [
  "De 2-Minuten Regel: Kost een taak minder dan 2 minuten? Doe het meteen of laat het bewust los.",
  "Body Doubling: Werken in het bij zijn van iemand anders verlaagt de drempel om te starten enorm.",
  "Verlaag de wrijving: Wil je morgen iets doen? Zet de spullen alvast in het zicht.",
  "Slecht beginnen is prima: Geef jezelf toestemming om de eerste 5 minuten een slechte poging te doen."
];
let currentTipIndex = 0;
function renderTip() { 
  const el = document.getElementById('tip-text');
  if (el) el.innerText = brainTips[currentTipIndex]; 
}
function nextTip() { currentTipIndex = (currentTipIndex + 1) % brainTips.length; renderTip(); }


// ==========================================
// 14. AUTOMATISCHE STARTUP BIJ LADEN
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderTip();
  renderMarbleJar();
  renderTodayDashboard();
  renderMoneyView();
  renderBuddyGrid();
  renderIdeas();
  renderProjects();
  renderContacts();
  renderPact();
  setInterval(updatePaydayCountdown, 1000);
});

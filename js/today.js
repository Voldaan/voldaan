export function ensureTodayState(state) {
  if (!state) return null;

  state.ui = state.ui || {};
  state.ui.todayCards = state.ui.todayCards || {
    mood: null,
    sleep: null,
    money: null,
    focus: null,
  };

  return state.ui.todayCards;
}

export function getTodayCardData(state = window.VoldaanApp?.state) {
  if (!state) {
    return {
      mood: 'Nog niet gekozen',
      sleep: 'Nog niet vastgelegd',
      money: '€0,00',
      focus: 'Geen focus vastgelegd',
      pact: 'Nog geen pact vastgelegd',
      tasks: [],
    };
  }

  const moneyTotal = state.money?.bills
    ? state.money.bills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0)
    : 0;

  const planItems = Array.isArray(state.taskList) ? state.taskList : [];
  const openTasks = planItems.filter((item) => !item.done).slice(0, 3);
  const focusText = openTasks.length > 0 ? `${openTasks.length} open taak${openTasks.length === 1 ? '' : 'en'}` : 'Rustige dag';

  return {
    mood: state.ui?.moodSelected || 'Nog niet gekozen',
    sleep: state.habits?.sleep || 'Nog niet vastgelegd',
    money: `€${Number(moneyTotal).toFixed(2)}`,
    focus: focusText,
    pact: state.pact?.current || 'Nog geen pact vastgelegd',
    tasks: openTasks,
  };
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderTodayDashboard() {
  const state = window.VoldaanApp?.state;
  if (!state) return;

  const cards = ensureTodayState(state);
  const data = getTodayCardData(state);

  cards.mood = data.mood;
  cards.sleep = data.sleep;
  cards.money = data.money;
  cards.focus = data.focus;

  let panel = document.getElementById('today-dashboard');

  if (!panel) {
    const root = document.querySelector('.container') || document.body;
    panel = document.createElement('section');
    panel.id = 'today-dashboard';
    panel.className = 'app-shell-panel active-panel';
    panel.style.display = 'grid';
    panel.style.gap = '16px';
    panel.style.marginTop = '12px';
    root.appendChild(panel);
  }

  panel.classList.add('app-shell-panel', 'active-panel');
  panel.style.display = '';

  const cardStyle = `
    background: var(--card-bg);
    border: 1.5px solid var(--input-border);
    border-radius: 16px;
    padding: 16px 14px;
    box-shadow: var(--shadow);
    min-height: 120px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  `;

  const labelStyle = `
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--text-muted);
    margin-bottom: 8px;
  `;

  const valueStyle = `
    font-size: 1.05rem;
    font-weight: 700;
    color: var(--text-main);
    line-height: 1.35;
    word-break: break-word;
  `;

  const topCards = [
    {
      title: 'Stemming',
      value: data.mood,
      accent: 'linear-gradient(135deg, rgba(90,103,216,0.12), rgba(90,103,216,0.04))',
    },
    {
      title: 'Slaap',
      value: data.sleep,
      accent: 'linear-gradient(135deg, rgba(45,212,191,0.12), rgba(45,212,191,0.04))',
    },
    {
      title: 'Geld',
      value: data.money,
      accent: 'linear-gradient(135deg, rgba(56,189,248,0.12), rgba(56,189,248,0.04))',
    },
    {
      title: 'Focus',
      value: data.focus,
      accent: 'linear-gradient(135deg, rgba(168,85,247,0.12), rgba(168,85,247,0.04))',
    },
  ];

  const taskMarkup = data.tasks.length
    ? data.tasks.map((task) => `
        <li style="margin-top:8px; list-style:none; padding:8px 10px; background:rgba(17,24,39,0.03); border-radius:10px; border:1px solid rgba(17,24,39,0.05);">
          ${escapeHtml(task.title || 'Taak')}
        </li>
      `).join('')
    : '<li style="list-style:none; color:var(--text-muted);">Geen open taken.</li>';

  panel.innerHTML = `
    <div style="display:grid; gap:12px;">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:2px;">
        <div style="font-size:1.08rem; font-weight:700; color:var(--text-main);">Vandaag</div>
        <div style="font-size:0.76rem; color:var(--text-muted);">${new Date().toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'short' })}</div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(150px, 1fr)); gap:12px;">
        ${topCards.map((item) => `
          <div style="${cardStyle}; background:${item.accent};">
            <div style="${labelStyle}">${item.title}</div>
            <div style="${valueStyle}">${escapeHtml(item.value)}</div>
          </div>
        `).join('')}
      </div>

      <div style="display:grid; grid-template-columns:1.2fr 1fr; gap:12px;">
        <div style="background:var(--card-bg); border:1.5px solid var(--input-border); border-radius:16px; padding:16px; box-shadow:var(--shadow);">
          <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); margin-bottom:8px;">Pact</div>
          <div style="font-size:1rem; font-weight:700; color:var(--text-main); line-height:1.5;">${escapeHtml(data.pact)}</div>
        </div>

        <div style="background:var(--card-bg); border:1.5px solid var(--input-border); border-radius:16px; padding:16px; box-shadow:var(--shadow);">
          <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); margin-bottom:8px;">Open taken</div>
          <ul style="margin:0; padding:0;">${taskMarkup}</ul>
        </div>
      </div>
    </div>
  `;
}

export function initTodayModule() {
  const moodButtons = document.querySelectorAll('.energy-btn');
  const startAction = document.getElementById('start-action');
  const trendBox = document.getElementById('today-mood-trend-box');
  const trendText = document.getElementById('today-mood-trend-text');

  if (!moodButtons.length) return;

  moodButtons.forEach((button) => {
    button.addEventListener('click', () => {
      moodButtons.forEach((btn) => btn.classList.remove('selected'));
      button.classList.add('selected');

      if (window.VoldaanApp?.state) {
        const state = window.VoldaanApp.state;
        state.ui = state.ui || {};
        state.ui.moodSelected = button.textContent.trim();
      }

      if (startAction) {
        startAction.classList.remove('hidden');
      }

      if (trendBox && trendText) {
        trendBox.classList.remove('hidden');
        trendText.textContent = 'Je hebt je energiestaat vastgelegd.';
      }

      renderTodayDashboard();
    });
  });

  if (window.VoldaanApp?.state?.ui?.moodSelected) {
    const selectedText = window.VoldaanApp.state.ui.moodSelected;
    const match = Array.from(moodButtons).find((button) => button.textContent.includes(selectedText));

    if (match) {
      match.classList.add('selected');
    }

    if (startAction) {
      startAction.classList.remove('hidden');
    }

    if (trendBox && trendText) {
      trendBox.classList.remove('hidden');
      trendText.textContent = 'Je hebt je energiestaat vastgelegd.';
    }
  }

  renderTodayDashboard();
}

if (typeof window !== 'undefined') {
  window.initTodayModule = initTodayModule;
  window.renderTodayDashboard = renderTodayDashboard;
}

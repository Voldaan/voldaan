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
    };
  }

  const moneyTotal = state.money?.bills
    ? state.money.bills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0)
    : 0;

  const planCount = Array.isArray(state.plan?.items)
    ? state.plan.items.filter((item) => !item.completed).length
    : 0;

  return {
    mood: state.ui?.moodSelected || 'Nog niet gekozen',
    sleep: state.habits?.sleep || 'Nog niet vastgelegd',
    money: `€${Number(moneyTotal).toFixed(2)}`,
    focus: planCount > 0 ? `${planCount} open taak${planCount === 1 ? '' : 'en'}` : 'Rustige dag',
  };
}

export function renderTodayCards() {
  const state = window.VoldaanApp?.state;
  if (!state) return;

  const cards = ensureTodayState(state);
  const data = getTodayCardData(state);

  cards.mood = data.mood;
  cards.sleep = data.sleep;
  cards.money = data.money;
  cards.focus = data.focus;

  let container = document.getElementById('today-summary-panel');

  if (!container) {
    const root = document.querySelector('.container') || document.body;
    container = document.createElement('section');
    container.id = 'today-summary-panel';
    container.style.marginTop = '12px';
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(150px, 1fr))';
    container.style.gap = '12px';
    root.appendChild(container);
  }

  const cardBase = `
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

  const items = [
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

  container.innerHTML = items.map((item) => `
    <div style="${cardBase}; background:${item.accent};">
      <div style="${labelStyle}">${item.title}</div>
      <div style="${valueStyle}">${item.value}</div>
    </div>
  `).join('');
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

      renderTodayCards();
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

  renderTodayCards();
}

if (typeof window !== 'undefined') {
  window.initTodayModule = initTodayModule;
  window.renderTodayCards = renderTodayCards;
}

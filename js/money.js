export function ensureMoneyState(state) {
  if (!state) return null;

  state.money = state.money || {
    bills: [],
    anchors: [],
    impulseList: [],
    studyDebt: null,
  };

  state.money.bills = state.money.bills || [];
  state.money.anchors = state.money.anchors || [];
  state.money.impulseList = state.money.impulseList || [];

  return state.money;
}

export function getMonthlyBillTotal(state = window.VoldaanApp?.state) {
  const money = ensureMoneyState(state);
  if (!money) return 0;

  return money.bills.reduce((sum, bill) => sum + Number(bill.amount || 0), 0);
}

export function addBill({ name, type, amount, day }) {
  const state = window.VoldaanApp?.state;
  if (!state || !name || !amount || !day) return null;

  const money = ensureMoneyState(state);
  money.bills.push({
    id: Date.now(),
    name,
    type,
    amount: Number(amount),
    day: Number(day),
    paid: false,
    createdAt: new Date().toISOString(),
  });

  if (typeof window.VoldaanApp?.saveState === 'function') {
    window.VoldaanApp.saveState(state);
  }

  return money.bills;
}

export function addAnchor({ name, description, targetAmount, currentAmount, interval, rate, targetDate }) {
  const state = window.VoldaanApp?.state;
  if (!state || !name || !targetAmount) return null;

  const money = ensureMoneyState(state);
  money.anchors.push({
    id: Date.now(),
    name,
    description: description || '',
    targetAmount: Number(targetAmount),
    currentAmount: Number(currentAmount || 0),
    interval: interval || 'maand',
    rate: Number(rate || 0),
    targetDate: targetDate || '',
    createdAt: new Date().toISOString(),
  });

  if (typeof window.VoldaanApp?.saveState === 'function') {
    window.VoldaanApp.saveState(state);
  }

  return money.anchors;
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderMoneyState() {
  const state = window.VoldaanApp?.state;
  if (!state) return;

  const money = ensureMoneyState(state);
  const totalMonthly = getMonthlyBillTotal(state);
  const totalAnchorGoal = money.anchors.reduce((sum, anchor) => sum + Number(anchor.targetAmount || 0), 0);

  let container = document.getElementById('money-status-panel');

  if (!container) {
    const root = document.querySelector('.container') || document.body;
    container = document.createElement('section');
    container.id = 'money-status-panel';
    container.className = 'app-shell-panel';
    root.appendChild(container);
  }

  const billsMarkup = money.bills.length
    ? money.bills.slice(-4).map((bill) => `
        <li style="margin-top:8px; list-style:none; padding:10px 12px; border-radius:10px; background:rgba(90,103,216,0.06); border:1px solid rgba(90,103,216,0.1);">
          <div style="font-weight:600;">${escapeHtml(bill.name)}</div>
          <div style="font-size:0.78rem; color:var(--text-muted); margin-top:4px;">€${Number(bill.amount).toFixed(2)} · elke ${bill.day}e</div>
        </li>
      `).join('')
    : '<li style="list-style:none; color:var(--text-muted);">Geen vaste lasten toegevoegd.</li>';

  const anchorsMarkup = money.anchors.length
    ? money.anchors.slice(-4).map((anchor) => `
        <li style="margin-top:8px; list-style:none; padding:10px 12px; border-radius:10px; background:rgba(56,161,105,0.06); border:1px solid rgba(56,161,105,0.1);">
          <div style="font-weight:600;">${escapeHtml(anchor.name)}</div>
          <div style="font-size:0.78rem; color:var(--text-muted); margin-top:4px;">€${Number(anchor.currentAmount).toFixed(2)} / €${Number(anchor.targetAmount).toFixed(2)}</div>
        </li>
      `).join('')
    : '<li style="list-style:none; color:var(--text-muted);">Geen spaardoelen toegevoegd.</li>';

  container.innerHTML = `
    <div style="display:grid; gap:12px;">
      <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
        <div style="font-size:1.08rem; font-weight:700; color:var(--text-main);">💶 Geld</div>
        <div style="font-size:0.76rem; color:var(--text-muted);">Stabiliteit, niet druk</div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">
        <div style="background:linear-gradient(135deg, rgba(90,103,216,0.12), rgba(90,103,216,0.03)); border:1.5px solid rgba(90,103,216,0.18); border-radius:14px; padding:16px;">
          <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); margin-bottom:6px;">Vaste lasten</div>
          <div style="font-size:1.6rem; font-weight:700; color:var(--accent-primary);">€${Number(totalMonthly).toFixed(2)}</div>
        </div>

        <div style="background:linear-gradient(135deg, rgba(56,189,248,0.12), rgba(56,189,248,0.04)); border:1.5px solid rgba(56,189,248,0.18); border-radius:14px; padding:16px;">
          <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); margin-bottom:6px;">Spaardoel</div>
          <div style="font-size:1.6rem; font-weight:700; color:var(--text-main);">€${Number(totalAnchorGoal).toFixed(2)}</div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px;">
        <div style="background:var(--card-bg); border:1.5px solid var(--input-border); border-radius:14px; padding:16px; box-shadow:var(--shadow);">
          <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); margin-bottom:8px;">Vaste lasten</div>
          <ul style="padding:0; margin:0;">${billsMarkup}</ul>
        </div>

        <div style="background:var(--card-bg); border:1.5px solid var(--input-border); border-radius:14px; padding:16px; box-shadow:var(--shadow);">
          <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); margin-bottom:8px;">Spaardoelen</div>
          <ul style="padding:0; margin:0;">${anchorsMarkup}</ul>
        </div>
      </div>
    </div>
  `;
}

export function initMoneyModule() {
  const state = window.VoldaanApp?.state;
  if (!state) return;

  ensureMoneyState(state);

  const billForm = document.getElementById('add-bill-form');
  const billName = document.getElementById('bill-name-input');
  const billType = document.getElementById('bill-type-select');
  const billAmount = document.getElementById('bill-amount-input');
  const billDay = document.getElementById('bill-day-input');

  const billButtons = Array.from(document.querySelectorAll('button')).filter((button) => {
    const text = (button.textContent || '').trim().toLowerCase();
    return button.closest('#add-bill-form') && text.includes('opslaan');
  });

  const billSaveButton = billButtons[0];

  if (billForm && billName && billType && billAmount && billDay && billSaveButton) {
    billSaveButton.addEventListener('click', () => {
      const name = billName.value.trim();
      const amount = Number(billAmount.value);
      const day = Number(billDay.value);

      if (!name || !amount || !day) return;

      addBill({ name, type: billType.value, amount, day });

      billName.value = '';
      billType.value = 'Automatische Incasso';
      billAmount.value = '';
      billDay.value = '';

      if (billForm) {
        billForm.classList.add('hidden');
      }

      renderMoneyState();
    });
  }

  const anchorForm = document.getElementById('add-anchor-form');
  const anchorName = document.getElementById('anchor-name-input');
  const anchorDesc = document.getElementById('anchor-desc-input');
  const anchorTarget = document.getElementById('anchor-target-amount-input');
  const anchorCurrent = document.getElementById('anchor-current-amount-input');
  const anchorRate = document.getElementById('anchor-rate-input');
  const anchorDate = document.getElementById('anchor-target-date-input');

  const anchorButtons = Array.from(document.querySelectorAll('button')).filter((button) => {
    const text = (button.textContent || '').trim().toLowerCase();
    return button.closest('#add-anchor-form') && text.includes('opslaan');
  });

  const anchorSaveButton = anchorButtons[0];

  if (anchorForm && anchorName && anchorDesc && anchorTarget && anchorCurrent && anchorRate && anchorDate && anchorSaveButton) {
    anchorSaveButton.addEventListener('click', () => {
      const name = anchorName.value.trim();
      const targetAmount = Number(anchorTarget.value);
      const currentAmount = Number(anchorCurrent.value || 0);
      const rate = Number(anchorRate.value || 0);

      if (!name || !targetAmount) return;

      addAnchor({
        name,
        description: anchorDesc.value.trim(),
        targetAmount,
        currentAmount,
        interval: document.getElementById('anchor-interval-select')?.value || 'maand',
        rate,
        targetDate: anchorDate.value,
      });

      anchorName.value = '';
      anchorDesc.value = '';
      anchorTarget.value = '';
      anchorCurrent.value = '';
      anchorRate.value = '';
      anchorDate.value = '';
      renderMoneyState();
    });
  }

  renderMoneyState();
}

if (typeof window !== 'undefined') {
  window.initMoneyModule = initMoneyModule;
  window.VoldaanMoney = {
    ensureMoneyState,
    getMonthlyBillTotal,
    addBill,
    addAnchor,
    renderMoneyState,
  };
}

export function initMoneyModule() {
  const billForm = document.getElementById('add-bill-form');
  const billInputName = document.getElementById('bill-name-input');
  const billInputType = document.getElementById('bill-type-select');
  const billInputAmount = document.getElementById('bill-amount-input');
  const billInputDay = document.getElementById('bill-day-input');
  const billSaveButton = Array.from(document.querySelectorAll('button')).find((button) =>
    button.textContent && button.textContent.includes('Opslaan') && button.textContent.includes('Opslaan')
  );

  if (billInputName && billInputType && billInputAmount && billInputDay && billSaveButton) {
    billSaveButton.addEventListener('click', () => {
      if (window.VoldaanApp?.state) {
        const state = window.VoldaanApp.state;
        state.money = state.money || { bills: [], anchors: [], impulseList: [], studyDebt: null };

        const name = billInputName.value.trim();
        const amount = Number(billInputAmount.value);
        const day = Number(billInputDay.value);

        if (!name || !amount || !day) return;

        state.money.bills.push({
          id: Date.now(),
          name,
          type: billInputType.value,
          amount,
          day,
          paid: false,
          createdAt: new Date().toISOString(),
        });

        billInputName.value = '';
        billInputAmount.value = '';
        billInputDay.value = '';

        if (billForm) {
          billForm.classList.add('hidden');
        }

        saveState(state);
      }
    });
  }

  const anchorInputName = document.getElementById('anchor-name-input');
  const anchorInputDesc = document.getElementById('anchor-desc-input');
  const anchorInputTarget = document.getElementById('anchor-target-amount-input');
  const anchorInputCurrent = document.getElementById('anchor-current-amount-input');
  const anchorInputRate = document.getElementById('anchor-rate-input');
  const anchorInputDate = document.getElementById('anchor-target-date-input');
  const anchorSaveButton = Array.from(document.querySelectorAll('button')).find((button) =>
    button.textContent && button.textContent.includes('Opslaan') && button.textContent.includes('Opslaan')
  );

  if (anchorInputName && anchorInputDesc && anchorInputTarget && anchorInputCurrent && anchorInputRate && anchorInputDate && anchorSaveButton) {
    anchorSaveButton.addEventListener('click', () => {
      if (window.VoldaanApp?.state) {
        const state = window.VoldaanApp.state;
        state.money = state.money || { bills: [], anchors: [], impulseList: [], studyDebt: null };

        const name = anchorInputName.value.trim();
        const target = Number(anchorInputTarget.value);
        const current = Number(anchorInputCurrent.value);

        if (!name || !target) return;

        state.money.anchors.push({
          id: Date.now(),
          name,
          description: anchorInputDesc.value.trim(),
          targetAmount: target,
          currentAmount: current || 0,
          interval: document.getElementById('anchor-interval-select')?.value || 'maand',
          rate: Number(anchorInputRate.value) || 0,
          targetDate: anchorInputDate.value,
          createdAt: new Date().toISOString(),
        });

        anchorInputName.value = '';
        anchorInputDesc.value = '';
        anchorInputTarget.value = '';
        anchorInputCurrent.value = '';
        anchorInputRate.value = '';
        anchorInputDate.value = '';

        saveState(state);
      }
    });
  }
}

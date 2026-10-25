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
}

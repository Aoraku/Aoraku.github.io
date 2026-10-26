(() => {
  let theme = 'light';
  try { if (localStorage.getItem('aoraku-theme') === 'dark') theme = 'dark'; } catch { /* Light is the default. */ }
  document.documentElement.dataset.theme = theme;
  function sync() {
    const dark = document.documentElement.dataset.theme === 'dark';
    document.querySelectorAll('.theme-toggle').forEach(button => {
      button.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
      button.setAttribute('aria-pressed', String(dark));
      button.title = `Switch to ${dark ? 'light' : 'dark'} mode`;
    });
  }
  document.addEventListener('DOMContentLoaded', () => {
    sync();
    document.querySelectorAll('.theme-toggle').forEach(button => button.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try { localStorage.setItem('aoraku-theme', next); } catch { /* Theme still works without storage. */ }
      sync();
    }));
  });
  window.addEventListener('storage', event => {
    if (event.key !== 'aoraku-theme') return;
    document.documentElement.dataset.theme = event.newValue === 'dark' ? 'dark' : 'light';
    sync();
  });
})();

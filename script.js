document.addEventListener('DOMContentLoaded', () => {
  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  const setTheme = (theme) => {
    body.setAttribute('data-theme', theme);
    if (themeToggle) {
      themeToggle.textContent = theme === 'dark' ? 'Light mode' : 'Dark mode';
    }
  };

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = body.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      setTheme(currentTheme);
    });
  }

  setTheme(body.getAttribute('data-theme') || 'dark');
});

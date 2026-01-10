// Theme Toggle Functionality
(function () {
    const THEME_KEY = 'visor-theme';

    // Get saved theme or default to system preference
    function getPreferredTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY);
        if (savedTheme) {
            return savedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Apply theme to document
    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
    }

    // Toggle between light and dark
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || getPreferredTheme();
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    }

    // Initialize theme on page load
    function initTheme() {
        const theme = getPreferredTheme();
        applyTheme(theme);

        // Listen for system theme changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem(THEME_KEY)) {
                applyTheme(e.matches ? 'dark' : 'light');
            }
        });
    }

    // Set up toggle button
    function setupToggleButton() {
        const toggleBtn = document.querySelector('[aria-label="Toggle Theme"]');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleTheme);
        }
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initTheme();
            setupToggleButton();
        });
    } else {
        initTheme();
        setupToggleButton();
    }
})();

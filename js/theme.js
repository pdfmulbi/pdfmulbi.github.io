/**
 * =========================================
 *   THEME TOGGLE - Dark Mode / Light Mode
 * =========================================
 */

(function () {
    'use strict';

    // Constants
    const THEME_KEY = 'pdf-merger-theme';
    const DARK_THEME = 'dark';
    const LIGHT_THEME = 'light';

    /**
     * Get the user's preferred theme
     * Priority: localStorage > system preference > light (default)
     */
    function getPreferredTheme() {
        // Check localStorage first
        const storedTheme = localStorage.getItem(THEME_KEY);
        if (storedTheme) {
            return storedTheme;
        }

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return DARK_THEME;
        }

        // Default to light
        return LIGHT_THEME;
    }

    /**
     * Apply theme to the document
     */
    function applyTheme(theme) {
        if (theme === DARK_THEME) {
            document.documentElement.setAttribute('data-theme', DARK_THEME);
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        updateToggleIcon(theme);
    }

    /**
     * Update the toggle button icon
     */
    function updateToggleIcon(theme) {
        const toggleBtn = document.getElementById('theme-toggle');
        if (!toggleBtn) return;

        const icon = toggleBtn.querySelector('i');
        if (!icon) return;

        if (theme === DARK_THEME) {
            // Show sun icon in dark mode (to switch to light)
            icon.className = 'fas fa-sun';
            toggleBtn.title = 'Switch to Light Mode';
        } else {
            // Show moon icon in light mode (to switch to dark)
            icon.className = 'fas fa-moon';
            toggleBtn.title = 'Switch to Dark Mode';
        }
    }

    /**
     * Toggle between dark and light themes
     */
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === DARK_THEME ? LIGHT_THEME : DARK_THEME;

        // Save to localStorage
        localStorage.setItem(THEME_KEY, newTheme);

        // Apply theme
        applyTheme(newTheme);

        // Add rotation animation to button
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            const icon = toggleBtn.querySelector('i');
            if (icon) {
                icon.style.transform = 'rotate(360deg)';
                setTimeout(() => {
                    icon.style.transform = '';
                }, 500);
            }
        }
    }

    /**
     * Initialize theme on page load
     */
    function init() {
        // Apply theme immediately (before DOM is fully loaded to prevent flash)
        const theme = getPreferredTheme();
        applyTheme(theme);

        // Set up toggle button when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupToggleButton);
        } else {
            setupToggleButton();
        }

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // Only auto-switch if user hasn't set a preference
                if (!localStorage.getItem(THEME_KEY)) {
                    applyTheme(e.matches ? DARK_THEME : LIGHT_THEME);
                }
            });
        }
    }

    /**
     * Set up the toggle button click handler
     */
    function setupToggleButton() {
        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleTheme);
            // Update icon based on current theme
            const currentTheme = document.documentElement.getAttribute('data-theme') || LIGHT_THEME;
            updateToggleIcon(currentTheme);
        }
    }

    // Initialize immediately
    init();

})();

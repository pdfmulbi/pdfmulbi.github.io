/**
 * Notification Manager
 * Handles user activity notifications with backend API integration
 */

const NotificationManager = {
    // Configuration
    API_BASE_URL: 'https://asia-southeast2-personalsmz.cloudfunctions.net/pdfmerger/pdfm',
    notifications: [],
    isDropdownOpen: false,

    /**
     * Initialize notification system
     */
    init() {
        // Only initialize if notification elements exist
        if (!document.getElementById('notification-btn')) return;

        this.bindEvents();
        this.loadNotifications();
    },

    /**
     * Bind click events
     */
    bindEvents() {
        const btn = document.getElementById('notification-btn');
        const dropdown = document.getElementById('notification-dropdown');
        const clearBtn = document.getElementById('clear-notifications');

        // Toggle dropdown on bell click
        btn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });

        // Clear all notifications
        clearBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.clearAll();
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (this.isDropdownOpen && !dropdown?.contains(e.target)) {
                this.closeDropdown();
            }
        });
    },

    /**
     * Toggle dropdown visibility
     */
    toggleDropdown() {
        const dropdown = document.getElementById('notification-dropdown');
        if (this.isDropdownOpen) {
            this.closeDropdown();
        } else {
            dropdown?.classList.add('show');
            this.isDropdownOpen = true;
            this.markAllAsRead();
        }
    },

    /**
     * Close dropdown
     */
    closeDropdown() {
        const dropdown = document.getElementById('notification-dropdown');
        dropdown?.classList.remove('show');
        this.isDropdownOpen = false;
    },

    /**
     * Load notifications from backend API
     */
    async loadNotifications() {
        const token = localStorage.getItem('authToken');

        // If no token, use localStorage fallback
        if (!token) {
            this.loadFromLocalStorage();
            return;
        }

        try {
            const response = await fetch(`${this.API_BASE_URL}/notifications`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.notifications = data.notifications || [];
                this.render();
            } else {
                // Fallback to localStorage if API fails
                this.loadFromLocalStorage();
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
            this.loadFromLocalStorage();
        }
    },

    /**
     * Fallback: Load from localStorage
     */
    loadFromLocalStorage() {
        const stored = localStorage.getItem('pdf_notifications');
        this.notifications = stored ? JSON.parse(stored) : [];
        this.render();
    },

    /**
     * Save to localStorage (fallback)
     */
    saveToLocalStorage() {
        localStorage.setItem('pdf_notifications', JSON.stringify(this.notifications));
    },

    /**
     * Add a new notification
     * @param {string} type - Type: 'merge', 'compress', 'convert', 'summary'
     * @param {string} message - Notification message
     * @param {string} fileName - Optional file name
     */
    async add(type, message, fileName = '') {
        const token = localStorage.getItem('authToken');
        const notification = {
            id: Date.now().toString(),
            type: type,
            message: message,
            icon: this.getIcon(type),
            is_read: false,
            created_at: new Date().toISOString(),
            file_name: fileName
        };

        // Add to local array first for instant UI update
        this.notifications.unshift(notification);
        this.render();
        this.pulseAnimation();

        // If logged in, save to backend
        if (token) {
            try {
                await fetch(`${this.API_BASE_URL}/notifications`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        type: type,
                        message: message,
                        icon: this.getIcon(type),
                        file_name: fileName
                    })
                });
            } catch (error) {
                console.error('Failed to save notification to backend:', error);
            }
        }

        // Always save to localStorage as backup
        this.saveToLocalStorage();
    },

    /**
     * Get icon class based on notification type
     */
    getIcon(type) {
        const icons = {
            'merge': 'fa-object-group',
            'compress': 'fa-compress-alt',
            'convert': 'fa-exchange-alt',
            'summary': 'fa-file-alt'
        };
        return icons[type] || 'fa-bell';
    },

    /**
     * Mark all notifications as read
     */
    async markAllAsRead() {
        const token = localStorage.getItem('authToken');

        // Update local state
        this.notifications.forEach(n => n.is_read = true);
        this.render();
        this.saveToLocalStorage();

        // Update backend if logged in
        if (token) {
            try {
                await fetch(`${this.API_BASE_URL}/notifications/read`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (error) {
                console.error('Failed to mark as read:', error);
            }
        }
    },

    /**
     * Clear all notifications
     */
    async clearAll() {
        const token = localStorage.getItem('authToken');

        // Clear local state
        this.notifications = [];
        this.render();
        this.saveToLocalStorage();

        // Clear on backend if logged in
        if (token) {
            try {
                await fetch(`${this.API_BASE_URL}/notifications`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                });
            } catch (error) {
                console.error('Failed to clear notifications:', error);
            }
        }
    },

    /**
     * Render notifications to UI
     */
    render() {
        const list = document.getElementById('notification-list');
        const badge = document.getElementById('notification-badge');

        if (!list || !badge) return;

        // Count unread
        const unreadCount = this.notifications.filter(n => !n.is_read).length;

        // Update badge
        badge.textContent = unreadCount > 9 ? '9+' : unreadCount;
        if (unreadCount > 0) {
            badge.classList.add('show');
        } else {
            badge.classList.remove('show');
        }

        // Render list
        if (this.notifications.length === 0) {
            list.innerHTML = `
                <div class="notification-empty">
                    <i class="fas fa-bell-slash"></i>
                    <p>No notifications yet</p>
                </div>
            `;
            return;
        }

        list.innerHTML = this.notifications.map(n => `
            <div class="notification-item ${n.is_read ? '' : 'unread'}">
                <div class="notification-icon ${n.type}">
                    <i class="fas ${n.icon}"></i>
                </div>
                <div class="notification-content">
                    <div class="message">${this.escapeHtml(n.message)}</div>
                    <div class="time">${this.formatTime(n.created_at)}</div>
                </div>
            </div>
        `).join('');
    },

    /**
     * Pulse animation for new notification
     */
    pulseAnimation() {
        const badge = document.getElementById('notification-badge');
        badge?.classList.add('pulse');
        setTimeout(() => badge?.classList.remove('pulse'), 300);
    },

    /**
     * Format timestamp to relative time
     */
    formatTime(isoString) {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    },

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    NotificationManager.init();
});

// Export for use in other scripts
window.NotificationManager = NotificationManager;

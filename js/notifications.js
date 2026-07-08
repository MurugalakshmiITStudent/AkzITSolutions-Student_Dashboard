/**
 * Notification Module
 * Handles notification display, marking read/unread, and management
 */

// ========================================
// NOTIFICATION MANAGER CLASS
// ========================================

class NotificationManager {
    constructor() {
        this.notifications = [];
        this.loadNotifications();
        this.render();
        this.setupEventListeners();
    }
    
    // ========================================
    // LOAD NOTIFICATIONS
    // ========================================
    
    loadNotifications() {
        // Try to load from localStorage
        try {
            const stored = localStorage.getItem('notifications');
            if (stored) {
                this.notifications = JSON.parse(stored);
            } else {
                // Seed with sample notifications
                this.notifications = this.getSampleNotifications();
                this.saveNotifications();
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
            this.notifications = this.getSampleNotifications();
            this.saveNotifications();
        }
    }
    
    // ========================================
    // SAMPLE NOTIFICATIONS
    // ========================================
    
    getSampleNotifications() {
        const now = new Date();
        return [
            {
                id: 1,
                message: '📝 Math assignment due tomorrow',
                time: this.formatTime(new Date(now.getTime() - 2 * 60 * 60 * 1000)),
                read: false,
                type: 'assignment'
            },
            {
                id: 2,
                message: '📊 Grades updated for Science class',
                time: this.formatTime(new Date(now.getTime() - 5 * 60 * 60 * 1000)),
                read: false,
                type: 'grade'
            },
            {
                id: 3,
                message: '🎓 Spring registration opens next week',
                time: this.formatTime(new Date(now.getTime() - 24 * 60 * 60 * 1000)),
                read: false,
                type: 'registration'
            },
            {
                id: 4,
                message: '📚 New course material uploaded for History',
                time: this.formatTime(new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)),
                read: true,
                type: 'course'
            }
        ];
    }
    
    // ========================================
    // SAVE NOTIFICATIONS
    // ========================================
    
    saveNotifications() {
        try {
            localStorage.setItem('notifications', JSON.stringify(this.notifications));
        } catch (error) {
            console.error('Error saving notifications:', error);
        }
    }
    
    // ========================================
    // RENDER NOTIFICATIONS
    // ========================================
    
    render() {
        const list = document.querySelector('.notification-list');
        const badge = document.getElementById('notification-badge');
        
        if (!list) return;
        
        const unreadCount = this.notifications.filter(n => !n.read).length;
        
        // Update badge
        if (badge) {
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
        
        // Render notifications
        if (this.notifications.length === 0) {
            list.innerHTML = `
                <div class="notif-empty">
                    <i class="fas fa-check-circle" style="color: var(--success);"></i>
                    <p>All caught up! No new notifications.</p>
                </div>
            `;
            return;
        }
        
        list.innerHTML = this.notifications.map(notif => `
            <div class="notif-item ${notif.read ? 'read' : 'unread'}" 
                 data-id="${notif.id}">
                <div>
                    <div class="notif-message">${notif.message}</div>
                    <div class="notif-time">${notif.time}</div>
                </div>
                ${!notif.read ? `<button class="mark-read-btn" aria-label="Mark as read">✓</button>` : ''}
            </div>
        `).join('');
        
        // Attach event listeners to mark read buttons
        list.querySelectorAll('.mark-read-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const item = btn.closest('.notif-item');
                if (item) {
                    const id = parseInt(item.dataset.id);
                    this.markAsRead(id);
                }
            });
        });
        
        // Click on notification to mark as read
        list.querySelectorAll('.notif-item.unread').forEach(item => {
            item.addEventListener('click', () => {
                const id = parseInt(item.dataset.id);
                this.markAsRead(id);
            });
        });
    }
    
    // ========================================
    // MARK NOTIFICATION AS READ
    // ========================================
    
    markAsRead(id) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification && !notification.read) {
            notification.read = true;
            this.saveNotifications();
            this.render();
            this.updateBadge();
        }
    }
    
    // ========================================
    // MARK ALL AS READ
    // ========================================
    
    markAllRead() {
        let hasUnread = false;
        this.notifications.forEach(n => {
            if (!n.read) {
                n.read = true;
                hasUnread = true;
            }
        });
        
        if (hasUnread) {
            this.saveNotifications();
            this.render();
            this.updateBadge();
            this.showFeedback('All notifications marked as read ✅');
        }
    }
    
    // ========================================
    // ADD NEW NOTIFICATION
    // ========================================
    
    addNotification(message, type = 'general') {
        const notification = {
            id: Date.now(),
            message: message,
            time: this.formatTime(new Date()),
            read: false,
            type: type
        };
        
        this.notifications.unshift(notification);
        this.saveNotifications();
        this.render();
        this.updateBadge();
        
        // Show browser notification if permission granted
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('EduTrack', {
                body: message,
                icon: '/assets/icon.png'
            });
        }
    }
    
    // ========================================
    // UPDATE BADGE COUNT
    // ========================================
    
    updateBadge() {
        const badge = document.getElementById('notification-badge');
        if (badge) {
            const unreadCount = this.notifications.filter(n => !n.read).length;
            badge.textContent = unreadCount;
            badge.style.display = unreadCount > 0 ? 'flex' : 'none';
        }
        
        // Update document title
        const unreadCount = this.notifications.filter(n => !n.read).length;
        if (unreadCount > 0) {
            document.title = `(${unreadCount}) EduTrack - Student Dashboard`;
        } else {
            document.title = 'EduTrack - Student Dashboard';
        }
    }
    
    // ========================================
    // SETUP EVENT LISTENERS
    // ========================================
    
    setupEventListeners() {
        // Mark all read button
        const markAllBtn = document.querySelector('.mark-all-read');
        if (markAllBtn) {
            markAllBtn.addEventListener('click', () => {
                this.markAllRead();
            });
        }
        
        // Request notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
        
        // Simulate new notifications periodically (for demo)
        // Comment out if not needed
        // setInterval(() => {
        //     const messages = [
        //         '📝 New assignment posted in Math class',
        //         '📊 Grade updated for English essay',
        //         '🎓 Reminder: Registration closes tomorrow'
        //     ];
        //     const randomMsg = messages[Math.floor(Math.random() * messages.length)];
        //     this.addNotification(randomMsg);
        // }, 60000); // Every minute
    }
    
    // ========================================
    // HELPER: FORMAT TIME
    // ========================================
    
    formatTime(date) {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        // Format as date
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }
    
    // ========================================
    // SHOW FEEDBACK
    // ========================================
    
    showFeedback(message) {
        let feedback = document.getElementById('notification-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.id = 'notification-feedback';
            feedback.style.cssText = `
                position: fixed;
                bottom: 80px;
                right: 20px;
                padding: 12px 24px;
                background: var(--bg-card, #FFFFFF);
                border-radius: 8px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.15);
                border-left: 4px solid var(--success, #00D4AA);
                font-family: var(--font-family, Inter, sans-serif);
                font-weight: 500;
                z-index: 9999;
                transform: translateX(120%);
                transition: transform 0.3s ease;
                color: var(--text-primary, #1A202C);
            `;
            document.body.appendChild(feedback);
        }
        
        feedback.textContent = message;
        feedback.style.transform = 'translateX(0)';
        
        clearTimeout(feedback._timeout);
        feedback._timeout = setTimeout(() => {
            feedback.style.transform = 'translateX(120%)';
        }, 2500);
    }
}

// ========================================
// INITIALIZE NOTIFICATION MANAGER
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    window.notificationManager = new NotificationManager();
});

// ========================================
// EXPOSE FOR GLOBAL ACCESS
// ========================================

window.NotificationManager = NotificationManager;
/**
 * Student Dashboard - Main Application
 * Handles theme toggle, UI interactions, and global state
 */

// ========================================
// DOM READY
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

// ========================================
// APP INITIALIZATION
// ========================================

function initApp() {
    initThemeToggle();
    initTaskFormToggle();
    initTaskFilters();
    initSearch();
    initNotificationToggle();
    updateTaskCount();
}

// ========================================
// THEME TOGGLE
// ========================================

function initThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateThemeIcon(themeToggle, savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(themeToggle, newTheme);
    });
}

function updateThemeIcon(button, theme) {
    const icon = button.querySelector('i');
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-moon';
    }
}

// ========================================
// TASK FORM TOGGLE
// ========================================

function initTaskFormToggle() {
    const addBtn = document.getElementById('add-task-btn');
    const cancelBtn = document.getElementById('cancel-task-btn');
    const formContainer = document.getElementById('task-form-container');
    
    if (!addBtn || !formContainer) return;
    
    addBtn.addEventListener('click', () => {
        formContainer.classList.toggle('hidden');
        if (!formContainer.classList.contains('hidden')) {
            document.getElementById('task-title')?.focus();
        }
    });
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            formContainer.classList.add('hidden');
        });
    }
}

// ========================================
// TASK FILTERS
// ========================================

function initTaskFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    let currentFilter = 'all';
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Get filter value
            currentFilter = btn.dataset.filter;
            
            // Filter tasks
            filterTasks(currentFilter);
        });
    });
    
    // Expose filter function globally for task updates
    window.filterTasks = filterTasks;
}

function filterTasks(filter) {
    const taskItems = document.querySelectorAll('.task-item');
    const emptyState = document.getElementById('empty-state');
    let visibleCount = 0;
    
    taskItems.forEach(task => {
        const priority = task.dataset.priority || 'low';
        const isCompleted = task.classList.contains('completed');
        
        let show = false;
        
        switch (filter) {
            case 'all':
                show = true;
                break;
            case 'high':
                show = priority === 'high' && !isCompleted;
                break;
            case 'medium':
                show = priority === 'medium' && !isCompleted;
                break;
            case 'low':
                show = priority === 'low' && !isCompleted;
                break;
            case 'completed':
                show = isCompleted;
                break;
            default:
                show = true;
        }
        
        task.style.display = show ? 'flex' : 'none';
        if (show) visibleCount++;
    });
    
    // Show/hide empty state
    if (emptyState) {
        if (visibleCount === 0 && taskItems.length > 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }
    }
}

// ========================================
// SEARCH FUNCTIONALITY
// ========================================

function initSearch() {
    const searchInput = document.querySelector('.search-box input');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const taskItems = document.querySelectorAll('.task-item');
        
        taskItems.forEach(task => {
            const title = task.querySelector('.task-title')?.textContent?.toLowerCase() || '';
            const shouldShow = title.includes(query) || query === '';
            task.style.display = shouldShow ? 'flex' : 'none';
        });
    });
}

// ========================================
// NOTIFICATIONS
// ========================================

function initNotificationToggle() {
    const bell = document.querySelector('.notification-bell');
    const dropdown = document.getElementById('notification-dropdown');
    
    if (!bell || !dropdown) return;
    
    bell.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('show');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.notification-wrapper')) {
            dropdown.classList.remove('show');
        }
    });
}

// ========================================
// UPDATE TASK COUNT
// ========================================

function updateTaskCount() {
    const taskCountEl = document.getElementById('task-count');
    const taskSubtext = document.getElementById('task-subtext');
    
    if (!taskCountEl) return;
    
    const taskItems = document.querySelectorAll('.task-item:not(.completed)');
    const count = taskItems.length;
    
    taskCountEl.textContent = count;
    
    if (taskSubtext) {
        const urgentTasks = document.querySelectorAll('.task-item:not(.completed) .task-priority.high');
        taskSubtext.textContent = urgentTasks.length > 0 
            ? `${urgentTasks.length} urgent` 
            : 'No urgent tasks';
    }
}

// ========================================
// EXPOSE GLOBAL FUNCTIONS
// ========================================

window.updateTaskCount = updateTaskCount;
window.filterTasks = filterTasks;
/**
 * Task Management Module
 * Handles CRUD operations for tasks with localStorage persistence
 */

// ========================================
// TASK MANAGER CLASS
// ========================================

class TaskManager {
    constructor() {
        this.tasks = [];
        this.loadTasks();
        this.render();
        this.setupEventListeners();
    }
    
    // ========================================
    // LOAD TASKS FROM LOCALSTORAGE
    // ========================================
    
    loadTasks() {
        try {
            const stored = localStorage.getItem('tasks');
            if (stored) {
                this.tasks = JSON.parse(stored);
            } else {
                // Seed with sample tasks if empty
                this.tasks = this.getSampleTasks();
                this.saveTasks();
            }
        } catch (error) {
            console.error('Error loading tasks:', error);
            this.tasks = this.getSampleTasks();
            this.saveTasks();
        }
    }
    
    // ========================================
    // SAMPLE TASKS
    // ========================================
    
    getSampleTasks() {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const nextWeek = new Date(today);
        nextWeek.setDate(nextWeek.getDate() + 7);
        
        return [
            {
                id: Date.now() + 1,
                title: 'Complete Math Assignment - Chapter 5',
                dueDate: this.formatDate(tomorrow),
                priority: 'high',
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 2,
                title: 'Science Project: Solar System Model',
                dueDate: this.formatDate(nextWeek),
                priority: 'high',
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 3,
                title: 'Read English Literature: Chapter 3-5',
                dueDate: this.formatDate(tomorrow),
                priority: 'medium',
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 4,
                title: 'History Essay: World War II',
                dueDate: this.formatDate(nextWeek),
                priority: 'medium',
                completed: false,
                createdAt: new Date().toISOString()
            },
            {
                id: Date.now() + 5,
                title: 'Art Project: Landscape Painting',
                dueDate: this.formatDate(tomorrow),
                priority: 'low',
                completed: false,
                createdAt: new Date().toISOString()
            }
        ];
    }
    
    // ========================================
    // HELPER: FORMAT DATE
    // ========================================
    
    formatDate(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    
    // ========================================
    // SAVE TASKS TO LOCALSTORAGE
    // ========================================
    
    saveTasks() {
        try {
            localStorage.setItem('tasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.error('Error saving tasks:', error);
        }
    }
    
    // ========================================
    // ADD TASK
    // ========================================
    
    addTask(title, dueDate, priority) {
        // Validation
        if (!title || title.trim() === '') {
            alert('Please enter a task title');
            return false;
        }
        
        if (!dueDate) {
            alert('Please select a due date');
            return false;
        }
        
        const task = {
            id: Date.now(),
            title: title.trim(),
            dueDate: dueDate,
            priority: priority || 'medium',
            completed: false,
            createdAt: new Date().toISOString()
        };
        
        this.tasks.unshift(task);
        this.saveTasks();
        this.render();
        this.updateStats();
        
        // Show success feedback
        this.showFeedback('Task added successfully! ✅');
        return true;
    }
    
    // ========================================
    // TOGGLE TASK COMPLETION
    // ========================================
    
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.render();
            this.updateStats();
            
            const status = task.completed ? 'completed' : 'uncompleted';
            this.showFeedback(`Task ${status}!`);
        }
    }
    
    // ========================================
    // DELETE TASK
    // ========================================
    
    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.render();
            this.updateStats();
            this.showFeedback('Task deleted! 🗑️');
        }
    }
    
    // ========================================
    // RENDER TASKS TO DOM
    // ========================================
    
    render() {
        const taskList = document.getElementById('task-list');
        const emptyState = document.getElementById('empty-state');
        
        if (!taskList) return;
        
        // Sort tasks: incomplete first, then by priority, then by date
        const sortedTasks = [...this.tasks].sort((a, b) => {
            // Completed tasks go to bottom
            if (a.completed && !b.completed) return 1;
            if (!a.completed && b.completed) return -1;
            
            // Sort by priority (high > medium > low)
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
                return priorityOrder[a.priority] - priorityOrder[b.priority];
            }
            
            // Sort by due date (closest first)
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
        
        if (sortedTasks.length === 0) {
            taskList.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            this.updateStats();
            return;
        }
        
        if (emptyState) emptyState.classList.add('hidden');
        
        taskList.innerHTML = sortedTasks.map(task => `
            <li class="task-item ${task.completed ? 'completed' : ''}" 
                data-id="${task.id}"
                data-priority="${task.priority}">
                <input type="checkbox" 
                       ${task.completed ? 'checked' : ''}
                       aria-label="Mark task as ${task.completed ? 'incomplete' : 'complete'}">
                <span class="task-title">${this.escapeHtml(task.title)}</span>
                <span class="task-priority ${task.priority}">
                    ${task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'} 
                    ${task.priority}
                </span>
                <span class="task-due">📅 ${this.formatDisplayDate(task.dueDate)}</span>
                <button class="delete-btn" aria-label="Delete task">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </li>
        `).join('');
        
        // Attach event listeners to each task
        this.attachTaskListeners();
        
        // Re-apply current filter
        if (window.filterTasks) {
            const activeFilter = document.querySelector('.filter-btn.active');
            if (activeFilter) {
                window.filterTasks(activeFilter.dataset.filter);
            }
        }
    }
    
    // ========================================
    // ATTACH TASK EVENT LISTENERS
    // ========================================
    
    attachTaskListeners() {
        const taskItems = document.querySelectorAll('.task-item');
        
        taskItems.forEach(item => {
            const id = parseInt(item.dataset.id);
            
            // Checkbox toggle
            const checkbox = item.querySelector('input[type="checkbox"]');
            if (checkbox) {
                checkbox.addEventListener('change', () => {
                    this.toggleTask(id);
                });
            }
            
            // Delete button
            const deleteBtn = item.querySelector('.delete-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteTask(id);
                });
            }
            
            // Click on task to toggle (optional)
            item.addEventListener('click', (e) => {
                // Don't trigger if clicking on checkbox or delete button
                if (e.target.closest('input[type="checkbox"]') || 
                    e.target.closest('.delete-btn')) {
                    return;
                }
                this.toggleTask(id);
            });
        });
    }
    
    // ========================================
    // UPDATE STATISTICS
    // ========================================
    
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const highPriority = this.tasks.filter(t => !t.completed && t.priority === 'high').length;
        
        // Update task count in stats
        const taskCount = document.getElementById('task-count');
        if (taskCount) taskCount.textContent = pending;
        
        const taskSubtext = document.getElementById('task-subtext');
        if (taskSubtext) {
            taskSubtext.textContent = highPriority > 0 
                ? `${highPriority} urgent` 
                : 'No urgent tasks';
        }
        
        // Update chart if available
        if (window.updateTaskChart) {
            window.updateTaskChart();
        }
    }
    
    // ========================================
    // SETUP EVENT LISTENERS
    // ========================================
    
    setupEventListeners() {
        // Add task form
        const form = document.getElementById('add-task-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const title = document.getElementById('task-title');
                const dueDate = document.getElementById('task-due');
                const priority = document.getElementById('task-priority');
                
                if (title && dueDate && priority) {
                    const success = this.addTask(
                        title.value,
                        dueDate.value,
                        priority.value
                    );
                    
                    if (success) {
                        form.reset();
                        document.getElementById('task-form-container')?.classList.add('hidden');
                    }
                }
            });
        }
    }
    
    // ========================================
    // HELPER: ESCAPE HTML
    // ========================================
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // ========================================
    // HELPER: FORMAT DISPLAY DATE
    // ========================================
    
    formatDisplayDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Check if today
        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        }
        
        // Check if tomorrow
        if (date.toDateString() === tomorrow.toDateString()) {
            return 'Tomorrow';
        }
        
        // Format as MM/DD/YYYY
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }
    
    // ========================================
    // SHOW FEEDBACK MESSAGE
    // ========================================
    
    showFeedback(message) {
        // Create feedback element if it doesn't exist
        let feedback = document.getElementById('task-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.id = 'task-feedback';
            feedback.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 12px 24px;
                background: var(--bg-card, #FFFFFF);
                border-radius: 8px;
                box-shadow: 0 4px 16px rgba(0,0,0,0.15);
                border-left: 4px solid var(--primary, #6C63FF);
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
        feedback.style.borderLeftColor = message.includes('✅') ? 'var(--success)' : 'var(--primary)';
        
        // Auto-hide after 2.5 seconds
        clearTimeout(feedback._timeout);
        feedback._timeout = setTimeout(() => {
            feedback.style.transform = 'translateX(120%)';
        }, 2500);
    }
}

// ========================================
// INITIALIZE TASK MANAGER
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
});

// ========================================
// EXPOSE FOR GLOBAL ACCESS
// ========================================

window.TaskManager = TaskManager;
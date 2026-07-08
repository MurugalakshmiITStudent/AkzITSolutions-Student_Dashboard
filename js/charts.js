/**
 * Charts Module
 * Handles Chart.js initialization and rendering
 */

// ========================================
// WAIT FOR DOM AND CHART.JS
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Wait for Chart.js to load
    if (typeof Chart !== 'undefined') {
        initCharts();
    } else {
        // Chart.js not loaded, try again later
        setTimeout(() => {
            if (typeof Chart !== 'undefined') {
                initCharts();
            }
        }, 500);
    }
});

// ========================================
// CHART INITIALIZATION
// ========================================

function initCharts() {
    // Check if canvas elements exist
    const gradeCanvas = document.getElementById('gradeChart');
    const taskCanvas = document.getElementById('taskChart');
    
    if (!gradeCanvas || !taskCanvas) {
        console.warn('Chart canvases not found');
        return;
    }
    
    initGradeChart(gradeCanvas);
    initTaskChart(taskCanvas);
}

// ========================================
// GRADE CHART (Bar Chart)
// ========================================

function initGradeChart(canvas) {
    const ctx = canvas.getContext('2d');
    
    // Check if chart already exists
    if (window.gradeChartInstance) {
        window.gradeChartInstance.destroy();
    }
    
    // Get theme colors
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#E8EAED' : '#1A202C';
    const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
    
    // Custom plugin to add data labels on bars
    const dataLabelsPlugin = {
        id: 'dataLabels',
        afterDraw(chart) {
            const { ctx, data, chartArea: { top, bottom, left, right } } = chart;
            
            ctx.save();
            data.datasets[0].data.forEach((value, index) => {
                const meta = chart.getDatasetMeta(0);
                const bar = meta.data[index];
                
                // Draw value on top of bar
                ctx.fillStyle = textColor;
                ctx.font = '600 12px Inter, sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(`${value}%`, bar.x, bar.y - 6);
            });
            ctx.restore();
        }
    };
    
    window.gradeChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Math', 'Science', 'English', 'History', 'Art', 'PE'],
            datasets: [{
                label: 'Grade (%)',
                data: [92, 88, 95, 78, 90, 85],
                backgroundColor: [
                    '#6C63FF', '#FF6584', '#00D4AA', 
                    '#FFC857', '#4A90D9', '#FF6B6B'
                ],
                borderColor: [
                    '#5A52D5', '#E55A78', '#00B898',
                    '#D4A02A', '#3A7BC9', '#E55A5A'
                ],
                borderWidth: 0,
                borderRadius: 8,
                barPercentage: 0.6,
                categoryPercentage: 0.8,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                },
                tooltip: {
                    backgroundColor: isDark ? 'rgba(26, 29, 38, 0.9)' : 'rgba(255,255,255,0.9)',
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            return `Grade: ${context.parsed.y}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    grid: {
                        color: gridColor,
                        drawBorder: false,
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            family: 'Inter',
                            size: 11,
                            weight: '500'
                        },
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false,
                    },
                    ticks: {
                        color: textColor,
                        font: {
                            family: 'Inter',
                            size: 11,
                            weight: '500'
                        }
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            // Add responsive options
            onResize: function(chart) {
                // Adjust bar thickness on small screens
                const width = chart.width;
                if (width < 400) {
                    chart.options.barPercentage = 0.4;
                } else {
                    chart.options.barPercentage = 0.6;
                }
                chart.update();
            }
        },
        plugins: [dataLabelsPlugin]
    });
}

// ========================================
// TASK CHART (Doughnut Chart)
// ========================================

function initTaskChart(canvas) {
    const ctx = canvas.getContext('2d');
    
    // Check if chart already exists
    if (window.taskChartInstance) {
        window.taskChartInstance.destroy();
    }
    
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    const textColor = isDark ? '#E8EAED' : '#1A202C';
    
    // Calculate task statistics
    const taskItems = document.querySelectorAll('.task-item');
    let completed = 0;
    let inProgress = 0;
    let pending = 0;
    
    taskItems.forEach(task => {
        if (task.classList.contains('completed')) {
            completed++;
        } else {
            const priority = task.dataset.priority || 'medium';
            if (priority === 'high') {
                pending++;
            } else {
                inProgress++;
            }
        }
    });
    
    // If no tasks, show sample data
    if (taskItems.length === 0) {
        completed = 12;
        inProgress = 8;
        pending = 5;
    }
    
    window.taskChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'In Progress', 'Pending'],
            datasets: [{
                data: [completed, inProgress, pending],
                backgroundColor: ['#00D4AA', '#FFC857', '#FF6B6B'],
                borderColor: isDark ? '#1A1D26' : '#FFFFFF',
                borderWidth: 3,
                hoverOffset: 10,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: textColor,
                        font: {
                            family: 'Inter',
                            size: 12,
                            weight: '500'
                        },
                        padding: 16,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    backgroundColor: isDark ? 'rgba(26, 29, 38, 0.9)' : 'rgba(255,255,255,0.9)',
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    borderWidth: 1,
                    cornerRadius: 8,
                    padding: 12,
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((context.parsed / total) * 100).toFixed(1);
                            return `${context.label}: ${context.parsed} tasks (${percentage}%)`;
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                duration: 1200,
                easing: 'easeOutQuart'
            }
        }
    });
}

// ========================================
// REINITIALIZE CHARTS ON THEME CHANGE
// ========================================

// Watch for theme changes
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
            // Recreate charts with new theme
            setTimeout(() => {
                if (typeof Chart !== 'undefined') {
                    initCharts();
                }
            }, 300);
        }
    });
});

observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme']
});

// ========================================
// EXPOSE FOR TASK UPDATES
// ========================================

// Function to update task chart when tasks change
window.updateTaskChart = function() {
    const canvas = document.getElementById('taskChart');
    if (canvas && typeof Chart !== 'undefined') {
        initTaskChart(canvas);
    }
};

// Also update grade chart (if needed)
window.updateGradeChart = function() {
    const canvas = document.getElementById('gradeChart');
    if (canvas && typeof Chart !== 'undefined') {
        initGradeChart(canvas);
    }
};
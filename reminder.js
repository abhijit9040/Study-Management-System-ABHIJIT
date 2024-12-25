// Main application logic
const App = {
    tasks: [],

    init() {
        // Load tasks from local storage on initialization
        this.tasks = Storage.load();
        this.setupEventListeners();
        this.startTimeUpdate();
        this.startReminderCheck();
        Notifications.requestPermission();
        UI.renderSchedule(this.tasks);
    },

    setupEventListeners() {
        document.getElementById('addTaskBtn').addEventListener('click', () => UI.showModal());
        document.getElementById('cancelBtn').addEventListener('click', () => UI.hideModal());
        document.getElementById('taskForm').addEventListener('submit', (e) => this.handleAddTask(e));
    },

    startTimeUpdate() {
        UI.updateTime();
        setInterval(() => UI.updateTime(), 1000);
    },

    startReminderCheck() {
        setInterval(() => Notifications.checkReminders(this.tasks), 60000);
    },

    handleAddTask(e) {
        e.preventDefault();

        // Get task details from the form
        const task = {
            id: Date.now().toString(),
            subject: document.getElementById('subject').value,
            day: document.getElementById('day').value,
            time: document.getElementById('time').value,
        };

        if (!task.subject || !task.day || !task.time) {
            alert('Please fill out all fields.');
            return;
        }

        // Add the new task to the tasks array
        this.tasks.push(task);

        // Save tasks to local storage
        Storage.save(this.tasks);

        // Update the schedule grid and close the modal
        UI.renderSchedule(this.tasks);
        UI.hideModal();
    },

    deleteTask(taskId) {
        // Remove the task from the array by its ID
        this.tasks = this.tasks.filter(task => task.id !== taskId);
        Storage.save(this.tasks);
        UI.renderSchedule(this.tasks);
    }
};

// Notification handling
const Notifications = {
    async requestPermission() {
        if ('Notification' in window) {
            await Notification.requestPermission();
        }
    },

    send(subject) {
        if (Notification.permission === 'granted') {
            new Notification('Study Reminder!', {
                body: `Time to study ${subject}!`,
                icon: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=50&h=50&fit=crop',
            });
        }
    },

    checkReminders(tasks) {
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });

        tasks.forEach(task => {
            if (task.day === currentDay && task.time === currentTime) {
                this.send(task.subject);
            }
        });
    }
};

// Storage handling
const Storage = {
    save(tasks) {
        localStorage.setItem('studyTasks', JSON.stringify(tasks));
    },

    load() {
        const tasks = localStorage.getItem('studyTasks');
        return tasks ? JSON.parse(tasks) : [];
    }
};

// UI handling
const UI = {
    updateTime() {
        const timeElement = document.getElementById('current-time');
        const now = new Date();
        timeElement.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    },

    showModal() {
        document.getElementById('taskModal').style.display = 'block';
    },

    hideModal() {
        document.getElementById('taskModal').style.display = 'none';
        document.getElementById('taskForm').reset();
    },

    createTaskElement(task) {
        return `
            <div class="task-item" data-id="${task.id}">
                <div class="task-info">
                    <h3>${task.subject}</h3>
                    <p><strong>Day:</strong> ${task.day}</p>
                    <p><strong>Time:</strong> ${task.time}</p>
                </div>
                <div class="task-actions">
                    <button class="delete-btn" onclick="App.deleteTask('${task.id}')">🗑️ Delete</button>
                </div>
            </div>
        `;
    },

    renderSchedule(tasks) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const scheduleGrid = document.getElementById('scheduleGrid');
        
        scheduleGrid.innerHTML = days.map(day => `
            <div class="day-card">
                <h2>${day}</h2>
                <div class="task-list">
                    ${tasks
                        .filter(task => task.day === day)
                        .map(task => this.createTaskElement(task))
                        .join('')}
                </div>
            </div>
        `).join('');
    }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', () => App.init());

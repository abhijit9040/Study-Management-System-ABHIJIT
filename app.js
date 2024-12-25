const USERS_KEY = 'study_management_users';
const SUBJECTS_KEY = 'study_management_subjects';
const CURRENT_USER_KEY = 'study_management_current_user';
const LAST_USER_ID_KEY = 'study_management_last_user_id';
const LAST_SUBJECT_ID_KEY = 'study_management_last_subject_id';

function getLastUserId() {
    return parseInt(localStorage.getItem(LAST_USER_ID_KEY) || '0');
}

function incrementUserId() {
    const lastId = getLastUserId();
    const newId = lastId + 1;
    localStorage.setItem(LAST_USER_ID_KEY, newId.toString());
    return newId;
}

function getLastSubjectId(userId) {
    const key = `${LAST_SUBJECT_ID_KEY}_${userId}`;
    return parseInt(localStorage.getItem(key) || '0');
}

function incrementSubjectId(userId) {
    const key = `${LAST_SUBJECT_ID_KEY}_${userId}`;
    const lastId = getLastSubjectId(userId);
    const newId = lastId + 1;
    localStorage.setItem(key, newId.toString());
    return newId;
}

function getUsers() {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}

function saveUser(user) {
    const users = getUsers();
    const existingUserIndex = users.findIndex(u => u.id === user.id);
    
    if (existingUserIndex !== -1) {
        users[existingUserIndex] = user;
    } else {
        users.push(user);
    }
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUser() {
    const sessionData = localStorage.getItem(CURRENT_USER_KEY);
    if (!sessionData) return null;
    
    const sessionUser = JSON.parse(sessionData);
    const users = getUsers();
    return users.find(u => u.id === sessionUser.id) || null;
}

function setCurrentUser(user) {
    if (user) {
        const sessionData = {
            id: user.id,
            name: user.name,
            email: user.email
        };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionData));
    } else {
        localStorage.removeItem(CURRENT_USER_KEY);
    }
}

function getSubjects(userId) {
    const allSubjects = JSON.parse(localStorage.getItem(SUBJECTS_KEY) || '{}');
    return allSubjects[userId] || [];
}

function saveSubjects(userId, subjects) {
    const allSubjects = JSON.parse(localStorage.getItem(SUBJECTS_KEY) || '{}');
    allSubjects[userId] = subjects;
    localStorage.setItem(SUBJECTS_KEY, JSON.stringify(allSubjects));
}

function getCurrentWeek() {
    const now = new Date();
    const onejan = new Date(now.getFullYear(), 0, 1);
    const week = Math.ceil((((now.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${week}`;
}

function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth() + 1}`;
}

function showElement(id) {
    document.getElementById(id).classList.remove('hidden');
}

function hideElement(id) {
    document.getElementById(id).classList.add('hidden');
}

function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    const users = getUsers();
    const user = users.find(u => u.email === email);
    
    if (user) {
        if(user.password === password)
            {
                setCurrentUser(user);
                document.getElementById('loginForm').reset();
                initializeApp();
            }
        else{
            alert("Incorrect password")
        }
    } else {
        alert('Invalid email');
    }
}

function handleSignup(e) {
    e.preventDefault();
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;

    const users = getUsers();
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
        alert('An account with this email already exists. Please login instead.');
        hideElement('signupForm');
        showElement('loginForm');
        document.getElementById('authTitle').textContent = 'Sign in to your account';
        document.getElementById('loginEmail').value = email;
        return;
    }

    const newUser = {
        id: parseInt(incrementUserId()),
        name: document.getElementById('signupName').value.trim(),
        email,
        password,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(document.getElementById('signupName').value)}`,
        institution: {
            type: document.getElementById('institutionType').value,
            name: document.getElementById('institutionName').value,
            class: document.getElementById('className').value
        }
    };

    saveUser(newUser);
    setCurrentUser(newUser);
    document.getElementById("signupForm").reset();
    initializeApp();
}

// Subject handling
function handleAddSubject(e) {
    e.preventDefault();
    const name = document.getElementById('subjectName').value;
    const totalHours = parseInt(document.getElementById('totalHours').value);
    const user = getCurrentUser();
    const subjects = getSubjects(user.id);

    if (totalHours>24) {
        alert('Total hours must be between 0 and 24');
        return;
    }

    const existingSubject = subjects.find(s => s.name.toLowerCase() === name.toLowerCase());
    
    if (existingSubject) {
        const newTotal = existingSubject.totalHours + totalHours;
        if (newTotal > 24||newTotal<=0) {
            alert('Total hours cannot exceed 24 or be below 0 hours per subject');
            return;
        }
        existingSubject.totalHours = newTotal;
        saveSubjects(user.id, subjects);
    } else {
        const newSubject = {
            id:incrementSubjectId(user.id),
            name:name.trim(),
            totalHours,
            coveredHours:0,
            weeklyProgress: {},
            monthlyProgress: {}
        };
        subjects.push(newSubject);
        saveSubjects(parseInt(user.id), subjects);
    }

    document.getElementById('subjectForm').reset();
    renderSubjects();
}

function handleUpdateHours(subjectId, hours) {
    const user = getCurrentUser();
    const subjects = getSubjects(user.id);
    const currentWeek = getCurrentWeek();
    const currentMonth = getCurrentMonth();

    const subject = subjects.find(s => s.id === parseInt(subjectId));
    if (subject) {
        const newCoveredHours = Math.min(subject.totalHours, subject.coveredHours + hours);
        if(newCoveredHours<0)
        {
            alert('Total hours cannot be below 0 hours per subject');
            return;
        }
        subject.coveredHours = newCoveredHours;
        subject.weeklyProgress[currentWeek] = (subject.weeklyProgress[currentWeek] || 0) + hours;
        subject.monthlyProgress[currentMonth] = (subject.monthlyProgress[currentMonth] || 0) + hours;
        
        saveSubjects(user.id, subjects);
        renderSubjects();
    }
}

function handleRemoveSubject(subjectId){
    if (confirm('Are you sure you want to remove this subject? This action cannot be undone.')) {
      const user = getCurrentUser();
      if (!user) return;
      
      const subjects = getSubjects(user.id);
      const updatedSubjects = subjects.filter(s => s.id !== subjectId);
      saveSubjects(user.id, updatedSubjects);
      renderSubjects();
    }
  }

// Profile handling
function handleProfileEdit(e) {
    e.preventDefault();
    const user = getCurrentUser();
    user.institution = {
        type: document.getElementById('editInstitutionType').value,
        name: document.getElementById('editInstitutionName').value,
        class: document.getElementById('editClassName').value
    };
    
    saveUser(user);
    hideElement('profileEditor');
    updateProfileDisplay();
}

// Rendering
function renderSubjects() {
    const user = getCurrentUser();
    const subjects = getSubjects(user.id);
    const subjectList = document.getElementById('subjectList');
    const currentWeek = getCurrentWeek();
    const currentMonth = getCurrentMonth();

    subjectList.innerHTML = subjects.map(subject => {
        const weeklyHours = subject.weeklyProgress[currentWeek] || 0;
        const monthlyHours = subject.monthlyProgress[currentMonth] || 0;
        const overallProgress = (subject.coveredHours / subject.totalHours) * 100;
        const weeklyProgress = (weeklyHours / 40) * 100;
        const monthlyProgress = (monthlyHours / 160) * 100;

        return `
            <div class="subject-card">
                <div class="subject-header">
                    <div class="subject-title">
                        <h3>${subject.name}</h3>
                    </div>
                    <span>${subject.coveredHours}/${subject.totalHours}h</span>
                </div>

                <div class="progress-section">
                    <div class="progress-label">
                        <span>Overall Progress</span>
                        <span>${Math.round(overallProgress)}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-value overall" style="width: ${overallProgress}%"></div>
                    </div>
                </div>

                <div class="progress-section">
                    <div class="progress-label">
                        <span>This Week</span>
                        <span>${weeklyHours}h</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-value weekly" style="width: ${weeklyProgress}%"></div>
                    </div>
                </div>

                <div class="progress-section">
                    <div class="progress-label">
                        <span>This Month</span>
                        <span>${monthlyHours}h</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-value monthly" style="width: ${monthlyProgress}%"></div>
                    </div>
                </div>

                <div class="form-group">
                    <label>Add/Remove study hours</label>
                    <input type="number" min="-24" max="24" class="study-hours-input"
                           onchange="handleUpdateHours('${subject.id}', Number(this.value))">
                        <button type="button" class="delete-btn" 
                                onclick="handleRemoveSubject(${subject.id})" 
                                title="Remove subject">Remove Subject</button>
                </div>
            </div>
        `;
    }).join('');
}

function setupProfileHandlers() {
    const avatar = document.getElementById('profileAvatar');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const profileInfo = document.getElementById('profileInfo');
    const profileEditor = document.getElementById('profileEditor');

    // Handle avatar click for dropdown menu
    avatar.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event from bubbling to profileInfo
        dropdownMenu.classList.toggle('hidden');
        // Always hide profile editor when showing dropdown
        profileEditor.classList.add('hidden');
    });

    // Handle profile info click for profile editor
    profileInfo.addEventListener('click', (e) => {
        // Only show profile editor if click didn't come from avatar
        if (e.target !== avatar && !avatar.contains(e.target)) {
            profileEditor.classList.remove('hidden');
            dropdownMenu.classList.add('hidden'); // Hide dropdown when showing editor
        }
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!dropdownMenu.contains(e.target) && e.target !== avatar) {
            dropdownMenu.classList.add('hidden');
        }
        if (!profileEditor.contains(e.target) && !profileInfo.contains(e.target)) {
            profileEditor.classList.add('hidden');
        }
    });

    // Handle profile edit cancel
    document.getElementById('cancelProfileEdit').addEventListener('click', () => {
        hideElement('profileEditor');
    });
}

function updateProfileDisplay() {
    const user = getCurrentUser();
    document.getElementById('profileName').textContent = user.name;
    document.getElementById('profileInstitution').textContent = user.institution.name;
    document.getElementById('profileAvatar').src = user.avatar;
}

// Initialization
function initializeApp() {
    hideElement('authForms');
    showElement('app');
    updateProfileDisplay();
    renderSubjects();
}

function initializeAuth() {
    hideElement('app');
    showElement('authForms');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
        initializeApp();
    } else {
        initializeAuth();
    }

    // Auth form switching
    document.getElementById('showSignup').addEventListener('click', () => {
        hideElement('loginForm');
        showElement('signupForm');
        document.getElementById('authTitle').textContent = 'Create your account';
    });

    document.getElementById('showLogin').addEventListener('click', () => {
        hideElement('signupForm');
        showElement('loginForm');
        document.getElementById('authTitle').textContent = 'Sign in to your account';
    });

    // Form submissions
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    document.getElementById('signupForm').addEventListener('submit', handleSignup);
    document.getElementById('subjectForm').addEventListener('submit', handleAddSubject);
    document.getElementById('profileForm').addEventListener('submit', handleProfileEdit);

    // Profile editing
    document.getElementById('profileInfo').addEventListener('click', () => {
        const user = getCurrentUser();
        document.getElementById('editInstitutionType').value = user.institution.type;
        document.getElementById('editInstitutionName').value = user.institution.name;
        document.getElementById('editClassName').value = user.institution.class;
        showElement('profileEditor');
    });

    document.getElementById('cancelProfileEdit').addEventListener('click', () => {
        hideElement('profileEditor');
    });

    // Sign out
    document.getElementById('signOutBtn').addEventListener('click', () => {
        setCurrentUser(null);
        initializeAuth();
        showElement('loginForm');
    });
});
const avatar = document.getElementById('profileAvatar');
const dropdownMenu = document.getElementById('dropdownMenu');

avatar.addEventListener('click', () => {
    // Toggle visibility of the dropdown menu
    dropdownMenu.classList.toggle('hidden');
});

// Hide dropdown if clicked outside
document.addEventListener('click', (event) => {
    if (!dropdownMenu.contains(event.target) && event.target !== avatar) {
        dropdownMenu.classList.add('hidden');
    }
});




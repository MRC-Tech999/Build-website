// --- Initial Setup and Data Loading ---
// Initialize default admin accounts if they don't exist
const DEFAULT_ADMIN_USERNAME = 'Marc';
const DEFAULT_ADMIN_PASSWORD = 'Marc2025';
const DEFAULT_ADMIN_EMAIL = 'marc@example.com';

let adminAccounts = JSON.parse(localStorage.getItem('adminAccounts'));
if (!adminAccounts || adminAccounts.length === 0) {
    adminAccounts = [{
        username: DEFAULT_ADMIN_USERNAME,
        password: DEFAULT_ADMIN_PASSWORD,
        email: DEFAULT_ADMIN_EMAIL
    }];
    localStorage.setItem('adminAccounts', JSON.stringify(adminAccounts));
}

// Load users from localStorage or use sample data
let users = JSON.parse(localStorage.getItem('adminUsers')) || [
    { id: 1, name: "John Doe", email: "john@example.com", role: "User" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "Editor" },
];

// Load messages from localStorage or initialize empty array
let messages = JSON.parse(localStorage.getItem('userMessages')) || [];

// --- Helper Functions for Data Persistence ---
function saveAdminAccounts() {
    localStorage.setItem('adminAccounts', JSON.stringify(adminAccounts));
}

function saveUsers() {
    localStorage.setItem('adminUsers', JSON.stringify(users));
}

function saveMessages() {
    localStorage.setItem('userMessages', JSON.stringify(messages));
}

// --- DOM Elements ---
// User Management
const userTable = document.getElementById("user-table").getElementsByTagName("tbody")[0];
const addUserBtn = document.getElementById("add-user-btn");
const addUserModal = document.getElementById("add-user-modal");
const userForm = document.getElementById("user-form");

// Admin Account Management
const adminAccountsLink = document.getElementById('admin-accounts-link');
const userManagementCard = document.getElementById('user-management-card');
const adminAccountsCard = document.getElementById('admin-accounts-card');
const adminTable = document.getElementById('admin-table').getElementsByTagName("tbody")[0];
const addAdminBtn = document.getElementById('add-admin-btn');
const addAdminModal = document.getElementById('add-admin-modal');
const adminForm = document.getElementById('admin-form');

// Message Management
const messagesList = document.getElementById('messages-list');
const notificationBadge = document.getElementById('notification-badge');

// Modals Close Buttons (using data-modal attribute for common handler)
document.querySelectorAll('.modal .close').forEach(button => {
    button.addEventListener('click', () => {
        const modalId = button.dataset.modal;
        document.getElementById(modalId).style.display = 'none';
        userForm.reset(); // Reset user form on close
        adminForm.reset(); // Reset admin form on close
    });
});

// --- Render Functions ---
function renderUsers() {
    userTable.innerHTML = "";
    users.forEach((user) => {
        const row = userTable.insertRow();
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>
                <button class="btn" onclick="editUser(${user.id})">Edit</button>
                <button class="btn btn-danger" onclick="deleteUser(${user.id})">Delete</button>
            </td>
        `;
    });
    saveUsers();
}

function renderAdminAccounts() {
    adminTable.innerHTML = "";
    adminAccounts.forEach((admin) => {
        const row = adminTable.insertRow();
        row.innerHTML = `
            <td>${admin.username}</td>
            <td>${admin.email}</td>
            <td>
                <button class="btn btn-danger" onclick="deleteAdmin('${admin.username}')">Delete</button>
            </td>
        `;
    });
    saveAdminAccounts();
}

function renderMessages() {
    messagesList.innerHTML = '';
    if (messages.length === 0) {
        messagesList.innerHTML = '<p>No new messages.</p>';
    } else {
        // Display messages from newest to oldest
        messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('card');
            messageDiv.style.marginBottom = '10px';
            messageDiv.style.backgroundColor = '#f9f9f9';
            messageDiv.innerHTML = `
                <p><strong>From:</strong> ${msg.sender}</p>
                <p><strong>Email:</strong> ${msg.email}</p>
                <p><strong>Subject:</strong> ${msg.subject}</p>
                <p>${msg.message}</p>
                <small style="color: #888;">Received: ${new Date(msg.timestamp).toLocaleString()}</small>
                <button class="btn btn-danger" style="margin-left: 10px;" onclick="deleteMessage('${msg.id}')">Delete</button>
            `;
            messagesList.appendChild(messageDiv);
        });
    }
    updateNotificationBadge();
}

// --- User Management Logic ---
addUserBtn.addEventListener("click", () => {
    userForm.reset();
    userForm.dataset.editingId = '';
    addUserModal.style.display = "flex";
    document.getElementById("name").focus(); // Focus on first input
});

userForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const role = document.getElementById("role").value;
    const editingId = userForm.dataset.editingId;

    if (editingId) {
        const user = users.find((u) => u.id === parseInt(editingId));
        if (user) {
            user.name = name;
            user.email = email;
            user.role = role;
        }
    } else {
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            name,
            email,
            role,
        };
        users.push(newUser);
    }
    renderUsers();
    addUserModal.style.display = "none";
    userForm.reset();
});

function editUser(id) {
    const user = users.find((user) => user.id === id);
    if (user) {
        document.getElementById("name").value = user.name;
        document.getElementById("email").value = user.email;
        document.getElementById("role").value = user.role;
        userForm.dataset.editingId = id;
        addUserModal.style.display = "flex";
        document.getElementById("name").focus();
    }
}

function deleteUser(id) {
    if (confirm("Are you sure you want to delete this user?")) {
        users = users.filter((user) => user.id !== id);
        renderUsers();
    }
}

// --- Admin Account Management Logic ---
adminAccountsLink.addEventListener('click', (e) => {
    e.preventDefault();
    userManagementCard.style.display = 'none';
    adminAccountsCard.style.display = 'block';
    renderAdminAccounts();
});

document.querySelector('.sidebar ul li.active a').addEventListener('click', (e) => {
    e.preventDefault(); // Prevent default link behavior
    userManagementCard.style.display = 'block'; // Show user card
    adminAccountsCard.style.display = 'none'; // Hide admin card
    // Reset active class on sidebar if needed for multiple active links
    document.querySelector('.sidebar ul li.active').classList.remove('active');
    e.currentTarget.parentElement.classList.add('active'); // Set current link as active
});


addAdminBtn.addEventListener('click', () => {
    adminForm.reset();
    addAdminModal.style.display = 'flex';
    document.getElementById('adminUsername').focus();
});

adminForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('adminUsername').value;
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;

    // Basic validation
    if (!username || !email || !password) {
        alert("Please fill in all fields for the new admin account.");
        return;
    }

    // Check if username or email already exists (case-insensitive for username/email)
    const usernameExists = adminAccounts.some(admin => admin.username.toLowerCase() === username.toLowerCase());
    const emailExists = adminAccounts.some(admin => admin.email.toLowerCase() === email.toLowerCase());

    if (usernameExists) {
        alert("An admin with this username already exists.");
        return;
    }
    if (emailExists) {
        alert("An admin with this email already exists.");
        return;
    }

    const newAdmin = {
        username: username,
        email: email,
        password: password // In a real app, hash this password!
    };
    adminAccounts.push(newAdmin);
    saveAdminAccounts();
    renderAdminAccounts();
    addAdminModal.style.display = 'none';
    adminForm.reset();
    alert("New admin account created successfully!");
});

function deleteAdmin(username) {
    if (adminAccounts.length === 1) {
        alert("You cannot delete the last admin account.");
        return;
    }
    if (confirm(`Are you sure you want to delete admin "${username}"?`)) {
        adminAccounts = adminAccounts.filter(admin => admin.username !== username);
        saveAdminAccounts();
        renderAdminAccounts();
    }
}

// --- Message Management Logic ---
function deleteMessage(id) {
    if (confirm("Are you sure you want to delete this message?")) {
        messages = messages.filter(msg => msg.id !== id);
        saveMessages();
        renderMessages();
    }
}

function updateNotificationBadge() {
    notificationBadge.textContent = messages.length;
    notificationBadge.style.display = messages.length > 0 ? 'block' : 'none';
}

// --- Initial Render ---
document.addEventListener("DOMContentLoaded", () => {
    renderUsers();
    renderMessages();
    // Initially display User Management, hide Admin Accounts
    userManagementCard.style.display = 'block';
    adminAccountsCard.style.display = 'none';

    // Add click listener to the Dashboard link in sidebar to switch back
    document.querySelector('.sidebar ul li a i.fa-home').parentElement.addEventListener('click', (e) => {
        e.preventDefault();
        userManagementCard.style.display = 'block';
        adminAccountsCard.style.display = 'none';
        // Handle active class
        document.querySelector('.sidebar ul li.active').classList.remove('active');
        e.currentTarget.parentElement.classList.add('active');
    });
});


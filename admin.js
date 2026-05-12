const token = localStorage.getItem('annexlink_token');
const currentUser = JSON.parse(localStorage.getItem('annexlink_user'));

// Security: Kick out non-admins
if (!token || !currentUser || currentUser.role !== 'admin') {
    alert("Access Denied. Admins only.");
    window.location.href = "feed.html";
}

// Load correct data based on which admin page we are on
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('admin-total-users')) {
        loadAdminDashboard();
    }
    if (document.getElementById('admin-users-table')) {
        loadAdminUsers();
    }
});

// --- LOAD ADMIN DASHBOARD STATS ---
async function loadAdminDashboard() {
    try {
        const response = await fetch('http://localhost:8000/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const stats = await response.json();
            document.getElementById('admin-total-users').innerText = stats.totalUsers;
            document.getElementById('admin-active-posts').innerText = stats.activePosts;
            document.getElementById('admin-total-reviews').innerText = stats.totalReviews;
        }
    } catch (error) {
        console.error("Error loading admin stats:", error);
    }
}

// --- LOAD USERS TABLE ---
async function loadAdminUsers() {
    try {
        const response = await fetch('http://localhost:8000/api/admin/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const users = await response.json();
            const tbody = document.getElementById('admin-users-table');
            tbody.innerHTML = '';

            users.forEach(user => {
                const avatar = user.avatar.startsWith('http') ? user.avatar : (user.avatar === 'default-avatar.png' ? `https://ui-avatars.com/api/?name=${user.name}` : `http://localhost:8000${user.avatar}`);
                const statusClass = user.status === 'Active' ? 'status-active' : (user.status === 'Banned' ? 'status-banned' : 'status-reported');
                const banIcon = user.status === 'Banned' ? 'fa-undo' : 'fa-ban';
                const banTitle = user.status === 'Banned' ? 'Unban User' : 'Ban User';

                tbody.innerHTML += `
                    <tr>
                        <td>
                            <div class="user-cell">
                                <img src="${avatar}" alt="User">
                                <div>
                                    <h4>${user.name} <span class="text-sm">(${user.role})</span></h4>
                                    <p>${user.email}</p>
                                </div>
                            </div>
                        </td>
                        <td>${user.department} (Batch ${user.batch})</td>
                        <td><span class="status-badge ${statusClass}">${user.status}</span></td>
                        <td>
                            <div class="admin-actions">
                                <button class="btn-small btn-view" title="View Profile" onclick="window.location.href='user-profile.html?id=${user._id}'"><i class="fas fa-eye"></i></button>
                                ${user.role !== 'admin' ? `<button class="btn-small btn-ban" title="${banTitle}" onclick="toggleBan('${user._id}')"><i class="fas ${banIcon}"></i></button>` : ''}
                                ${user.role !== 'admin' ? `<button class="btn-small btn-delete" title="Delete User" onclick="deleteUser('${user._id}')"><i class="fas fa-trash"></i></button>` : ''}
                            </div>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        console.error("Error loading users:", error);
    }
}

// --- BAN / UNBAN USER ---
async function toggleBan(userId) {
    if (!confirm("Are you sure you want to change this user's ban status?")) return;
    try {
        const response = await fetch(`http://localhost:8000/api/admin/users/${userId}/ban`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            alert("User status updated.");
            loadAdminUsers(); // Reload table
        } else {
            const data = await response.json();
            alert(data.message);
        }
    } catch (error) {
        console.error("Error toggling ban:", error);
    }
}

// --- DELETE USER ---
async function deleteUser(userId) {
    if (!confirm("CRITICAL WARNING: Delete this user permanently? This cannot be undone.")) return;
    try {
        const response = await fetch(`http://localhost:8000/api/admin/users/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            loadAdminUsers(); // Reload table
        }
    } catch (error) {
        console.error("Error deleting user:", error);
    }
}

// Add these triggers inside your DOMContentLoaded event listener at the top of admin.js:
// if (document.getElementById('admin-reports-table')) loadAdminReports();
// if (document.getElementById('admin-settings-form')) loadAdminSettings();

// In loadAdminDashboard(), update the reports stat:
// document.getElementById('admin-pending-reports').innerText = stats.pendingReports;

// --- DYNAMIC REPORTS ---
async function loadAdminReports() {
    try {
        const response = await fetch('http://localhost:8000/api/admin/reports', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const reports = await response.json();
            const tbody = document.getElementById('admin-reports-table');
            tbody.innerHTML = '';

            if (reports.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No pending reports!</td></tr>';
                return;
            }

            reports.forEach(report => {
                tbody.innerHTML += `
                    <tr>
                        <td>
                            <strong>User: ${report.reportedUser.name}</strong>
                            <p class="text-sm">${report.reportedUser.email}</p>
                        </td>
                        <td>${report.reason}</td>
                        <td>${report.reporter.email}</td>
                        <td>
                            <div class="admin-actions">
                                <button class="btn-small btn-view" title="Review Profile" onclick="window.location.href='user-profile.html?id=${report.reportedUser._id}'">Review</button>
                                <button class="btn-small btn-ban" title="Ban User" onclick="toggleBan('${report.reportedUser._id}')"><i class="fas fa-ban"></i></button>
                                <button class="btn-small" style="background: var(--text-muted); color:white;" onclick="dismissReport('${report._id}')" title="Dismiss">Dismiss</button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        console.error(error);
    }
}

async function dismissReport(reportId) {
    if(!confirm("Dismiss this report?")) return;
    await fetch(`http://localhost:8000/api/admin/reports/${reportId}/dismiss`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    loadAdminReports();
}

// --- DYNAMIC SETTINGS ---
async function loadAdminSettings() {
    try {
        const res = await fetch('http://localhost:8000/api/admin/settings', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const settings = await res.json();
            document.getElementById('set-name').value = settings.platformName;
            document.getElementById('set-email').value = settings.supportEmail;
            document.getElementById('set-maintenance').checked = settings.maintenanceMode;
            document.getElementById('set-verification').checked = settings.requireEmailVerification;
        }
    } catch (err) { console.error(err); }
}

async function saveAdminSettings() {
    const platformName = document.getElementById('set-name').value;
    const supportEmail = document.getElementById('set-email').value;
    const maintenanceMode = document.getElementById('set-maintenance').checked;
    const requireEmailVerification = document.getElementById('set-verification').checked;

    await fetch('http://localhost:8000/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ platformName, supportEmail, maintenanceMode, requireEmailVerification })
    });
    alert("Settings Saved Successfully!");
}

// Make sure your save button in admin-settings.html calls saveAdminSettings()!
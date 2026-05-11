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
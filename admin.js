const token = localStorage.getItem('annexlink_token');
const currentUser = JSON.parse(localStorage.getItem('annexlink_user'));

// Security: Kick out non-admins
if (!token || !currentUser || currentUser.role !== 'admin') {
    alert("Access Denied. Admins only.");
    window.location.href = "feed.html";
}

// Load correct data based on which admin page we are on
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('admin-total-users')) loadAdminDashboard();
    if (document.getElementById('admin-users-table')) loadAdminUsers();
    if (document.getElementById('admin-reports-table')) loadAdminReports(); 
    if (document.getElementById('admin-settings-form')) loadAdminSettings();
});

// --- LOAD ADMIN DASHBOARD STATS ---
async function loadAdminDashboard() {
    try {
        const response = await fetch('http://localhost:8000/api/admin/stats', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const stats = await response.json();
            document.getElementById('admin-total-users').innerText = stats.totalUsers || 0;
            document.getElementById('admin-active-posts').innerText = stats.activePosts || 0;
            document.getElementById('admin-total-reviews').innerText = stats.totalReviews || 0;
            
            const pendingReportsEl = document.getElementById('admin-pending-reports');
            if(pendingReportsEl) pendingReportsEl.innerText = stats.pendingReports || 0;
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
            if(!tbody) return; // Prevent crash if element doesn't exist
            
            tbody.innerHTML = '';

            users.forEach(user => {
                // BULLETPROOF AVATAR CHECK
                const dbAvatar = user.avatar || "default-avatar.png";
                const avatarUrl = (dbAvatar === "default-avatar.png") 
                    ? `https://ui-avatars.com/api/?name=${user.name}&background=0A192F&color=fff` 
                    : (dbAvatar.startsWith('http') ? dbAvatar : `http://localhost:8000${dbAvatar}`);

                const statusClass = user.status === 'Active' ? 'status-active' : (user.status === 'Banned' ? 'status-banned' : 'status-reported');
                const banIcon = user.status === 'Banned' ? 'fa-undo' : 'fa-ban';
                const banTitle = user.status === 'Banned' ? 'Unban User' : 'Ban User';

                tbody.innerHTML += `
                    <tr>
                        <td>
                            <div class="user-cell">
                                <img src="${avatarUrl}" alt="User">
                                <div>
                                    <h4>${user.name} <span class="text-sm">(${user.role})</span></h4>
                                    <p>${user.email}</p>
                                </div>
                            </div>
                        </td>
                        <td>${user.department || 'N/A'} (Batch ${user.batch || 'N/A'})</td>
                        <td><span class="status-badge ${statusClass}">${user.status || 'Active'}</span></td>
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
            loadAdminUsers(); // Reload table instantly
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
        if (response.ok) loadAdminUsers(); 
    } catch (error) {
        console.error("Error deleting user:", error);
    }
}

// --- ADD ADMIN ---
async function makeAdmin() {
    const email = prompt("Enter the @student.bup.edu.bd email of the user to promote:");
    if (!email) return;

    try {
        const response = await fetch('http://localhost:8000/api/admin/users/make-admin', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ email: email.trim() })
        });
        const data = await response.json();
        alert(data.message);
        if (response.ok) loadAdminUsers(); 
    } catch (error) {
        console.error(error);
    }
}

// --- DYNAMIC REPORTS ---
async function loadAdminReports() {
    try {
        const response = await fetch('http://localhost:8000/api/admin/reports', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const reports = await response.json();
            const tbody = document.getElementById('admin-reports-table');
            if(!tbody) return;
            
            tbody.innerHTML = '';

            if (reports.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No pending reports!</td></tr>';
                return;
            }

            reports.forEach(report => {
                const reportedName = report.reportedUser ? report.reportedUser.name : "Deleted User";
                const reportedEmail = report.reportedUser ? report.reportedUser.email : "N/A";
                const reporterEmail = report.reporter ? report.reporter.email : "Deleted User";
                const reportedId = report.reportedUser ? report.reportedUser._id : null;

                tbody.innerHTML += `
                    <tr>
                        <td>
                            <strong>User: ${reportedName}</strong>
                            <p class="text-sm">${reportedEmail}</p>
                        </td>
                        <td><span class="status-badge status-reported" style="background:rgba(230, 57, 70, 0.15); color:#E63946;">${report.reason}</span></td>
                        <td>${reporterEmail}</td>
                        <td>
                            <div class="admin-actions">
                                ${reportedId ? `<button class="btn-small btn-view" title="Review Profile" onclick="window.location.href='user-profile.html?id=${reportedId}'"><i class="fas fa-eye"></i></button>` : ''}
                                ${reportedId ? `<button class="btn-small btn-ban" title="Ban User" onclick="toggleBan('${reportedId}')"><i class="fas fa-ban"></i></button>` : ''}
                                <button class="btn-small" style="background: var(--text-muted); color:white;" onclick="dismissReport('${report._id}')" title="Dismiss">Dismiss</button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        console.error("Error loading reports:", error);
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

// --- DOWNLOAD PDF REPORT FUNCTION ---
function downloadAdminReport() {
    const element = document.querySelector('.admin-content');
    const downloadBtn = document.querySelector('.admin-header button');
    if(downloadBtn) downloadBtn.style.display = 'none';

    const opt = {
        margin:       0.5,
        filename:     'AnnexLink_Platform_Report.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        if(downloadBtn) downloadBtn.style.display = 'block';
    });
}
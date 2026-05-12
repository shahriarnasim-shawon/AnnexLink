const token = localStorage.getItem('annexlink_token');
const currentUserStr = localStorage.getItem('annexlink_user');

if (!token || !currentUserStr) window.location.href = "index.html";

const currentUser = JSON.parse(currentUserStr);

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Set greeting
    const greetingEl = document.getElementById('dash-greeting');
    if (greetingEl) greetingEl.innerText = `Welcome back, ${currentUser.name.split(' ')[0]}! 👋`;
    
    // 2. Set Top-Right Navbar Avatar
    const avatarUrl = (!currentUser.avatar || currentUser.avatar === "default-avatar.png") 
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=0A192F&color=fff` 
        : (currentUser.avatar.startsWith('http') ? currentUser.avatar : `http://localhost:8000${currentUser.avatar}`);
    
    const navAvatar = document.querySelector('.nav-right .avatar');
    if (navAvatar) navAvatar.src = avatarUrl;

    // 3. Fetch Real Dashboard Data
    try {
        const response = await fetch('http://localhost:8000/api/users/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            
            // Update Number Stats
            const servicesEl = document.getElementById('dash-services');
            const requestsEl = document.getElementById('dash-requests');
            const earnedEl = document.getElementById('dash-earned');

            if (servicesEl) servicesEl.innerText = data.activeServices || 0;
            if (requestsEl) requestsEl.innerText = data.pendingRequests || 0;
            if (earnedEl) earnedEl.innerText = `৳ ${data.earned || 0}`;

            // Update Activity Table
            const tbody = document.getElementById('dash-activity-table');
            if (!tbody) return;
            
            tbody.innerHTML = '';

            if (!data.recentActivity || data.recentActivity.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No recent activity found.</td></tr>';
                return;
            }

            data.recentActivity.forEach(post => {
                const date = new Date(post.createdAt).toLocaleDateString();
                const statusClass = post.status === 'Active' ? 'status-active' : 'status-pending';
                const actionPage = post.type === 'Service' ? 'my-services.html' : 'my-requests.html';

                tbody.innerHTML += `
                    <tr>
                        <td><strong>${post.title}</strong></td>
                        <td>${post.type}</td>
                        <td>${date}</td>
                        <td><span class="status-badge ${statusClass}">${post.status}</span></td>
                        <td><button class="btn btn-outline" style="padding: 0.4rem 0.8rem;" onclick="window.location.href='${actionPage}'">Manage</button></td>
                    </tr>
                `;
            });
        }
    } catch (error) {
        console.error("Dashboard fetch error:", error);
    }
});
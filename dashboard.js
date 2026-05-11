const token = localStorage.getItem('annexlink_token');
const currentUser = JSON.parse(localStorage.getItem('annexlink_user'));

if (!token) window.location.href = "index.html";

document.addEventListener('DOMContentLoaded', async () => {
    // Set greeting and avatars
    document.getElementById('dash-greeting').innerText = `Welcome back, ${currentUser.name.split(' ')[0]}! 👋`;
    
    const avatarUrl = (!currentUser.avatar || currentUser.avatar === "default-avatar.png") 
        ? `https://ui-avatars.com/api/?name=${currentUser.name}&background=0A192F&color=fff` 
        : (currentUser.avatar.startsWith('http') ? currentUser.avatar : `http://localhost:8000${currentUser.avatar}`);
    
    const navAvatar = document.querySelector('.nav-right .avatar');
    if (navAvatar) navAvatar.src = avatarUrl;

    // Fetch Dashboard Data
    try {
        const response = await fetch('http://localhost:8000/api/users/dashboard', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            
            // 1. Update Stats
            document.getElementById('dash-services').innerText = data.activeServices;
            document.getElementById('dash-requests').innerText = data.pendingRequests;
            document.getElementById('dash-earned').innerText = `৳ ${data.earned}`;

            // 2. Update Table
            const tbody = document.getElementById('dash-activity-table');
            tbody.innerHTML = '';

            if (data.recentActivity.length === 0) {
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
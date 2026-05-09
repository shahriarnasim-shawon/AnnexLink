const notifToken = localStorage.getItem('annexlink_token');

async function fetchNotifications() {
    if (!notifToken) return;

    try {
        const response = await fetch('http://localhost:8000/api/notifications', {
            headers: { 'Authorization': `Bearer ${notifToken}` }
        });
        
        if (response.ok) {
            const notifications = await response.json();
            renderNotifications(notifications);
        }
    } catch (error) {
        console.error("Error fetching notifications:", error);
    }
}

function renderNotifications(notifications) {
    const badge = document.getElementById('notif-badge');
    const list = document.getElementById('notif-list');
    
    if (!badge || !list) return;

    // Calculate unread count
    const unreadCount = notifications.filter(n => !n.isRead).length;
    
    if (unreadCount > 0) {
        badge.innerText = unreadCount;
        badge.style.display = 'block';
    } else {
        badge.style.display = 'none';
    }

    list.innerHTML = ''; // Clear old content
    
    if (notifications.length === 0) {
        list.innerHTML = '<p style="padding: 1.5rem; text-align: center; color: var(--text-muted);">No new notifications</p>';
        return;
    }

    notifications.forEach(n => {
        // Dynamic icons based on type
        const icon = n.type === 'Message' ? 'fa-comment-dots' : n.type === 'Review' ? 'fa-star' : 'fa-bell';
        const color = n.type === 'Message' ? 'var(--accent-teal)' : n.type === 'Review' ? 'var(--accent-orange)' : 'var(--primary-navy)';
        
        const notifHTML = `
            <div class="notif-item ${n.isRead ? '' : 'unread'}" onclick="markAsRead('${n._id}', '${n.relatedLink}')">
                <div class="notif-icon-circle" style="background: ${color};"><i class="fas ${icon}"></i></div>
                <div class="notif-info">
                    <p>${n.content}</p>
                    <span class="notif-time text-sm">Click to view</span>
                </div>
            </div>
        `;
        list.innerHTML += notifHTML;
    });
}

// Mark notification as read, then redirect
async function markAsRead(notifId, redirectLink) {
    try {
        await fetch(`http://localhost:8000/api/notifications/${notifId}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${notifToken}` }
        });
        
        // Redirect to the chat page or post page
        if (redirectLink) {
            window.location.href = redirectLink;
        } else {
            fetchNotifications(); // Reload list
        }
    } catch (error) {
        console.error("Error marking read:", error);
    }
}

// Toggle the dropdown menu
function toggleNotifications() {
    const dropdown = document.getElementById('notif-dropdown');
    if (dropdown) dropdown.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('notif-dropdown');
    const bellIcon = document.getElementById('notif-bell');
    
    if (bellIcon && dropdown && !bellIcon.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Load on page start
document.addEventListener('DOMContentLoaded', fetchNotifications);
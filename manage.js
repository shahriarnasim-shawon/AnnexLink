const token = localStorage.getItem('annexlink_token');
if (!token) window.location.href = "index.html";

// Load Navbar Avatar instantly
const currentUserStr = localStorage.getItem('annexlink_user');
if (currentUserStr) {
    const currentUser = JSON.parse(currentUserStr);
    const avatarUrl = (!currentUser.avatar || currentUser.avatar === "default-avatar.png") 
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=0A192F&color=fff` 
        : (currentUser.avatar.startsWith('http') ? currentUser.avatar : `http://localhost:8000${currentUser.avatar}`);
    
    const navAvatar = document.querySelector('.nav-right .avatar');
    if (navAvatar) navAvatar.src = avatarUrl;
}

// Determine which page we are currently on
const isMyServicesPage = window.location.pathname.includes('my-services.html');
const isMyRequestsPage = window.location.pathname.includes('my-requests.html');

async function loadMyPosts() {
    try {
        const response = await fetch('http://localhost:8000/api/posts/mine', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const myPosts = await response.json();
            
            // Filter posts based on the page we are on
            if (isMyServicesPage) {
                const services = myPosts.filter(post => post.type === 'Service');
                renderManageCards(services, 'Service');
            } else if (isMyRequestsPage) {
                const requests = myPosts.filter(post => post.type === 'Hiring' || post.type === 'Request');
                renderManageCards(requests, 'Request');
            }
        }
    } catch (error) {
        console.error("Error loading posts:", error);
    }
}

function timeSince(dateString) {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return "Just now";
}

async function deleteMyPost(postId) {
    if(!confirm("Are you sure you want to delete this post forever?")) return;
    try {
        const response = await fetch(`http://localhost:8000/api/posts/${postId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) loadMyPosts(); // Reload page to remove deleted post
    } catch (error) {
        console.error(error);
    }
}

function renderManageCards(posts, pageType) {
    const mainContent = document.querySelector('.management-content');
    
    // Keep the header, remove the hardcoded cards
    const headerHTML = mainContent.querySelector('.page-header').outerHTML;
    mainContent.innerHTML = headerHTML; 

    if (posts.length === 0) {
        mainContent.innerHTML += `<p style="text-align:center; color:gray; margin-top:2rem;">You don't have any active ${pageType.toLowerCase()}s right now.</p>`;
        return;
    }

    posts.forEach(post => {
        const tagsHTML = post.tags.map(tag => `${tag}`).join(', ');
        const cardClass = pageType === 'Request' ? 'manage-card request' : 'manage-card';

        const cardHTML = `
            <div class="${cardClass}">
                <div class="manage-card-header">
                    <h3 class="manage-card-title">${post.title}</h3>
                    <span class="status-badge status-${post.status.toLowerCase()}">${post.status}</span>
                </div>
                <p class="post-desc">${post.description}</p>
                
                <div class="manage-meta">
                    <div><i class="fas fa-tag"></i> ${tagsHTML || 'No tags'}</div>
                    <div><i class="fas fa-money-bill-wave"></i> ${post.price || 'Negotiable'}</div>
                    <div><i class="fas fa-clock"></i> Posted ${timeSince(post.createdAt)}</div>
                </div>

                <div class="manage-actions">
                    <button class="btn btn-primary" onclick="window.location.href='chat.html'">
                        <i class="fas fa-envelope"></i> Check Messages
                    </button>
                    <button class="btn-small btn-delete" style="margin-left: auto;" onclick="deleteMyPost('${post._id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        mainContent.innerHTML += cardHTML;
    });
}

// Start sequence
document.addEventListener('DOMContentLoaded', loadMyPosts);
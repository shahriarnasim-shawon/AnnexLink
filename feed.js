// --- 1. Authentication Check ---
const token = localStorage.getItem('annexlink_token');
const userStr = localStorage.getItem('annexlink_user');

// If no token exists, redirect back to login page
if (!token || !userStr) {
    window.location.href = "index.html";
}

const currentUser = JSON.parse(userStr);

// Set current user's avatar in the UI
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('current-user-avatar').src = currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}&background=0A192F&color=fff`;
    fetchFeed(); // Load feed when page loads
});

// --- 2. Post Creation Logic ---
document.getElementById('create-post-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent page reload

    // Gather data from the form
    const title = document.getElementById('post-title').value;
    const type = document.getElementById('post-type').value;
    const description = document.getElementById('post-desc').value;
    const tagsString = document.getElementById('post-tags').value;
    const price = document.getElementById('post-price').value;

    const tagsArray = tagsString.split(',').map(tag => tag.trim()).filter(tag => tag !== "");

    try {
        const response = await fetch('http://localhost:8000/api/posts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` // Provide our digital ID card
            },
            body: JSON.stringify({
                title,
                description,
                type,
                tags: tagsArray,
                price
            })
        });

        if (response.ok) {
            // Clear form
            document.getElementById('create-post-form').reset();
            // Refresh feed to show new post
            fetchFeed();
        } else {
            const data = await response.json();
            alert('Failed to create post: ' + data.message);
        }
    } catch (error) {
        console.error('Error creating post:', error);
    }
});

// --- 3. Fetch & Render Feed Logic ---
async function fetchFeed() {
    try {
        const response = await fetch('http://localhost:8000/api/posts', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const posts = await response.json();
            renderFeed(posts);
        } else if (response.status === 401) {
            // Token expired or invalid
            logout();
        }
    } catch (error) {
        console.error('Error fetching feed:', error);
    }
}

function getPostTypeConfig(type) {
    switch(type) {
        case 'Service': return { badgeClass: 'badge-service', primaryBtn: 'Hire Now' };
        case 'Hiring': return { badgeClass: 'badge-hiring', primaryBtn: 'Apply' };
        case 'Request': return { badgeClass: 'badge-request', primaryBtn: 'Offer Help' };
        default: return { badgeClass: 'badge-service', primaryBtn: 'View' };
    }
}

// Function to calculate "time ago"
function timeSince(dateString) {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
}

function renderFeed(posts) {
    const feedContainer = document.getElementById('annex-feed');
    feedContainer.innerHTML = ''; // Clear existing content

    if (posts.length === 0) {
        feedContainer.innerHTML = '<p style="text-align:center; color: var(--text-muted); margin-top: 2rem;">No posts available right now. Be the first to post!</p>';
        return;
    }

    posts.forEach(post => {
        const config = getPostTypeConfig(post.type);
        const tagsHTML = post.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        // Safety check if user was deleted but post remains
        const creatorName = post.createdBy ? post.createdBy.name : 'Unknown User';
        const creatorAvatar = post.createdBy ? post.createdBy.avatar : 'https://ui-avatars.com/api/?name=Unknown&background=777&color=fff';
        const creatorRating = post.createdBy ? post.createdBy.rating.toFixed(1) : 'New';

        const postElement = document.createElement('div');
        postElement.classList.add('post-card');
        
        postElement.innerHTML = `
            <div class="post-header">
                <div class="user-info">
                    <img src="${creatorAvatar.startsWith('http') ? creatorAvatar : `https://ui-avatars.com/api/?name=${creatorName}&background=0A192F&color=fff`}" alt="${creatorName}" class="avatar">
                    <div>
                        <h4>${creatorName} <span class="text-sm">⭐ ${creatorRating}</span></h4>
                        <p class="text-sm">${timeSince(post.createdAt)}</p>
                    </div>
                </div>
                <span class="post-badge ${config.badgeClass}">${post.type}</span>
            </div>
            
            <h3 class="post-title">${post.title}</h3>
            <p class="post-desc">${post.description}</p>
            
            <div class="tags">
                ${tagsHTML}
            </div>
            
            <div class="post-footer">
                <div class="post-price">${post.price || 'Negotiable'}</div>
                <div class="post-actions">
                    <button class="btn btn-outline"><i class="far fa-bookmark"></i> Save</button>
                    <button class="btn btn-secondary"><i class="far fa-comment-dots"></i> Message</button>
                    <button class="btn btn-primary">${config.primaryBtn}</button>
                </div>
            </div>
        `;

        feedContainer.appendChild(postElement);
    });
}

// --- 4. Logout Logic ---
function logout() {
    localStorage.removeItem('annexlink_token');
    localStorage.removeItem('annexlink_user');
    window.location.href = "index.html";
}

// Attach logout function to the logout link in the sidebar
document.querySelector('a[href="index.html"]').addEventListener('click', (e) => {
    e.preventDefault();
    logout();
});
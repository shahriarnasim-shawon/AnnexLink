// --- 1. Authentication Check & Setup ---
const token = localStorage.getItem('annexlink_token');
let userStr = localStorage.getItem('annexlink_user');

// If no token exists, instantly redirect back to login page
if (!token || !userStr) {
    window.location.href = "index.html";
}

let currentUser = JSON.parse(userStr);

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Fix the Avatar URL to include localhost if it's an uploaded file
    const avatarUrl = (!currentUser.avatar || currentUser.avatar === "default-avatar.png") 
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=0A192F&color=fff` 
        : (currentUser.avatar.startsWith('http') ? currentUser.avatar : `http://localhost:8000${currentUser.avatar}`);
    
    // 2. Set the "Create Post" box avatar
    const currentUserImg = document.getElementById('current-user-avatar');
    if (currentUserImg) currentUserImg.src = avatarUrl;
    
    // 3. Set the Top Navbar avatar
    const navAvatar = document.querySelector('.nav-right .avatar');
    if (navAvatar) navAvatar.src = avatarUrl;

    // 4. Check if we arrived here from "Add New Service" or "New Request" buttons
    const urlParams = new URLSearchParams(window.location.search);
    const postType = urlParams.get('type');
    if (postType) {
        const typeDropdown = document.getElementById('post-type');
        if (typeDropdown) {
            typeDropdown.value = postType; // Auto-select Service or Request
            document.getElementById('post-title').focus(); // Jump to the input box
        }
    }

    // 5. Load dynamic content
    loadDynamicSidebars();
    fetchFeed(); 
});


// --- 2. Dynamic Sidebar (Trending / Top Students) ---
async function loadDynamicSidebars() {
    try {
        const userRes = await fetch('http://localhost:8000/api/users/top', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (userRes.ok) {
            const topUsers = await userRes.json();
            const topUsersList = document.querySelector('.widget-list'); // "Suggested Services" ul
            
            if (topUsersList) {
                topUsersList.innerHTML = '';
                topUsers.forEach(user => {
                    topUsersList.innerHTML += `
                        <li style="cursor:pointer;" onclick="window.location.href='user-profile.html?id=${user._id}'">
                            <div>
                                <strong style="color:var(--primary-navy);">${user.name}</strong>
                                <p class="text-sm">${user.department || 'BUP'}</p>
                            </div>
                            <span class="text-sm">⭐ ${user.rating > 0 ? user.rating.toFixed(1) : 'New'}</span>
                        </li>`;
                });
            }
        }
    } catch (err) { console.error("Error loading sidebars", err); }
}


// --- 3. Post Creation Logic (With Media Upload) ---
document.getElementById('create-post-form').addEventListener('submit', async (e) => {
    e.preventDefault(); 

    // Create a FormData object to handle text AND files
    const formData = new FormData();
    formData.append('title', document.getElementById('post-title').value);
    formData.append('type', document.getElementById('post-type').value);
    formData.append('description', document.getElementById('post-desc').value);
    formData.append('tags', document.getElementById('post-tags').value);
    formData.append('price', document.getElementById('post-price').value);

    // Grab the file if one was selected by the user
    const fileInput = document.getElementById('post-media');
    if (fileInput && fileInput.files[0]) {
        formData.append('media', fileInput.files[0]);
    }

    try {
        const response = await fetch('http://localhost:8000/api/posts', {
            method: 'POST',
            headers: {
                // DO NOT set 'Content-Type' when using FormData. The browser handles it!
                'Authorization': `Bearer ${token}` 
            },
            body: formData
        });

        if (response.ok) {
            document.getElementById('create-post-form').reset();
            const fileNameDisplay = document.getElementById('file-name-display');
            if(fileNameDisplay) fileNameDisplay.innerText = ""; 
            
            fetchFeed(); // Refresh feed to show the brand new post
        } else {
            const data = await response.json();
            alert('Failed to create post: ' + data.message);
        }
    } catch (error) {
        console.error('Error creating post:', error);
    }
});


// --- 4. Fetch & Render Feed Logic ---
async function fetchFeed() {
    try {
        // Also refresh current user data (to get up-to-date saved posts array)
        const userRes = await fetch('http://localhost:8000/api/users/profile', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(userRes.ok) {
            const userData = await userRes.json();
            currentUser = userData.user; // Update local variable
            localStorage.setItem('annexlink_user', JSON.stringify(currentUser)); // Update storage
        }

        const response = await fetch('http://localhost:8000/api/posts', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const posts = await response.json();
            renderFeed(posts);
        } else if (response.status === 401) {
            logout();
        }
    } catch (error) {
        console.error('Error fetching feed:', error);
    }
}

// Helper: Determine button text and colors based on Post Type
function getPostTypeConfig(type) {
    switch(type) {
        case 'Service': return { badgeClass: 'badge-service', primaryBtn: 'Hire Now' };
        case 'Hiring': return { badgeClass: 'badge-hiring', primaryBtn: 'Apply' };
        case 'Request': return { badgeClass: 'badge-request', primaryBtn: 'Offer Help' };
        default: return { badgeClass: 'badge-service', primaryBtn: 'View' };
    }
}

// Helper: Convert timestamp to "X minutes ago"
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
    return "Just now";
}

// Function to generate HTML for the feed
function renderFeed(posts) {
    const feedContainer = document.getElementById('annex-feed');
    feedContainer.innerHTML = ''; 

    if (posts.length === 0) {
        feedContainer.innerHTML = '<p style="text-align:center; color: var(--text-muted); margin-top: 2rem;">No posts available right now. Be the first to post!</p>';
        return;
    }

    posts.forEach(post => {
        const config = getPostTypeConfig(post.type);
        const tagsHTML = post.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        // Bulletproof Avatar Logic
        const creatorName = post.createdBy ? post.createdBy.name : 'Unknown User';
        const dbAvatar = post.createdBy && post.createdBy.avatar ? post.createdBy.avatar : 'default-avatar.png';
        const creatorAvatar = (dbAvatar === 'default-avatar.png') 
            ? `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorName)}&background=0A192F&color=fff` 
            : (dbAvatar.startsWith('http') ? dbAvatar : `http://localhost:8000${dbAvatar}`);
            
        const creatorRating = post.createdBy && post.createdBy.rating > 0 ? post.createdBy.rating.toFixed(1) : 'New';

        // Bulletproof Media Logic (Image vs Video)
        let mediaUrl = '';
        if (post.media && post.media.trim() !== "") {
            let cleanPath = post.media.replace(/\\/g, '/'); 
            mediaUrl = cleanPath.startsWith('/') 
                ? `http://localhost:8000${cleanPath}` 
                : `http://localhost:8000/${cleanPath}`;
        }

        let mediaHTML = '';
        if (mediaUrl) {
            const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
            const isVideo = videoExtensions.some(ext => mediaUrl.toLowerCase().endsWith(ext));

            if (isVideo) {
                mediaHTML = `
                    <video controls style="width: 100%; max-height: 400px; border-radius: 12px; margin-bottom: 1rem; border: 1px solid var(--border-color); background: #000;">
                        <source src="${mediaUrl}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>`;
            } else {
                mediaHTML = `<img src="${mediaUrl}" alt="Post Media" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 12px; margin-bottom: 1rem; border: 1px solid var(--border-color);">`;
            }
        }

        // Check if the current user has saved this post
        const isSaved = currentUser.savedPosts && currentUser.savedPosts.includes(post._id);
        const bookmarkIcon = isSaved ? 'fas fa-bookmark' : 'far fa-bookmark';

        const postElement = document.createElement('div');
        postElement.classList.add('post-card');
        
        postElement.innerHTML = `
            <div class="post-header">
                <div class="user-info">
                    <img src="${creatorAvatar}" alt="${creatorName}" class="avatar" style="object-fit: cover;">
                    <div>
                        <h4><a href="user-profile.html?id=${post.createdBy ? post.createdBy._id : ''}" style="color:var(--primary-navy);">${creatorName}</a> <span class="text-sm">⭐ ${creatorRating}</span></h4>
                        <p class="text-sm">${timeSince(post.createdAt)}</p>
                    </div>
                </div>
                <span class="post-badge ${config.badgeClass}">${post.type}</span>
            </div>
            
            <h3 class="post-title">${post.title}</h3>
            <p class="post-desc">${post.description}</p>
            
            ${mediaHTML}
            
            <div class="tags">
                ${tagsHTML}
            </div>
            
            <div class="post-footer">
                <div class="post-price">${post.price || 'Negotiable'}</div>
                <div class="post-actions">
                    <button class="btn btn-outline" onclick="savePost('${post._id}', this)"><i class="${bookmarkIcon}"></i> Save</button>
                    
                    ${post.createdBy && post.createdBy._id !== currentUser._id ? 
                        `<button class="btn btn-secondary" onclick="window.location.href='chat.html?userId=${post.createdBy._id}'"><i class="far fa-comment-dots"></i> Message</button>
                         <button class="btn btn-primary" onclick="window.location.href='checkout.html?postId=${post._id}'">${config.primaryBtn}</button>` 
                        : ''}

                    ${post.createdBy && post.createdBy._id === currentUser._id ? 
                        `<button class="btn btn-outline" style="color: #E63946; border-color: #E63946;" onclick="deletePost('${post._id}')"><i class="fas fa-trash"></i> Delete</button>` 
                        : ''}
                </div>
            </div>
        `;

        feedContainer.appendChild(postElement);
    });
}


// --- 5. Save & Delete Logic ---
async function savePost(postId, btnElement) {
    try {
        const res = await fetch(`http://localhost:8000/api/users/save-post/${postId}`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const data = await res.json();
            currentUser.savedPosts = data.savedPosts; // Update local memory
            localStorage.setItem('annexlink_user', JSON.stringify(currentUser)); // Save to storage

            const icon = btnElement.querySelector('i');
            if (icon.classList.contains('far')) {
                icon.className = 'fas fa-bookmark'; // Saved
            } else {
                icon.className = 'far fa-bookmark'; // Unsaved
            }
        }
    } catch (e) { console.error(e); }
}

async function deletePost(postId) {
    if(!confirm("Are you sure you want to delete this post?")) return;
    try {
        const response = await fetch(`http://localhost:8000/api/posts/${postId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) fetchFeed(); 
        else alert("Failed to delete post");
    } catch (error) { console.error(error); }
}


// --- 6. Logout Logic ---
function logout() {
    localStorage.clear();
    window.location.href = "index.html";
}

const logoutBtn = document.querySelector('a[href="index.html"]');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault(); 
        logout();
    });
}
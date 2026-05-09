// --- 1. Authentication Check & Setup ---
const token = localStorage.getItem('annexlink_token');
const userStr = localStorage.getItem('annexlink_user');

// If no token exists, instantly redirect back to login page
if (!token || !userStr) {
    window.location.href = "index.html";
}

const currentUser = JSON.parse(userStr);

// Set current user's avatar in the UI when page loads
// Set current user's avatar in the UI
document.addEventListener('DOMContentLoaded', () => {
    const avatarUrl = currentUser.avatar || `https://ui-avatars.com/api/?name=${currentUser.name}&background=0A192F&color=fff`;
    
    // Set the "Create Post" box avatar
    document.getElementById('current-user-avatar').src = avatarUrl;
    
    // Set the Top Navbar avatar (Selects the last image in the nav-right div)
    const navAvatar = document.querySelector('.nav-right .avatar');
    if(navAvatar) navAvatar.src = avatarUrl;

    fetchFeed(); // Load feed when page loads
});

// --- 2. Post Creation Logic (Now with Image Support) ---
document.getElementById('create-post-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Prevent default page reload

    // Create a FormData object to handle text AND files
    const formData = new FormData();
    formData.append('title', document.getElementById('post-title').value);
    formData.append('type', document.getElementById('post-type').value);
    formData.append('description', document.getElementById('post-desc').value);
    formData.append('tags', document.getElementById('post-tags').value);
    formData.append('price', document.getElementById('post-price').value);

    // Grab the file if one was selected by the user
    const fileInput = document.getElementById('post-media');
    if (fileInput.files[0]) {
        formData.append('media', fileInput.files[0]);
    }

    try {
        const response = await fetch('http://localhost:8000/api/posts', {
            method: 'POST',
            headers: {
                // Notice: We DO NOT set 'Content-Type' when using FormData. The browser handles it!
                'Authorization': `Bearer ${token}` 
            },
            body: formData
        });

        if (response.ok) {
            // Success! Clear form
            document.getElementById('create-post-form').reset();
            document.getElementById('file-name-display').innerText = ""; // Clear attached file text
            
            // Refresh feed to show the brand new post at the top
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
            // Token expired or invalid, log them out
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
    return Math.floor(seconds) + " seconds ago";
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
        
        // Generate tag spans
        const tagsHTML = post.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        // Fallbacks in case user was deleted but their post remained
        const creatorName = post.createdBy ? post.createdBy.name : 'Unknown User';
        const creatorAvatar = post.createdBy ? post.createdBy.avatar : 'https://ui-avatars.com/api/?name=Unknown&background=777&color=fff';
        const creatorRating = post.createdBy && post.createdBy.rating > 0 ? post.createdBy.rating.toFixed(1) : 'New';

        // Display media if the post has an image/video attached
       // Clean the URL so there are no double slashes
// Clean the URL: Replace any Windows backslashes with forward slashes
        // Clean the URL: Replace any Windows backslashes with forward slashes
        let mediaUrl = '';
        if (post.media && post.media.trim() !== "") {
            let cleanPath = post.media.replace(/\\/g, '/'); 
            
            mediaUrl = cleanPath.startsWith('/') 
                ? `http://localhost:8000${cleanPath}` 
                : `http://localhost:8000/${cleanPath}`;
        }

        // Determine if it's a video or image based on file extension
        let mediaHTML = '';
        if (mediaUrl) {
            const videoExtensions =['.mp4', '.webm', '.ogg', '.mov'];
            const isVideo = videoExtensions.some(ext => mediaUrl.toLowerCase().endsWith(ext));

            if (isVideo) {
                // Return a Video Player
                mediaHTML = `
                    <video controls style="width: 100%; max-height: 400px; border-radius: 12px; margin-bottom: 1rem; border: 1px solid var(--border-color); background: #000;">
                        <source src="${mediaUrl}" type="video/mp4">
                        Your browser does not support the video tag.
                    </video>`;
            } else {
                // Return an Image
                mediaHTML = `<img src="${mediaUrl}" alt="Post Media" style="width: 100%; max-height: 400px; object-fit: cover; border-radius: 12px; margin-bottom: 1rem; border: 1px solid var(--border-color);">`;
            }
        }
        const postElement = document.createElement('div');
        postElement.classList.add('post-card');
        
        postElement.innerHTML = `
            <div class="post-header">
                <div class="user-info">
                    <img src="${creatorAvatar.startsWith('http') ? creatorAvatar : `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorName)}&background=0A192F&color=fff`}" alt="${creatorName}" class="avatar">
                    <div>
                        <h4>${creatorName} <span class="text-sm">⭐ ${creatorRating}</span></h4>
                        <p class="text-sm">${timeSince(post.createdAt)}</p>
                    </div>
                </div>
                <span class="post-badge ${config.badgeClass}">${post.type}</span>
            </div>
            
            <h3 class="post-title">${post.title}</h3>
            <p class="post-desc">${post.description}</p>
            
            ${mediaHTML} <!-- INJECTS THE IMAGE HERE -->
            
            <div class="tags">
                ${tagsHTML}
            </div>
            
            <div class="post-footer">
                <div class="post-price">${post.price || 'Negotiable'}</div>
                <div class="post-actions">
                    <button class="btn btn-outline"><i class="far fa-bookmark"></i> Save</button>
                    
                    <!-- Smart Message Button (Hides if it's your own post) -->
                    ${post.createdBy._id !== currentUser._id ? 
                        `<button class="btn btn-secondary" onclick="window.location.href='chat.html?userId=${post.createdBy._id}'"><i class="far fa-comment-dots"></i> Message</button>` 
                        : ''}
                    
                    <!-- Apply/Hire Button -->
                    ${post.createdBy._id !== currentUser._id ? 
                        `<button class="btn btn-primary">${config.primaryBtn}</button>` 
                        : ''}

                    <!-- Delete Button (ONLY shows if you own the post) -->
                    ${post.createdBy._id === currentUser._id ? 
                        `<button class="btn btn-outline" style="color: #E63946; border-color: #E63946;" onclick="deletePost('${post._id}')"><i class="fas fa-trash"></i> Delete</button>` 
                        : ''}
                </div>
            </div>
        `;

        feedContainer.appendChild(postElement);
    });
}

// --- 4. Logout Logic ---
function logout() {
    // Clear localStorage
    localStorage.removeItem('annexlink_token');
    localStorage.removeItem('annexlink_user');
    
    // Redirect to login
    window.location.href = "index.html";
}

// Attach logout function to the logout link in the sidebar
const logoutBtn = document.querySelector('a[href="index.html"]');
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Stop normal link behavior
        logout();
    });
}

async function deletePost(postId) {
    if(!confirm("Are you sure you want to delete this post?")) return;

    try {
        const response = await fetch(`http://localhost:8000/api/posts/${postId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            fetchFeed(); // Reload feed so the post vanishes
        } else {
            alert("Failed to delete post");
        }
    } catch (error) {
        console.error(error);
    }
}
const token = localStorage.getItem('annexlink_token');
const currentUser = JSON.parse(localStorage.getItem('annexlink_user'));

if (!token) window.location.href = "index.html";

// Get the user ID from the URL (e.g., user-profile.html?id=12345)
const urlParams = new URLSearchParams(window.location.search);
const targetUserId = urlParams.get('id');

// If no ID is provided, or the user clicks their own name, redirect to personal profile
if (!targetUserId || targetUserId === currentUser._id) {
    window.location.href = "profile.html";
}

document.addEventListener('DOMContentLoaded', () => {
    // Set my own navbar avatar
    const myAvatarUrl = (!currentUser.avatar || currentUser.avatar === "default-avatar.png") 
        ? `https://ui-avatars.com/api/?name=${currentUser.name}&background=0A192F&color=fff` 
        : (currentUser.avatar.startsWith('http') ? currentUser.avatar : `http://localhost:8000${currentUser.avatar}`);
    document.getElementById('nav-avatar').src = myAvatarUrl;

    loadPublicProfile();
});

// Fetch Profile and Reviews from Database
async function loadPublicProfile() {
    try {
        const response = await fetch(`http://localhost:8000/api/users/${targetUserId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            renderPublicProfile(data.user);
             renderPublicPosts(data.posts);
            renderReviews(data.reviews);
        } else {
            alert("User not found!");
            window.location.href = "feed.html";
        }
    } catch (error) {
        console.error("Error fetching public profile:", error);
    }
}

function renderPublicProfile(user) {
    document.getElementById('public-name').innerText = user.name;
    document.getElementById('public-meta').innerText = `${user.department} • Batch ${user.batch}`;
    document.getElementById('public-bio').innerText = user.bio || "This user hasn't added a bio yet.";
    document.getElementById('public-rating').innerText = `⭐ ${user.rating > 0 ? user.rating.toFixed(1) : 'New'}`;
    document.getElementById('public-reviews-count').innerText = user.numReviews || 0;

    const avatarUrl = (!user.avatar || user.avatar === "default-avatar.png") 
        ? `https://ui-avatars.com/api/?name=${user.name}&background=0A192F&color=fff` 
        : (user.avatar.startsWith('http') ? user.avatar : `http://localhost:8000${user.avatar}`);
    document.getElementById('public-avatar').src = avatarUrl;

    // Skills
    const skillsContainer = document.getElementById('public-skills');
    skillsContainer.innerHTML = '';
    if (user.skills && user.skills.length > 0) {
        user.skills.forEach(skill => {
            skillsContainer.innerHTML += `<span class="tag">${skill}</span>`;
        });
    }

    // Set Message Button
    document.getElementById('message-user-btn').onclick = () => {
        window.location.href = `chat.html?userId=${user._id}`;
    };
}

function renderReviews(reviews) {
    const list = document.getElementById('reviews-list');
    list.innerHTML = '';

    if (reviews.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:gray;">No reviews yet. Be the first to leave one!</p>';
        return;
    }

    reviews.forEach(review => {
        const rName = review.reviewer ? review.reviewer.name : "Deleted User";
        const rAvatar = review.reviewer ? (review.reviewer.avatar.startsWith('http') ? review.reviewer.avatar : `http://localhost:8000${review.reviewer.avatar}`) : `https://ui-avatars.com/api/?name=U`;
        
        let stars = '';
        for(let i=0; i<review.rating; i++) stars += '⭐';

        list.innerHTML += `
            <div class="review-card card" style="margin-bottom: 1rem;">
                <div class="review-header" style="display:flex; justify-content:space-between;">
                    <div style="display:flex; gap:1rem; align-items:center;">
                        <img src="${rAvatar}" class="avatar" style="width:30px; height:30px;">
                        <strong>${rName}</strong>
                    </div>
                    <span>${stars}</span>
                </div>
                <p style="margin-top: 0.5rem; color: var(--text-muted);">${review.comment}</p>
            </div>
        `;
    });
}

// Handle Submitting a New Review
document.getElementById('review-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get the checked star rating value
    const ratingElement = document.querySelector('input[name="rating"]:checked');
    if (!ratingElement) return alert("Please select a star rating!");
    const rating = ratingElement.value;
    const comment = document.getElementById('review-comment').value;

    try {
        const response = await fetch(`http://localhost:8000/api/users/${targetUserId}/reviews`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ rating, comment })
        });

        const data = await response.json();
        
        if (response.ok) {
            alert("Review submitted successfully!");
            loadPublicProfile(); // Reload page to show new review
            document.getElementById('review-form').reset();
        } else {
            alert(data.message); // Will show "Cannot review yourself" or "Already reviewed"
        }
    } catch (error) {
        console.error("Error posting review:", error);
    }
});

// Logout
document.getElementById('logout-btn').addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = "index.html";
});

async function submitReport() {
    const reason = prompt("Why are you reporting this user? (Spam, Scam, Inappropriate Behavior)");
    if (!reason) return;

    try {
        const response = await fetch(`http://localhost:8000/api/users/${targetUserId}/report`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ reason })
        });
        if (response.ok) {
            alert("User reported successfully. Admins will review this.");
        } else {
            const data = await response.json();
            alert(data.message);
        }
    } catch (error) {
        console.error(error);
    }
}
function renderPublicPosts(posts) {
    const list = document.getElementById('public-posts-list');
    list.innerHTML = '';

    if (posts.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:gray;">This user has no active posts.</p>';
        return;
    }

    posts.forEach(post => {
        const typeColor = post.type === 'Service' ? 'var(--accent-teal)' : 'var(--accent-orange)';
        const tagsHTML = post.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
        
        let mediaHTML = '';
        if (post.media) {
            const cleanPath = post.media.replace(/\\/g, '/');
            const mediaUrl = cleanPath.startsWith('/') ? `http://localhost:8000${cleanPath}` : `http://localhost:8000/${cleanPath}`;
            const isVideo = ['.mp4', '.webm', '.mov'].some(ext => mediaUrl.toLowerCase().endsWith(ext));
            mediaHTML = isVideo 
                ? `<video controls style="width: 100%; max-height: 300px; border-radius: 8px; margin-bottom: 1rem;"><source src="${mediaUrl}" type="video/mp4"></video>`
                : `<img src="${mediaUrl}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem;">`;
        }

        list.innerHTML += `
            <div class="card" style="margin-bottom: 1.5rem; border: 1px solid var(--border-color);">
                <div style="display:flex; justify-content:space-between; margin-bottom: 1rem;">
                    <h3 style="color:var(--primary-navy); margin-bottom: 0;">${post.title}</h3>
                    <span class="status-badge" style="background: rgba(32, 178, 170, 0.1); color: ${typeColor};">${post.type}</span>
                </div>
                <p style="margin-bottom: 1rem; color: var(--text-muted);">${post.description}</p>
                ${mediaHTML}
                <div class="tags">${tagsHTML}</div>
                
                <div class="post-footer" style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1rem; margin-top: 1rem;">
                    <div style="font-weight: bold; color: var(--accent-orange); font-size: 1.2rem;">${post.price || 'Negotiable'}</div>
                    <div class="post-actions" style="display: flex; gap: 0.8rem;">
                        <button class="btn btn-primary" onclick="window.location.href='checkout.html?postId=${post._id}'">Hire Now</button>
                    </div>
                </div>
            </div>
        `;
    });
}
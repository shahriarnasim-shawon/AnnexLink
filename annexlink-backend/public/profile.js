//Authentication Check
const token = localStorage.getItem('annexlink_token');
const currentUserStr = localStorage.getItem('annexlink_user');

if (!token || !currentUserStr) {
    window.location.href = "index.html";
}

const currentUser = JSON.parse(currentUserStr);

//Load Navbar Avatar instantly
document.addEventListener('DOMContentLoaded', () => {
    const avatarUrl = (!currentUser.avatar || currentUser.avatar === "default-avatar.png") 
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=0A192F&color=fff` 
        : (currentUser.avatar.startsWith('http') ? currentUser.avatar : `${currentUser.avatar}`);
    
    const navAvatar = document.querySelector('.nav-right .avatar');
    if (navAvatar) navAvatar.src = avatarUrl;

    loadProfile();
});

//Load Profile Data & Reviews
async function loadProfile() {
    try {
        const response = await fetch('/api/users/profile', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            renderProfile(data.user);
            renderMyReviews(data.reviews); 
            fetchMyActivePostsCount(); // Fetch active posts for the 3rd stat block!
        } else {
            console.error("Failed to load profile");
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
    }
}

//Fetch Active Posts Count
async function fetchMyActivePostsCount() {
    try {
        const response = await fetch('/api/posts/mine', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            const myPosts = await response.json();
            const activeCount = myPosts.filter(p => p.status === 'Active').length;
            const servicesEl = document.getElementById('profile-services');
            if (servicesEl) servicesEl.innerText = activeCount;
        }
    } catch (error) { console.error(error); }
}

//Render Profile to the Screen
function renderProfile(user) {
    // 1. Set text fields with Safety Fallbacks ('N/A' if missing)
    document.getElementById('profile-name').innerText = user.name || "Unknown User";
    
    const dept = user.department || "N/A";
    const batch = user.batch || "N/A";
    document.getElementById('profile-meta').innerText = `${dept} • Batch ${batch} • ${user.email}`;
    
    document.getElementById('profile-bio').innerText = user.bio || "Hello! I am a student at BUP.";
    
    // 2. Set stats
    document.getElementById('profile-rating').innerText = `⭐ ${user.rating > 0 ? user.rating.toFixed(1) : 'New'}`;
    document.getElementById('profile-reviews').innerText = user.numReviews || 0;
    
    // 3. Set avatar
    const avatarUrl = (!user.avatar || user.avatar === "default-avatar.png") 
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0A192F&color=fff` 
        : (user.avatar.startsWith('http') ? user.avatar : `${user.avatar}`);
    
    document.getElementById('profile-avatar').src = avatarUrl;

    // 4. Render Skills
    const skillsContainer = document.getElementById('profile-skills');
    skillsContainer.innerHTML = ''; 
    if (user.skills && user.skills.length > 0) {
        user.skills.forEach(skill => {
            skillsContainer.innerHTML += `<span class="tag">${skill}</span>`;
        });
    } else {
        skillsContainer.innerHTML = `<span class="text-sm">No skills added yet.</span>`;
    }

    // 5. Pre-fill the edit form with current data
    document.getElementById('edit-bio').value = user.bio || "";
    document.getElementById('edit-skills').value = user.skills ? user.skills.join(', ') : "";
    //Render Cover Photo
    const coverDiv = document.querySelector('.profile-cover');
    if (user.coverPhoto && user.coverPhoto.trim() !== "") {
        const cleanPath = user.coverPhoto.replace(/\\/g, '/');
        const coverUrl = cleanPath.startsWith('/') ? `${cleanPath}` : `/${cleanPath}`;
        // Set the background to the uploaded image
        coverDiv.style.background = `url('${coverUrl}') center/cover no-repeat`;
    } else {
        // Fallback to the default gradient
        coverDiv.style.background = `linear-gradient(135deg, var(--primary-navy) 0%, var(--accent-teal) 100%)`;
    }
}

//Render Logged-in User's Reviews
function renderMyReviews(reviews) {
    const list = document.getElementById('my-reviews-list');
    if (!list) return;
    
    list.innerHTML = '';

    if (!reviews || reviews.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:gray; margin-top:1rem;">No reviews yet.</p>';
        return;
    }

    reviews.forEach(review => {
        const rName = review.reviewer ? review.reviewer.name : "Deleted User";
        const rAvatarDb = review.reviewer ? review.reviewer.avatar : "default-avatar.png";
        
        // Safe Avatar Rendering
        const rAvatar = (!rAvatarDb || rAvatarDb === 'default-avatar.png') 
            ? `https://ui-avatars.com/api/?name=${encodeURIComponent(rName)}&background=20B2AA&color=fff` 
            : (rAvatarDb.startsWith('http') ? rAvatarDb : `${rAvatarDb}`);
        
        let stars = '⭐'.repeat(Math.round(review.rating));

        list.innerHTML += `
            <div class="review-card card" style="margin-bottom: 1rem; text-align: left;">
                <div class="review-header" style="display:flex; justify-content:space-between;">
                    <div style="display:flex; gap:1rem; align-items:center;">
                        <img src="${rAvatar}" class="avatar" style="width:30px; height:30px; object-fit:cover;">
                        <strong style="color: var(--primary-navy);">${rName}</strong>
                    </div>
                    <span>${stars}</span>
                </div>
                <p style="margin-top: 0.5rem; color: var(--text-muted);">${review.comment}</p>
            </div>
        `;
    });
}

//Toggle Edit Mode UI
function toggleEditMode() {
    const displayMode = document.getElementById('display-mode');
    const editForm = document.getElementById('edit-profile-form');

    if (editForm.classList.contains('hidden')) {
        editForm.classList.remove('hidden');
        displayMode.classList.add('hidden');
    } else {
        editForm.classList.add('hidden');
        displayMode.classList.remove('hidden');
    }
}

//Handle Save Profile Changes
const editForm = document.getElementById('edit-profile-form');
if (editForm) {
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const newBio = document.getElementById('edit-bio').value;
        const newSkillsString = document.getElementById('edit-skills').value;
        
        const avatarInput = document.getElementById('edit-avatar');
        const avatarFile = avatarInput ? avatarInput.files[0] : null;

        const coverInput = document.getElementById('edit-cover');
        const coverFile = coverInput ? coverInput.files[0] : null;

        const newSkillsArray = newSkillsString.split(',').map(s => s.trim()).filter(s => s !== "");

        const formData = new FormData();
        formData.append('bio', newBio);
        formData.append('skills', newSkillsString); // Send as string, backend parses it
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }
        if (coverFile) {
            formData.append('coverPhoto', coverFile); // Append to form data
        }

        try {
            const response = await fetch('/api/users/profile', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                const updatedUser = await response.json();
                
                // Update LocalStorage user info
                currentUser.bio = updatedUser.bio;
                currentUser.skills = updatedUser.skills;
                if(updatedUser.avatar) currentUser.avatar = updatedUser.avatar;
                
                localStorage.setItem('annexlink_user', JSON.stringify(currentUser));

                // Instantly update UI and close form
                renderProfile(updatedUser);
                toggleEditMode();
                
            } else {
                alert("Failed to update profile.");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    });
}
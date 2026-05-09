// --- Authentication Check ---
const token = localStorage.getItem('annexlink_token');
if (!token) {
    window.location.href = "index.html";
}

// --- Load Profile Data ---
async function loadProfile() {
    try {
        const response = await fetch('http://localhost:8000/api/users/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const user = await response.json();
            renderProfile(user);
        } else {
            console.error("Failed to load profile");
            localStorage.clear();
            window.location.href = "index.html";
        }
    } catch (error) {
        console.error("Error fetching profile:", error);
    }
}

// --- Render Profile to the Screen ---
function renderProfile(user) {
    // 1. Set text fields
    document.getElementById('profile-name').innerText = user.name;
    document.getElementById('profile-meta').innerText = `${user.department} • Batch ${user.batch} • ${user.email}`;
    document.getElementById('profile-bio').innerText = user.bio || "Hello! I am a student at BUP.";
    
    // 2. Set stats
    document.getElementById('profile-rating').innerText = `⭐ ${user.rating > 0 ? user.rating.toFixed(1) : 'New'}`;
    document.getElementById('profile-reviews').innerText = user.numReviews || 0;
    
    // 3. Set avatar
    const avatarUrl = (!user.avatar || user.avatar === "default-avatar.png") 
        ? `https://ui-avatars.com/api/?name=${user.name}&background=0A192F&color=fff` 
        : (user.avatar.startsWith('http') ? user.avatar : `http://localhost:8000${user.avatar}`);
    
    document.getElementById('profile-avatar').src = avatarUrl;
    
    // Set top right navbar avatar as well
    const navAvatar = document.querySelector('.nav-right .avatar');
    if(navAvatar) navAvatar.src = avatarUrl;

    // 4. Render Skills
    const skillsContainer = document.getElementById('profile-skills');
    skillsContainer.innerHTML = ''; // Clear previous
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
}

// --- Toggle Edit Mode UI ---
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

// --- Handle Save Profile Changes ---
// --- Handle Save Profile Changes ---
document.getElementById('edit-profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const newBio = document.getElementById('edit-bio').value;
    const newSkillsString = document.getElementById('edit-skills').value;
    const avatarFile = document.getElementById('edit-avatar').files[0];

    const formData = new FormData();
    formData.append('bio', newBio);
    formData.append('skills', newSkillsString);
    if (avatarFile) {
        formData.append('avatar', avatarFile);
    }

    try {
        const response = await fetch('http://localhost:8000/api/users/profile', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}` // NO Content-Type for FormData
            },
            body: formData
        });

        if (response.ok) {
            const updatedUser = await response.json();
            
            // Update LocalStorage
            localStorage.setItem('annexlink_user', JSON.stringify(updatedUser));

            renderProfile(updatedUser);
            toggleEditMode();
        } else {
            alert("Failed to update profile.");
        }
    } catch (error) {
        console.error("Error updating profile:", error);
    }
});

// Load profile on start
document.addEventListener('DOMContentLoaded', loadProfile);
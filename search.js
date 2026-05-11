const searchInput = document.getElementById('global-search');
const searchDropdown = document.getElementById('search-dropdown');

if (searchInput && searchDropdown) {
    let timeoutId;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(timeoutId);
        const query = e.target.value.trim();

        if (query.length < 2) {
            searchDropdown.style.display = 'none';
            return;
        }

        // Debounce: Wait 300ms after they stop typing to hit the database
        timeoutId = setTimeout(() => performSearch(query), 300);
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
            searchDropdown.style.display = 'none';
        }
    });
}

async function performSearch(query) {
    try {
        const token = localStorage.getItem('annexlink_token');
        const response = await fetch(`http://localhost:8000/api/search?q=${query}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const data = await response.json();
            renderSearchResults(data);
        }
    } catch (error) {
        console.error("Search failed:", error);
    }
}

function renderSearchResults(data) {
    searchDropdown.innerHTML = '';
    
    if (data.users.length === 0 && data.posts.length === 0) {
        searchDropdown.innerHTML = `<div class="search-item text-muted">No results found</div>`;
        searchDropdown.style.display = 'block';
        return;
    }

    // Render Users
    if (data.users.length > 0) {
        searchDropdown.innerHTML += `<div class="search-category">Users</div>`;
        data.users.forEach(user => {
            const avatar = user.avatar.startsWith('http') ? user.avatar : `http://localhost:8000${user.avatar}`;
            searchDropdown.innerHTML += `
                <div class="search-item" onclick="window.location.href='user-profile.html?id=${user._id}'">
                    <img src="${avatar || `https://ui-avatars.com/api/?name=${user.name}`}">
                    <div>
                        <strong>${user.name}</strong> <span class="text-sm">⭐ ${user.rating > 0 ? user.rating.toFixed(1) : 'New'}</span>
                    </div>
                </div>`;
        });
    }

    // Render Posts
    if (data.posts.length > 0) {
        searchDropdown.innerHTML += `<div class="search-category">Posts</div>`;
        data.posts.forEach(post => {
            searchDropdown.innerHTML += `
                <div class="search-item" onclick="window.location.href='user-profile.html?id=${post.createdBy}'">
                    <div>
                        <strong>${post.title}</strong>
                        <div class="text-sm">${post.type} • ${post.price || 'Negotiable'}</div>
                    </div>
                </div>`;
        });
    }

    searchDropdown.style.display = 'block';
}
// Mock Data simulating backend response based on user's interests/skills
const feedData =[
    {
        id: 1,
        user: "Tanjim Ahmed",
        rating: "4.9",
        avatar: "https://ui-avatars.com/api/?name=Tanjim+Ahmed&background=20B2AA&color=fff",
        type: "Service", // Can be Service, Hiring, or Request
        title: "I will build a responsive Full-Stack website",
        description: "Experienced with MERN stack. I can build fast, responsive, and scalable web applications for your final year projects or startups.",
        tags:["Web Dev", "React", "Node.js", "MongoDB"],
        price: "৳ 5,000",
        timePosted: "2 hours ago"
    },
    {
        id: 2,
        user: "Nafisa Yasmin",
        rating: "4.7",
        avatar: "https://ui-avatars.com/api/?name=Nafisa+Yasmin&background=FF8C00&color=fff",
        type: "Hiring",
        title: "Looking for a UI/UX Designer for a Mobile App",
        description: "We are participating in a hackathon and need someone proficient in Figma to design 10-12 screens. Budget is negotiable based on your portfolio.",
        tags:["Figma", "UI/UX", "Mobile Design"],
        price: "৳ 3,000",
        timePosted: "5 hours ago"
    },
    {
        id: 3,
        user: "Samiul Haque",
        rating: "New",
        avatar: "https://ui-avatars.com/api/?name=Samiul+Haque&background=0A192F&color=fff",
        type: "Request",
        title: "Need a tutor for Data Structures & Algorithms",
        description: "Having trouble understanding graph algorithms (Dijkstra, BFS/DFS). Looking for a senior who can sit with me for a few hours before midterms.",
        tags:["Tutoring", "DSA", "Java", "Algorithms"],
        price: "৳ 500/hr",
        timePosted: "1 day ago"
    }
];

// Function to map Post Type to correct CSS classes and button texts
function getPostTypeConfig(type) {
    switch(type) {
        case 'Service':
            return { badgeClass: 'badge-service', primaryBtn: 'Hire Now' };
        case 'Hiring':
            return { badgeClass: 'badge-hiring', primaryBtn: 'Apply' };
        case 'Request':
            return { badgeClass: 'badge-request', primaryBtn: 'Offer Help' };
        default:
            return { badgeClass: 'badge-service', primaryBtn: 'View' };
    }
}

// Function to Render Posts to the DOM
function renderFeed() {
    const feedContainer = document.getElementById('annex-feed');
    feedContainer.innerHTML = ''; // Clear existing content

    feedData.forEach(post => {
        const config = getPostTypeConfig(post.type);

        // Generate Tags HTML
        const tagsHTML = post.tags.map(tag => `<span class="tag">${tag}</span>`).join('');

        // Generate Post HTML
        const postElement = document.createElement('div');
        postElement.classList.add('post-card');
        
        postElement.innerHTML = `
            <div class="post-header">
                <div class="user-info">
                    <img src="${post.avatar}" alt="${post.user}" class="avatar">
                    <div>
                        <h4>${post.user} <span class="text-sm">⭐ ${post.rating}</span></h4>
                        <p class="text-sm">${post.timePosted}</p>
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
                <div class="post-price">${post.price}</div>
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

// Initialize feed rendering when page loads
document.addEventListener('DOMContentLoaded', () => {
    renderFeed();
});
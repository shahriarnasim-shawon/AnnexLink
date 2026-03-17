// Mock Data simulating backend response based on user's interests/skills
const feedData =[
    {
        id: 1,
        user: "Sadman Sakib",
        rating: "4.9",
        avatar: "https://scontent.fdac41-2.fna.fbcdn.net/v/t39.30808-6/588836861_2459723257778800_1979078234014540611_n.jpg?_nc_cat=103&ccb=1-7&_nc_sid=1d70fc&_nc_ohc=iun-7gMk0XgQ7kNvwEFnAfK&_nc_oc=AdlNMJkYIyNLrikOTZZFjvf6nXeEd2hD-JHLoAUA-4Mrz_rLeAUgdiUJX7AX3AmyrvU&_nc_zt=23&_nc_ht=scontent.fdac41-2.fna&_nc_gid=0ho0AKc4iVPEnJi-_3mWyQ&_nc_ss=8&oh=00_Afxy18Oyh2DATHDWPX1rPJfGxDqPK1yEwXYuZ428E3RJrw&oe=69BF7169&background=20B2AA&color=fff",
        type: "Service", // Can be Service, Hiring, or Request
        title: "I will build a responsive Full-Stack website",
        description: "Experienced with MERN stack. I can build fast, responsive, and scalable web applications for your final year projects or startups.",
        tags:["Web Dev", "React", "Node.js", "MongoDB"],
        price: "৳ 5,000",
        timePosted: "2 hours ago"
    },
    {
        id: 2,
        user: "Farzana Hossain Mimi",
        rating: "4.7",
        avatar: "https://scontent.fdac41-2.fna.fbcdn.net/v/t39.30808-6/617084031_1863213697693752_4226638340578951317_n.jpg?_nc_cat=107&ccb=1-7&_nc_sid=1d70fc&_nc_ohc=Ar-gpSvzdnAQ7kNvwFSR0BA&_nc_oc=AdldbA37uXaSMOTVqIw0BHXfFztf9pkj6lEq17DTrEkKaBLn78D_FEg6m4rUGmALkbc&_nc_zt=23&_nc_ht=scontent.fdac41-2.fna&_nc_gid=RGoo90I-ks24fTqfDJmZxg&_nc_ss=8&oh=00_AfyDevqcxFupfG7sMa0bbrm8RiP_Cky-qS36MSXECCvH_Q&oe=69BF6988&background=FF8C00&color=fff",
        type: "Hiring",
        title: "Looking for a UI/UX Designer for a Mobile App",
        description: "We are participating in a hackathon and need someone proficient in Figma to design 10-12 screens. Budget is negotiable based on your portfolio.",
        tags:["Figma", "UI/UX", "Mobile Design"],
        price: "৳ 3,000",
        timePosted: "5 hours ago"
    },
    {
        id: 3,
        user: "Md Shahriar Nasim Shawon",
        rating: "New",
        avatar: "https://scontent.fdac41-1.fna.fbcdn.net/v/t39.30808-6/611655689_4328506937474467_7784609377809409809_n.jpg?_nc_cat=109&ccb=1-7&_nc_sid=1d70fc&_nc_ohc=lVshwKo16m0Q7kNvwEkZECk&_nc_oc=AdmAgOsAZcX_MhaemRnuSoyaX36tz5PZfDgKbCLMS6InrUxq6Gfh7mS1y9JqsTroFLY&_nc_zt=23&_nc_ht=scontent.fdac41-1.fna&_nc_gid=JDC5Kx0iMhYqpIahwNylrA&_nc_ss=8&oh=00_AfwyJG0ByK_jelUI6akcBb75YJngWhGU3pizPNiPm-lYFg&oe=69BF6A6A&background=0A192F&color=fff",
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
const token = localStorage.getItem('annexlink_token');
const userStr = localStorage.getItem('annexlink_user');

if (!token || !userStr) {
    window.location.href = "index.html";
}

const currentUser = JSON.parse(userStr);
let selectedUserId = null;

// --- INITIALIZE SOCKET.IO ---
// Connect to the backend socket server
const socket = io('http://localhost:8000');

socket.on("connect", () => {
    console.log("Connected to Socket.io Server!");
    // Tell the server who we are so it can create our private room
    socket.emit("setup", currentUser._id);
});

// Listen for incoming real-time messages
socket.on("message received", (newMessage) => {
    // If we are currently chatting with the person who sent this message
    if (selectedUserId === newMessage.sender._id) {
        displayMessage(newMessage, 'received');
        scrollToBottom();
    } else {
        // We got a message from someone else while chatting with someone
        alert(`New message from ${newMessage.sender.name}`);
    }
});


// --- LOAD CONTACTS SIDEBAR ---
async function loadContacts() {
    try {
        const response = await fetch('http://localhost:8000/api/users', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const users = await response.json();
        
        const contactsList = document.getElementById('contacts-list');
        contactsList.innerHTML = '';

        users.forEach(user => {
            const avatarUrl = (!user.avatar || user.avatar === "default-avatar.png") 
                ? `https://ui-avatars.com/api/?name=${user.name}&background=0A192F&color=fff` 
                : (user.avatar.startsWith('http') ? user.avatar : `http://localhost:8000${user.avatar}`);

            const userEl = document.createElement('div');
            userEl.className = 'chat-user';
            userEl.dataset.userid = user._id;
            userEl.onclick = () => selectUser(user._id, user.name, avatarUrl, userEl);
            
            userEl.innerHTML = `
                <img src="${avatarUrl}" class="avatar">
                <div class="chat-user-info">
                    <h4>${user.name}</h4>
                    <p class="chat-preview">${user.department} • Batch ${user.batch}</p>
                </div>
            `;
            contactsList.appendChild(userEl);
        });
    } catch (error) {
        console.error("Error loading contacts:", error);
    }
}


// --- SELECT A USER TO CHAT WITH ---
async function selectUser(userId, userName, avatarUrl, element) {
    selectedUserId = userId;

    // Highlight the active user in the sidebar
    document.querySelectorAll('.chat-user').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    // Update Header
    document.getElementById('chat-header-name').innerText = userName;
    document.getElementById('chat-header-avatar').src = avatarUrl;
    document.getElementById('chat-header-status').innerText = 'Online';

    // Enable inputs
    document.getElementById('message-input').disabled = false;
    document.getElementById('send-btn').disabled = false;

    // Fetch Chat History
    await fetchChatHistory(userId);
}


// --- FETCH CHAT HISTORY ---
async function fetchChatHistory(userId) {
    const chatBox = document.getElementById('chat-box');
    chatBox.innerHTML = '<p style="text-align:center; color:gray;">Loading messages...</p>';

    try {
        const response = await fetch(`http://localhost:8000/api/messages/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const messages = await response.json();
        
        chatBox.innerHTML = ''; // Clear loading

        if (messages.length === 0) {
            chatBox.innerHTML = '<p style="text-align:center; color:var(--text-muted); margin-top:2rem;">No messages yet. Say hi!</p>';
            return;
        }

        messages.forEach(msg => {
            // Check if the sender is me or them
            const type = msg.sender._id === currentUser._id ? 'sent' : 'received';
            displayMessage(msg, type);
        });

        scrollToBottom();
    } catch (error) {
        console.error("Error fetching history:", error);
    }
}


// --- SEND A MESSAGE ---
async function sendMessage() {
    const inputField = document.getElementById('message-input');
    const text = inputField.value.trim();

    if (!text || !selectedUserId) return;

    inputField.value = ""; // Clear input immediately for good UX

    try {
        // 1. Save message to Database via REST API
        const response = await fetch('http://localhost:8000/api/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                receiverId: selectedUserId,
                text: text
            })
        });

        if (response.ok) {
            const savedMessage = await response.json();
            
            // 2. Display on our own screen
            displayMessage(savedMessage, 'sent');
            scrollToBottom();

            // 3. Emit via Socket.io to the other person in real-time!
            socket.emit("new message", savedMessage);
        }
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

// Allow Enter key to send
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// --- HELPER FUNCTIONS ---
function displayMessage(msg, type) {
    const chatBox = document.getElementById('chat-box');
    
    // Remove "No messages" text if it exists
    if (chatBox.innerHTML.includes("No messages yet")) {
        chatBox.innerHTML = '';
    }

    // Creating the time string (rewritten to avoid bug)
    const dateObj = new Date(msg.createdAt || Date.now());
    const timeString = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    // Create the HTML div for the message
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    msgDiv.innerHTML = `
        ${msg.text} 
        <span class="message-time">${timeString}</span>
    `;

    chatBox.appendChild(msgDiv);
}

function scrollToBottom() {
    const chatBox = document.getElementById('chat-box');
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Load contacts as soon as the page loads
// Load contacts as soon as the page loads
document.addEventListener('DOMContentLoaded', async () => {
    await loadContacts();

    const urlParams = new URLSearchParams(window.location.search);
    const autoUserId = urlParams.get('userId');

    if (autoUserId) {
        const targetElement = document.querySelector(`.chat-user[data-userid="${autoUserId}"]`);
        if (targetElement) {
            targetElement.click(); // Automatically opens chat!
        }
    }
});
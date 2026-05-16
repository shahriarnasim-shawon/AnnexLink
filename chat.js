const token = localStorage.getItem('annexlink_token');
const userStr = localStorage.getItem('annexlink_user');

if (!token || !userStr) {
    window.location.href = "index.html";
}

const currentUser = JSON.parse(userStr);
let selectedUserId = null;

// --- Load Navbar Avatar ---
const myAvatarUrl = (!currentUser.avatar || currentUser.avatar === "default-avatar.png") 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.name)}&background=0A192F&color=fff` 
    : (currentUser.avatar.startsWith('http') ? currentUser.avatar : `http://localhost:8000${currentUser.avatar}`);
const navAvatar = document.querySelector('.nav-right .avatar');
if (navAvatar) navAvatar.src = myAvatarUrl;

// --- INITIALIZE SOCKET.IO ---
const socket = io('http://localhost:8000');

socket.on("connect", () => {
    console.log("Connected to Socket.io Server!");
    socket.emit("setup", currentUser._id);
});

// When we receive a new message in real-time
socket.on("message received", (newMessage) => {
    if (selectedUserId === newMessage.sender._id) {
        displayMessage(newMessage, 'received');
        scrollToBottom();
    }
    loadContacts(); // Instantly reshuffle the sidebar to put this chat at the top!
});

// --- LOAD CONTACTS SIDEBAR (Sorted by Newest Chat) ---
async function loadContacts() {
    try {
        const response = await fetch('http://localhost:8000/api/messages/conversations', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const conversations = await response.json();
        
        const contactsList = document.getElementById('contacts-list');
        if (!contactsList) return;
        contactsList.innerHTML = '';

        if (conversations.length === 0) {
            contactsList.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding: 1rem;">No active chats.</p>';
            return;
        }

        conversations.forEach(conv => {
            const user = conv.user;
            const el = createContactElement(user, conv.lastMessage, conv.lastMessageTime);
            contactsList.appendChild(el);
            
            // Keep the active user highlighted if the list re-renders
            if (selectedUserId === user._id) {
                el.classList.add('active');
            }
        });
    } catch (error) {
        console.error("Error loading contacts:", error);
    }
}

// Helper to build the sidebar HTML
function createContactElement(user, lastMessage, lastMessageTime) {
    const avatarUrl = (!user.avatar || user.avatar === "default-avatar.png") 
        ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0A192F&color=fff` 
        : (user.avatar.startsWith('http') ? user.avatar : `http://localhost:8000${user.avatar}`);

    const timeString = new Date(lastMessageTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const userEl = document.createElement('div');
    userEl.className = 'chat-user';
    userEl.dataset.userid = user._id; 
    userEl.onclick = () => selectUser(user._id, user.name, avatarUrl, userEl);
    
    userEl.innerHTML = `
        <img src="${avatarUrl}" class="avatar" style="object-fit: cover;">
        <div class="chat-user-info">
            <h4>${user.name} <span class="chat-time">${timeString}</span></h4>
            <p class="chat-preview" style="overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">${lastMessage}</p>
        </div>
    `;
    return userEl;
}

// --- SELECT A USER TO CHAT WITH ---
async function selectUser(userId, userName, avatarUrl, element) {
    selectedUserId = userId;

    document.querySelectorAll('.chat-user').forEach(el => el.classList.remove('active'));
    element.classList.add('active');

    document.getElementById('chat-header-name').innerText = userName;
    document.getElementById('chat-header-avatar').src = avatarUrl;
    document.getElementById('chat-header-status').innerText = 'Online';

    document.getElementById('message-input').disabled = false;
    document.getElementById('send-btn').disabled = false;

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
        
        chatBox.innerHTML = ''; 

        if (messages.length === 0) {
            chatBox.innerHTML = '<p style="text-align:center; color:var(--text-muted); margin-top:2rem;">No messages yet. Say hi!</p>';
            return;
        }

        messages.forEach(msg => {
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

    inputField.value = ""; 

    try {
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
            displayMessage(savedMessage, 'sent');
            scrollToBottom();
            socket.emit("new message", savedMessage);
            loadContacts(); // Instantly reshuffle sidebar to put this chat at the top!
        }
    } catch (error) {
        console.error("Error sending message:", error);
    }
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// --- HELPER FUNCTIONS ---
function displayMessage(msg, type) {
    const chatBox = document.getElementById('chat-box');
    
    if (chatBox.innerHTML.includes("No messages yet")) {
        chatBox.innerHTML = '';
    }

    const dateObj = new Date(msg.createdAt || Date.now());
    const timeString = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

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

// --- PAGE LOAD SEQUENCE ---
document.addEventListener('DOMContentLoaded', async () => {
    await loadContacts();

    // Check if we arrived from "Message" button on Feed/Profile
    const urlParams = new URLSearchParams(window.location.search);
    const autoUserId = urlParams.get('userId');

    if (autoUserId) {
        const targetElement = document.querySelector(`.chat-user[data-userid="${autoUserId}"]`);
        
        if (targetElement) {
            // We already have a chat with them, just click it
            targetElement.click(); 
        } else {
            // New chat! Fetch their details and forcefully inject them at the top of the sidebar
            try {
                const res = await fetch(`http://localhost:8000/api/users/${autoUserId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    
                    // Remove the "No active chats" message if it exists
                    const contactsList = document.getElementById('contacts-list');
                    if (contactsList.innerHTML.includes("No active chats")) {
                        contactsList.innerHTML = '';
                    }

                    // Create their tab and prepend it to the top of the list
                    const newEl = createContactElement(data.user, "Start a conversation", Date.now());
                    contactsList.insertBefore(newEl, contactsList.firstChild);
                    newEl.click(); // Select them instantly
                }
            } catch(e) { console.error(e); }
        }
    }
});
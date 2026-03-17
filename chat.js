// --- Notifications Toggle Logic ---
function toggleNotifications() {
    const dropdown = document.getElementById('notif-dropdown');
    dropdown.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('notif-dropdown');
    const bellIcon = document.getElementById('notif-bell');
    
    // If click is outside the bell icon AND outside the dropdown, close it
    if (!bellIcon.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// --- Chat Logic ---
function sendMessage() {
    const inputField = document.getElementById('message-input');
    const messageText = inputField.value.trim();
    const chatBox = document.getElementById('chat-box');

    if (messageText !== "") {
        // Get current time
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'sent');
        
        messageDiv.innerHTML = `
            ${messageText}
            <span class="message-time">${timeString}</span>
        `;

        // Append to chat box
        chatBox.appendChild(messageDiv);

        // Clear input and scroll to bottom
        inputField.value = "";
        chatBox.scrollTop = chatBox.scrollHeight;

        // Simulate a reply after 1.5 seconds (For demonstration purposes)
        setTimeout(() => simulateReply(), 1500);
    }
}

// Allow sending message with 'Enter' key
function handleKeyPress(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
}

// Simulate an incoming reply
function simulateReply() {
    const chatBox = document.getElementById('chat-box');
    const now = new Date();
    const timeString = now.toLocaleTimeString(
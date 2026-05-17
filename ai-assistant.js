// Ensure user is logged in before injecting chatbot
const chatbotToken = localStorage.getItem('annexlink_token');

if (chatbotToken) {
    // 1. Inject the HTML into the body dynamically
    const chatbotHTML = `
        <div id="ai-chatbot-container">
            <!-- Floating Button -->
            <button id="ai-chat-btn" onclick="toggleAIChat()">
                <i class="fas fa-robot"></i>
            </button>

            <!-- Chat Window -->
            <div id="ai-chat-window" class="hidden">
                <div class="ai-chat-header">
                    <h4>AnnexLink AI Guide</h4>
                    <i class="fas fa-times" onclick="toggleAIChat()" style="cursor:pointer;"></i>
                </div>
                <div class="ai-chat-body" id="ai-chat-body">
                    <div class="ai-msg bot">Hi! I'm your AnnexLink Assistant. How can I help you today?</div>
                </div>
                <div class="ai-chat-footer">
                    <input type="text" id="ai-chat-input" placeholder="Ask a question..." onkeypress="handleAIKeyPress(event)">
                    <button onclick="sendAIMessage()"><i class="fas fa-paper-plane"></i></button>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', chatbotHTML);
}

// 2. Chat Logic
function toggleAIChat() {
    const chatWindow = document.getElementById('ai-chat-window');
    chatWindow.classList.toggle('hidden');
}

async function sendAIMessage() {
    const input = document.getElementById('ai-chat-input');
    const message = input.value.trim();
    if (!message) return;

    const chatBody = document.getElementById('ai-chat-body');

    // Display user message
    chatBody.innerHTML += `<div class="ai-msg user">${message}</div>`;
    input.value = '';
    chatBody.scrollTop = chatBody.scrollHeight;

    // Show loading
    const loadingId = 'loading-' + Date.now();
    chatBody.innerHTML += `<div class="ai-msg bot" id="${loadingId}">Thinking... <i class="fas fa-spinner fa-spin"></i></div>`;
    chatBody.scrollTop = chatBody.scrollHeight;

    try {
        const response = await fetch('http://localhost:8000/api/chatbot', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${chatbotToken}`
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        
        // Remove loading spinner
        document.getElementById(loadingId).remove();
        
        if (response.ok) {
            // Success! Print the AI's reply
            chatBody.innerHTML += `<div class="ai-msg bot">${data.reply}</div>`;
        } else {
            // Backend sent an error (like missing API key)
            chatBody.innerHTML += `<div class="ai-msg bot" style="color: #E63946;">Error: ${data.message}</div>`;
        }
        
        chatBody.scrollTop = chatBody.scrollHeight;

    } catch (error) {
        document.getElementById(loadingId).innerText = "Sorry, I am having trouble connecting right now.";
    }
}

function handleAIKeyPress(event) {
    if (event.key === 'Enter') sendAIMessage();
}
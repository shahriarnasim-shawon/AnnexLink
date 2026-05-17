const { GoogleGenerativeAI } = require("@google/generative-ai");

// @desc    Ask AnnexLink AI Assistant a question
// @route   POST /api/chatbot
// @access  Private
const askChatbot = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ message: "Message is required" });

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Use gemini-1.5-flash as it is the fastest and free for general text tasks
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        // System Prompt: Tell Gemini who it is!
        const systemInstruction = `
        You are the official AI Assistant for 'AnnexLink', a peer-to-peer service marketplace designed exclusively for BUP (Bangladesh University of Professionals) students.
        Here is what you need to know to help users:
        - AnnexLink allows students to offer Services, hire peers, or post Requests.
        - Users can pay securely via a simulated checkout for bKash/Card and download PDF receipts.
        - Users can leave 1-to-5 star reviews on public profiles.
        - There is a real-time messaging system to chat with peers.
        - Users can save posts, edit their profile, and toggle Dark Mode from settings.
        - Registration is strictly restricted to @student.bup.edu.bd emails.
        Keep your answers helpful, friendly, and concise. Do not use markdown formatting like **bold** in your response, just use plain text.
        `;

        // Combine the instruction with the user's message
        const prompt = `${systemInstruction}\n\nUser Question: ${message}\nAnswer:`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ reply: text });
    } catch (error) {
        console.error("Gemini Error:", error);
        
        res.status(500).json({ 
            message: `Google API Error: ${error.message}` 
        });
    }
};

module.exports = { askChatbot };
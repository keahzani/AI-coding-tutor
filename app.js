// ============================================
// AI Coding Tutor - Application Logic
// ============================================

// Global variables
let db;
let auth;
let currentUserId;
let conversationHistory = [];
let userProfile = null;

// DOM Elements
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const loadingIndicator = document.getElementById('loading');

// ============================================
// 1. FIREBASE INITIALIZATION
// ============================================

async function initializeApp() {
    try {
        // Initialize Firebase with the provided config
        firebase.initializeApp(__firebase_config);
        
        auth = firebase.auth();
        db = firebase.firestore();

        // Authenticate using Anonymous authentication (for testing)
        await auth.signInAnonymously();
        
        currentUserId = auth.currentUser.uid;
        console.log('✅ Firebase initialized and user authenticated:', currentUserId);

        // Load user profile and conversation history
        await loadUserProfile();
        setupConversationListener();

        // Display welcome message if this is first interaction
        if (conversationHistory.length === 0) {
            displayWelcomeMessage();
        }

    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        alert('Failed to initialize app. Please refresh the page.');
    }
}

// ============================================
// 2. USER PROFILE MANAGEMENT
// ============================================

async function loadUserProfile() {
    try {
        const profileRef = db.collection('artifacts')
            .doc(__app_id)
            .collection('users')
            .doc(currentUserId)
            .collection('user_profile')
            .doc('settings');

        const profileDoc = await profileRef.get();

        if (profileDoc.exists) {
            userProfile = profileDoc.data();
            console.log('✅ User profile loaded:', userProfile);
        } else {
            // Create default profile if none exists
            userProfile = {
                proficiencyLevel: 'Beginner',
                learningGoal: 'Learning programming fundamentals',
                preferredLanguage: 'Python'
            };
            await profileRef.set(userProfile);
            console.log('✅ Default user profile created');
        }
    } catch (error) {
        console.error('❌ Error loading user profile:', error);
    }
}

// ============================================
// 3. CONVERSATION HISTORY MANAGEMENT
// ============================================

function setupConversationListener() {
    const conversationsRef = db.collection('artifacts')
        .doc(__app_id)
        .collection('users')
        .doc(currentUserId)
        .collection('conversations')
        .orderBy('timestamp', 'asc');

    // Real-time listener for conversation updates
    conversationsRef.onSnapshot((snapshot) => {
        conversationHistory = [];
        chatContainer.innerHTML = ''; // Clear existing messages

        snapshot.forEach((doc) => {
            const message = doc.data();
            conversationHistory.push(message);
            displayMessage(message.role, message.text, false); // false = don't save again
        });

        // Auto-scroll to bottom
        scrollToBottom();
    });
}

async function saveMessage(role, text) {
    try {
        const conversationsRef = db.collection('artifacts')
            .doc(__app_id)
            .collection('users')
            .doc(currentUserId)
            .collection('conversations');

        await conversationsRef.add({
            role: role,
            text: text,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log(`✅ ${role} message saved to Firestore`);
    } catch (error) {
        console.error('❌ Error saving message:', error);
    }
}

// ============================================
// 4. UI MESSAGE DISPLAY
// ============================================

function displayMessage(role, text, shouldSave = true) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';

    // Parse markdown code blocks
    const formattedText = formatMessageText(text);
    contentDiv.innerHTML = formattedText;

    messageDiv.appendChild(contentDiv);
    chatContainer.appendChild(messageDiv);

    // Save to Firestore if needed (new messages only)
    if (shouldSave) {
        saveMessage(role, text);
    }

    scrollToBottom();
}

function formatMessageText(text) {
    // Convert markdown code blocks to HTML
    let formatted = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
        return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
    });

    // Convert inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code style="background:#f0f0f0;padding:2px 6px;border-radius:3px;">$1</code>');

    // Convert line breaks
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function displayWelcomeMessage() {
    const welcomeText = `Hello! I'm your AI Coding Tutor. I'm here to help you learn through guided discovery.\n\n` +
        `I won't just give you answers - instead, I'll ask questions to help you think through problems and discover solutions yourself.\n\n` +
        `What would you like to learn today?`;
    
    displayMessage('assistant', welcomeText, true);
}

// ============================================
// 5. LLM API INTEGRATION
// ============================================

function buildSystemPrompt() {
    const level = userProfile?.proficiencyLevel || 'Beginner';
    const goal = userProfile?.learningGoal || 'Learning programming fundamentals';
    const language = userProfile?.preferredLanguage || 'Python';

    return `You are an expert Coding Tutor specializing in ${language}. You are not a solution provider, but a guide.

STUDENT PROFILE:
- Proficiency Level: ${level}
- Learning Goal: ${goal}
- Preferred Language: ${language}

TEACHING METHODOLOGY:
1. Your primary teaching method is Socratic questioning. Never give the complete, final answer directly. Instead, ask probing questions that guide the student to discover the solution themselves.

2. When the user submits code, perform a gentle, step-by-step review:
   - Identify errors (syntax or logic)
   - Explain the concept the student misunderstood
   - Provide a specific, actionable hint to fix the issue
   - Never provide the complete corrected code

3. Adapt your language and explanations to the student's proficiency level:
   - Beginner: Use simple analogies, detailed definitions, avoid jargon
   - Intermediate: Balance technical terms with explanations
   - Advanced: Use technical terminology, focus on best practices and optimization

4. Tone: Maintain an encouraging, patient, and professional tone. Use positive affirmation for correct steps and good use of concepts.

5. Formatting: All code examples must be enclosed in markdown code blocks with language tags (e.g., \`\`\`python).

Remember: Your goal is to help the student LEARN and UNDERSTAND, not to simply provide solutions.`;
}

async function sendMessageToLLM(userMessage) {
    try {
        showLoading(true);
        disableInput(true);

        // Build the conversation payload for the LLM
        const messages = buildConversationPayload(userMessage);

        // Try multiple API endpoints with models that are actually available
        const apiEndpoints = [
            {
                url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${__gemini_api_key}`,
                name: 'gemini-flash-latest'
            },
            {
                url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${__gemini_api_key}`,
                name: 'gemini-2.5-flash'
            },
            {
                url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${__gemini_api_key}`,
                name: 'gemini-2.0-flash'
            },
            {
                url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-latest:generateContent?key=${__gemini_api_key}`,
                name: 'gemini-pro-latest'
            }
        ];

        let response = null;
        let lastError = null;

        for (const endpoint of apiEndpoints) {
            try {
                console.log(`🔄 Trying ${endpoint.name}...`);
                
                response = await fetch(endpoint.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: messages,
                        generationConfig: {
                            temperature: 0.7,
                            maxOutputTokens: 2048,
                        }
                    })
                });

                if (response.ok) {
                    console.log(`✅ Success with ${endpoint.name}`);
                    break;
                } else {
                    const errorData = await response.json();
                    console.log(`⚠️ ${endpoint.name} failed with status ${response.status}:`, errorData);
                    
                    // Log the full error details
                    if (errorData.error) {
                        console.error('📋 Full error details:', {
                            code: errorData.error.code,
                            message: errorData.error.message,
                            status: errorData.error.status,
                            details: errorData.error.details
                        });
                    }
                    
                    lastError = errorData;
                }
            } catch (error) {
                console.log(`⚠️ ${endpoint.name} error:`, error.message);
                lastError = error;
            }
        }

        if (!response || !response.ok) {
            console.error('❌ All API endpoints failed. Last error:', lastError);
            throw new Error('All API endpoints failed');
        }

        const data = await response.json();
        const tutorResponse = data.candidates[0].content.parts[0].text;

        // Display and save the tutor's response
        displayMessage('assistant', tutorResponse, true);

    } catch (error) {
        console.error('❌ Error calling LLM API:', error);
        displayMessage('assistant', 'I apologize, but I encountered an error. Please try again or check your API key configuration.', true);
    } finally {
        showLoading(false);
        disableInput(false);
        userInput.focus();
    }
}

function buildConversationPayload(newUserMessage) {
    // Gemini API format: array of content objects with role and parts
    const messages = [];

    // Add system instruction and acknowledgment
    messages.push({
        role: 'user',
        parts: [{ text: buildSystemPrompt() }]
    });

    messages.push({
        role: 'model',
        parts: [{ text: 'Understood. I will guide students through Socratic questioning.' }]
    });

    // Add conversation history (limit to recent messages to manage token budget)
    const recentHistory = conversationHistory.slice(-10); // Keep last 10 exchanges
    
    for (const msg of recentHistory) {
        messages.push({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        });
    }

    // Add the new user message
    messages.push({
        role: 'user',
        parts: [{ text: newUserMessage }]
    });

    return messages;
}

// ============================================
// 6. UI CONTROLS
// ============================================

function showLoading(show) {
    if (show) {
        loadingIndicator.classList.add('active');
    } else {
        loadingIndicator.classList.remove('active');
    }
}

function disableInput(disabled) {
    userInput.disabled = disabled;
    sendBtn.disabled = disabled;
}

function handleSendMessage() {
    const message = userInput.value.trim();
    
    if (message === '') return;

    // Display user message immediately
    displayMessage('user', message, true);

    // Clear input
    userInput.value = '';

    // Send to LLM
    sendMessageToLLM(message);
}

// ============================================
// 7. EVENT LISTENERS
// ============================================

sendBtn.addEventListener('click', handleSendMessage);

userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
    }
});

// ============================================
// 8. INITIALIZE APP ON LOAD
// ============================================

window.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});
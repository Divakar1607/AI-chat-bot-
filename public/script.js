document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.getElementById('chat-box');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const historyList = document.getElementById('history-list');
    const loginOverlay = document.getElementById('login-overlay');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const usernameInput = document.getElementById('username-input');
    const loginError = document.getElementById('login-error');
    const passwordInput = document.getElementById('password-input');

    // Settings elements
    const settingsOverlay = document.getElementById('settings-overlay');
    const settingsClose = document.getElementById('settings-close');
    const settingsUsername = document.getElementById('settings-username');
    const btnLogout = document.getElementById('settings-logout-btn');
    const btnDeleteHistory = document.getElementById('settings-delete-history-btn');
    const btnDeleteAccount = document.getElementById('settings-delete-account-btn');
    const themeOptions = document.querySelectorAll('.theme-option');

    let currentUser = null;
    let currentSessionId = null;
    let chatHistory = [];
    let allSessions = {};
    let isProcessing = false;

    // --- Core Initialization ---
    initApp();

    function initApp() {
        const savedUser = localStorage.getItem('hackathonUser');
        if (!savedUser) {
            // Show login screen
            loginOverlay.style.display = 'flex';
        } else {
            // User is logged in
            loginOverlay.style.opacity = '0';
            setTimeout(() => { loginOverlay.style.display = 'none'; }, 400);
            currentUser = savedUser;
            loadAllSessions();
            startNewSession();
            updateWelcomeHeader();
        }
    }

    // --- Login / Register Logic ---
    loginBtn.addEventListener('click', handleLogin);
    if (registerBtn) registerBtn.addEventListener('click', handleRegister);

    usernameInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') passwordInput.focus();
    });
    passwordInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleLogin();
    });

    function getCredentials() {
        return {
            name: usernameInput.value.trim(),
            pwd: passwordInput.value.trim()
        };
    }

    function showLoginError(msg) {
        loginError.textContent = msg;
        loginError.style.display = 'block';
    }

    function loginSuccess(name) {
        loginError.style.display = 'none';
        usernameInput.value = '';
        passwordInput.value = '';
        localStorage.setItem('hackathonUser', name);
        initApp();
    }

    function handleLogin() {
        const { name, pwd } = getCredentials();
        if (name.length < 2) { showLoginError('Please enter a valid username (min 2 chars).'); return; }

        const savedData = localStorage.getItem(`hackAuth_${name}`);
        if (!savedData) {
            showLoginError('No account found. Please Register first.');
            return;
        }
        const auth = JSON.parse(savedData);
        if (auth.password !== pwd) {
            showLoginError('Incorrect password. Please try again.');
            return;
        }
        loginSuccess(name);
    }

    function handleRegister() {
        const { name, pwd } = getCredentials();
        if (name.length < 2) { showLoginError('Please enter a valid username (min 2 chars).'); return; }
        if (pwd.length < 3) { showLoginError('Password must be at least 3 characters.'); return; }

        const savedData = localStorage.getItem(`hackAuth_${name}`);
        if (savedData) {
            showLoginError(`Username "${name}" already exists. Please Log In instead.`);
            return;
        }
        localStorage.setItem(`hackAuth_${name}`, JSON.stringify({ password: pwd }));
        loginSuccess(name);
    }

    function updateWelcomeHeader() {
        const header = document.querySelector('.welcome-header h2');
        if (header && currentUser) {
            header.innerHTML = `Hi <span style="color:var(--accent)">${currentUser}</span>! 🚀`;
        }
        if (settingsUsername && currentUser) {
            settingsUsername.textContent = currentUser;
        }
    }

    // --- Chat Session Management ---
    function loadAllSessions() {
        const saved = localStorage.getItem(`hackChat_${currentUser}`);
        if (saved) {
            allSessions = JSON.parse(saved);
        } else {
            allSessions = {};
        }
        renderHistorySidebar();
    }

    function saveAllSessions() {
        if (!currentUser) return;
        localStorage.setItem(`hackChat_${currentUser}`, JSON.stringify(allSessions));
        renderHistorySidebar();
    }

    function startNewSession() {
        if (chatHistory.length > 0 && currentSessionId) {
            // Ensure previous session is saved
            allSessions[currentSessionId].messages = [...chatHistory];
            saveAllSessions();
        }

        currentSessionId = 'session_' + Date.now();
        chatHistory = [];
        allSessions[currentSessionId] = {
            id: currentSessionId,
            timestamp: Date.now(),
            title: 'New Conversation',
            messages: []
        };
        saveAllSessions();
        clearChatUI();
        showWelcomeScreen();
    }

    function loadSession(id) {
        if (!allSessions[id]) return;

        // Save current before switching
        if (chatHistory.length > 0 && currentSessionId) {
            allSessions[currentSessionId].messages = [...chatHistory];
            saveAllSessions();
        }

        currentSessionId = id;
        chatHistory = [...allSessions[id].messages];

        clearChatUI();
        hideWelcomeScreen();

        // Re-render messages
        chatHistory.forEach(msg => {
            appendMessageOnly(msg.text, msg.sender);
        });

        if (chatHistory.length === 0) {
            showWelcomeScreen();
        }
        renderHistorySidebar(); // Update active state
    }

    function renderHistorySidebar() {
        historyList.innerHTML = '';

        // Sort sessions by timestamp descending (newest first)
        const sortedSessions = Object.values(allSessions)
            .filter(s => s.messages.length > 0 || s.id === currentSessionId) // Keep current empty session, or non-empty ones
            .sort((a, b) => b.timestamp - a.timestamp);

        sortedSessions.forEach(session => {
            const btn = document.createElement('button');
            btn.className = `history-item ${session.id === currentSessionId ? 'active' : ''}`;

            // Set dynamic title based on first user message if available
            let title = 'New Conversation';
            if (session.messages.length > 0) {
                const firstUserMsg = session.messages.find(m => m.sender === 'user');
                if (firstUserMsg) {
                    title = firstUserMsg.text.substring(0, 25) + (firstUserMsg.text.length > 25 ? '...' : '');
                }
            }

            btn.innerHTML = `<i class="fa-regular fa-message" style="margin-right:8px"></i> ${title}`;
            btn.onclick = () => loadSession(session.id);
            historyList.appendChild(btn);
        });
    }

    // --- UI Helpers ---
    function clearChatUI() {
        const messages = chatBox.querySelectorAll('.message');
        messages.forEach(msg => msg.remove());
    }

    function hideWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcome-screen');
        if (welcomeScreen) welcomeScreen.style.display = 'none';
    }

    function showWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcome-screen');
        if (welcomeScreen) welcomeScreen.style.display = 'flex';
    }

    // --- Theme Toggle Logic ---
    const currentTheme = localStorage.getItem('theme') ? localStorage.getItem('theme') : 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    updateSettingsThemeUI(currentTheme);

    themeToggle.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    });

    themeOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            setTheme(opt.getAttribute('data-theme'));
        });
    });

    function setTheme(newTheme) {
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        updateSettingsThemeUI(newTheme);
    }

    function updateThemeIcon(theme) {
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.className = 'fa-solid fa-sun';
        } else {
            icon.className = 'fa-solid fa-moon';
        }
    }

    function updateSettingsThemeUI(theme) {
        themeOptions.forEach(opt => {
            if (opt.getAttribute('data-theme') === theme) {
                opt.classList.add('active');
            } else {
                opt.classList.remove('active');
            }
        });
    }

    // --- Input Logic ---
    userInput.addEventListener('input', function () {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if (this.value.trim() === '') {
            sendBtn.disabled = true;
        } else {
            sendBtn.disabled = false;
        }
    });

    userInput.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    sendBtn.addEventListener('click', sendMessage);

    // --- Messaging Logic ---
    function appendMessageOnly(text, sender) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${sender}-msg`;
        let iconClass = sender === 'user' ? 'fa-user' : 'fa-robot';
        const formattedText = text.replace(/\n/g, '<br>').replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: inherit; text-decoration: underline;">$1</a>');

        msgDiv.innerHTML = `
            <div class="avatar"><i class="fa-solid ${iconClass}"></i></div>
            <div class="message-content">${formattedText}</div>
        `;
        chatBox.appendChild(msgDiv);
        scrollToBottom();
    }

    function appendMessage(text, sender) {
        appendMessageOnly(text, sender);
    }

    function showTypingIndicator() {
        const indicatorId = 'typing-' + Date.now();
        const indicatorDiv = document.createElement('div');
        indicatorDiv.className = 'typing-indicator';
        indicatorDiv.id = indicatorId;
        indicatorDiv.innerHTML = `
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        `;
        chatBox.appendChild(indicatorDiv);
        scrollToBottom();
        return indicatorId;
    }

    function removeTypingIndicator(id) {
        const indicator = document.getElementById(id);
        if (indicator) indicator.remove();
    }

    function scrollToBottom() {
        chatBox.scrollTo({
            top: chatBox.scrollHeight,
            behavior: 'smooth'
        });
    }

    async function sendMessage() {
        const message = userInput.value.trim();
        if (!message || isProcessing) return;

        hideWelcomeScreen();

        userInput.value = '';
        userInput.style.height = 'auto';
        sendBtn.disabled = true;

        appendMessage(message, 'user');

        // Update history and save state
        chatHistory.push({ text: message, sender: 'user' });
        if (currentSessionId) {
            allSessions[currentSessionId].messages = [...chatHistory];
            saveAllSessions();
        }

        isProcessing = true;
        const typingId = showTypingIndicator();

        try {
            const response = await fetch('http://localhost:3000/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: message,
                    history: chatHistory.slice(-10)
                })
            });

            const data = await response.json();
            removeTypingIndicator(typingId);

            if (!response.ok) {
                throw new Error(data.error || 'Server error');
            }

            const aiText = data.response;
            appendMessage(aiText, 'bot');

            chatHistory.push({ text: aiText, sender: 'bot' });
            if (currentSessionId) {
                allSessions[currentSessionId].messages = [...chatHistory];
                saveAllSessions();
            }

        } catch (error) {
            removeTypingIndicator(typingId);
            console.error('Error:', error);
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                appendMessage("⚠️ Connection error. Make sure the Node.js server is running.", 'bot');
            } else {
                appendMessage(`⚠️ Error: ${error.message}`, 'bot');
            }
        } finally {
            isProcessing = false;
        }
    }

    sendBtn.disabled = true;

    // --- Sidebar Menu ---
    const menuItems = document.querySelectorAll('.menu-item');

    function setActiveMenu(clickedItem) {
        menuItems.forEach(item => item.classList.remove('active'));
        if (clickedItem.classList) {
            clickedItem.classList.add('active');
        }
    }

    // Direct button listeners instead of loop to avoid overriding history list logic
    const newChatBtn = document.getElementById('new-chat-btn');
    if (newChatBtn) {
        newChatBtn.addEventListener('click', function () {
            setActiveMenu(this);
            startNewSession();
        });
    }

    const tipsBtn = document.getElementById('tips-btn');
    if (tipsBtn) {
        tipsBtn.addEventListener('click', function () {
            setActiveMenu(this);
            if (chatHistory.length === 0) hideWelcomeScreen();
            userInput.value = "Give me 3 practical tips for winning a hackathon.";
            sendBtn.disabled = false;
            sendMessage();
        });
    }

    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function () {
            setActiveMenu(this);
            settingsOverlay.style.display = 'flex';
        });
    }

    // --- Settings Panel Actions ---
    if (settingsClose) {
        settingsClose.addEventListener('click', () => {
            settingsOverlay.style.display = 'none';
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (chatHistory.length > 0 && currentSessionId) {
                allSessions[currentSessionId].messages = [...chatHistory];
                saveAllSessions();
            }
            localStorage.removeItem('hackathonUser');
            currentUser = null;
            currentSessionId = null;
            chatHistory = [];
            allSessions = {};
            clearChatUI();
            settingsOverlay.style.display = 'none';
            loginOverlay.style.display = 'flex';
            loginOverlay.style.opacity = '1';
        });
    }

    if (btnDeleteHistory) {
        btnDeleteHistory.addEventListener('click', () => {
            if (confirm("Are you sure you want to delete all your chat history? This cannot be undone.")) {
                localStorage.removeItem(`hackChat_${currentUser}`);
                allSessions = {};
                chatHistory = [];
                currentSessionId = null;
                clearChatUI();
                renderHistorySidebar();
                showWelcomeScreen();
                settingsOverlay.style.display = 'none';
                startNewSession(); // Create a fresh clean session
            }
        });
    }

    if (btnDeleteAccount) {
        btnDeleteAccount.addEventListener('click', () => {
            if (confirm("Are you sure you want to delete your entire account? This will wipe your login data and all chats forever.")) {
                localStorage.removeItem(`hackChat_${currentUser}`);
                localStorage.removeItem(`hackAuth_${currentUser}`);
                localStorage.removeItem('hackathonUser');

                currentUser = null;
                currentSessionId = null;
                chatHistory = [];
                allSessions = {};
                clearChatUI();
                settingsOverlay.style.display = 'none';
                loginOverlay.style.display = 'flex';
                loginOverlay.style.opacity = '1';
            }
        });
    }

    // --- Cards Functionality ---
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const prompt = card.getAttribute('data-prompt');
            if (prompt) {
                userInput.value = prompt;
                sendBtn.disabled = false;
                sendMessage();
            }
        });
    });
});
window.addEventListener("load", () => {

    setTimeout(() => {
        const splash = document.getElementById("splash-screen");

        if(splash){
            splash.style.display = "none";
        }

    }, 3000); // 3 seconds

});
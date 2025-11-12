const { ipcRenderer } = require('electron');

let games = [];
let archivedGames = [];
let selectedImagePath = null;
let currentView = 'active';
let currentGameDetails = null; // Track current game being viewed
let currentUser = null;
let sessionToken = localStorage.getItem('sessionToken');

// DOM Elements
const addGameBtn = document.getElementById('addGameBtn');
const modalOverlay = document.getElementById('modalOverlay');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const gameForm = document.getElementById('gameForm');
const gameLinks = document.getElementById('gameLinks');
const linkType1 = document.getElementById('linkType1');
const linkUrl1 = document.getElementById('linkUrl1');
const linkType2 = document.getElementById('linkType2');
const linkUrl2 = document.getElementById('linkUrl2');
const linkType3 = document.getElementById('linkType3');
const linkUrl3 = document.getElementById('linkUrl3');
const gamesGrid = document.getElementById('gamesGrid');
const archiveGrid = document.getElementById('archiveGrid');
const noGames = document.getElementById('noGames');
const noArchive = document.getElementById('noArchive');
const selectImageBtn = document.getElementById('selectImageBtn');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const removeImage = document.getElementById('removeImage');
const activeTab = document.getElementById('activeTab');
const archiveTab = document.getElementById('archiveTab');
const refreshBtn = document.getElementById('refreshBtn');
const settingsNavBtn = document.getElementById('settingsNavBtn');
const activeView = document.getElementById('activeView');
const archiveView = document.getElementById('archiveView');
const activeCount = document.getElementById('activeCount');
const archiveCount = document.getElementById('archiveCount');

// Image input elements
const urlTab = document.getElementById('urlTab');
const uploadTab = document.getElementById('uploadTab');
const urlInput = document.getElementById('urlInput');
const uploadInput = document.getElementById('uploadInput');
const imageUrl = document.getElementById('imageUrl');
const previewUrlBtn = document.getElementById('previewUrlBtn');

// Game details page elements
const gameDetailsPage = document.getElementById('gameDetailsPage');
const backBtn = document.getElementById('backBtn');
const gameHeroImage = document.getElementById('gameHeroImage');
const gameHeroTitle = document.getElementById('gameHeroTitle');
const gameHeroDescription = document.getElementById('gameHeroDescription');
const gameReleaseInfo = document.getElementById('gameReleaseInfo');
const gameTimezoneInfo = document.getElementById('gameTimezoneInfo');
const gameDetailsDays = document.getElementById('gameDetailsDays');
const gameDetailsHours = document.getElementById('gameDetailsHours');
const gameDetailsMinutes = document.getElementById('gameDetailsMinutes');
const gameDetailsSeconds = document.getElementById('gameDetailsSeconds');
const gameDetailsStatus = document.getElementById('gameDetailsStatus');

// Authentication DOM elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const userInfo = document.getElementById('userInfo');
const authButtons = document.getElementById('authButtons');
const currentUsername = document.getElementById('currentUsername');

// Authentication modals
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const closeRegisterModal = document.getElementById('closeRegisterModal');
const cancelLoginBtn = document.getElementById('cancelLoginBtn');
const cancelRegisterBtn = document.getElementById('cancelRegisterBtn');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Chat elements
const chatInputSection = document.getElementById('chatInputSection');
const chatLoginPrompt = document.getElementById('chatLoginPrompt');
const chatInput = document.getElementById('chatInput');
const sendMessageBtn = document.getElementById('sendMessageBtn');
const chatMessages = document.getElementById('chatMessages');

// Profile menu elements
const profileBtn = document.getElementById('profileBtn');
const profileMenu = document.getElementById('profileMenu');
const profileUsername = document.getElementById('profileUsername');
const viewProfileBtn = document.getElementById('viewProfileBtn');
const settingsBtn = document.getElementById('settingsBtn');

// Chat page elements
const chatPage = document.getElementById('chatPage');
const chatBackBtn = document.getElementById('chatBackBtn');
const chatPageGameTitle = document.getElementById('chatPageGameTitle');
const chatPageGameSubtitle = document.getElementById('chatPageGameSubtitle');
const chatPageMessages = document.getElementById('chatPageMessages');
const chatPageInputSection = document.getElementById('chatPageInputSection');
const chatPageLoginPrompt = document.getElementById('chatPageLoginPrompt');
const chatPageInput = document.getElementById('chatPageInput');
const chatPageSendBtn = document.getElementById('chatPageSendBtn');
const fullscreenChatBtn = document.getElementById('fullscreenChatBtn');
const chatLoginBtn = document.getElementById('chatLoginBtn');
const chatRegisterBtn = document.getElementById('chatRegisterBtn');
const onlineUsersList = document.getElementById('onlineUsersList');
const onlineUsersListDetails = document.getElementById('onlineUsersListDetails');
const onlineCount = document.getElementById('onlineCount');

// Profile page elements
const profilePage = document.getElementById('profilePage');
const profileBackBtn = document.getElementById('profileBackBtn');
const profileDisplayName = document.getElementById('profileDisplayName');
const profileEmail = document.getElementById('profileEmail');
const profileMessageCount = document.getElementById('profileMessageCount');
const profileJoinDate = document.getElementById('profileJoinDate');
const profileUsernameEdit = document.getElementById('profileUsernameEdit');
const profileEmailEdit = document.getElementById('profileEmailEdit');
const changePasswordBtn = document.getElementById('changePasswordBtn');

// Settings page elements
const settingsPage = document.getElementById('settingsPage');
const settingsBackBtn = document.getElementById('settingsBackBtn');
const themeSelect = document.getElementById('themeSelect');
const compactMode = document.getElementById('compactMode');
const chatNotifications = document.getElementById('chatNotifications');
const releaseNotifications = document.getElementById('releaseNotifications');
const showOnlineUsers = document.getElementById('showOnlineUsers');
const clearChatBtn = document.getElementById('clearChatBtn');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');

// Modal Functions
function openModal() {
    modalOverlay.classList.add('active');
    document.getElementById('gameName').focus();
}

function closeModalFunc() {
    modalOverlay.classList.remove('active');
    resetForm();
}

// Game Details Functions
function openGameDetails(game) {
    currentGameDetails = game;

    // Update window title
    document.title = `${game.name} - Starlite Game Countdown Manager`;

    // Populate game details
    gameHeroTitle.textContent = game.name;
    gameHeroDescription.textContent = game.description || 'No description available';

    // Set hero image
    if (game.imagePath) {
        if (game.isUrl || (game.imagePath.startsWith('http://') || game.imagePath.startsWith('https://'))) {
            gameHeroImage.src = game.imagePath;
        } else {
            // For local files, use relative path or absolute file:// path
            if (game.imagePath.startsWith('./') || game.imagePath.startsWith('../')) {
                gameHeroImage.src = game.imagePath; // Use relative path directly
            } else {
                gameHeroImage.src = `file://${game.imagePath}`; // Use file:// protocol for absolute paths
            }
        }
    } else {
        gameHeroImage.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwMCIgaGVpZ2h0PSI0MDAiIHZpZXdCb3g9IjAgMCAxMDAwIDQwMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjEwMDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMWExYTJlIi8+Cjx0ZXh0IHg9IjUwMCIgeT0iMjAwIiBmaWxsPSIjYTBhMGEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiBmb250LWZhbWlseT0iU2Vnb2UgVUkiIGZvbnQtc2l6ZT0iMjQiPk5vIEltYWdlPC90ZXh0Pgo8L3N2Zz4K';
    }

    // Format release date
    const releaseDate = new Date(game.releaseDateTime);
    gameReleaseInfo.textContent = releaseDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    // Show timezone
    gameTimezoneInfo.textContent = game.timezone || 'UTC';

    // Update countdown
    updateGameDetailsCountdown();

    // Load chat messages for this game
    loadChatMessages(game.id);

    // Start auto-refresh for chat
    startChatAutoRefresh(game.id);

    // Join the game chat if logged in
    if (currentUser && sessionToken) {
        joinGameChat(game.id);
    }

    // Load online users
    loadOnlineUsers(game.id);

    // Display official links
    displayGameLinks(game.links || []);

    // Show the details page with animation
    gameDetailsPage.classList.add('active', 'fade-in');
}

function closeGameDetails() {
    currentGameDetails = null;
    document.title = 'Starlite Game Countdown Manager';
    gameDetailsPage.classList.remove('active', 'fade-in');

    // Stop auto-refresh when closing
    stopChatAutoRefresh();

    // Leave the game chat if logged in
    if (currentUser && sessionToken && currentGameDetails) {
        leaveGameChat(currentGameDetails.id);
    }
}

// Game Links Functions
function displayGameLinks(links) {
    gameLinks.innerHTML = '';

    if (!links || links.length === 0) {
        return;
    }

    links.forEach(link => {
        const linkElement = document.createElement('a');
        linkElement.href = link.url;
        linkElement.target = '_blank';
        linkElement.rel = 'noopener noreferrer';
        linkElement.className = `game-link ${link.type}`;

        // Add platform-specific icons and text
        const platformInfo = getPlatformInfo(link.type);
        linkElement.innerHTML = `
            <i class='${platformInfo.icon}'></i>
            ${platformInfo.name}
        `;

        gameLinks.appendChild(linkElement);
    });
}

function getPlatformInfo(type) {
    const platforms = {
        steam: { name: 'Steam', icon: 'bx bxl-steam' },
        epic: { name: 'Epic Games Store', icon: 'bx bx-game' },
        gog: { name: 'GOG', icon: 'bx bx-game' },
        battlenet: { name: 'Battle.net', icon: 'bx bx-shield' },
        ubisoft: { name: 'Ubisoft Connect', icon: 'bx bx-game' },
        origin: { name: 'EA Origin', icon: 'bx bx-game' },
        gamepass: { name: 'Xbox Game Pass', icon: 'bx bxl-xbox' },
        xbox: { name: 'Xbox Store', icon: 'bx bxl-xbox' },
        playstation: { name: 'PlayStation Store', icon: 'bx bxl-playstation' },
        nintendo: { name: 'Nintendo eShop', icon: 'bx bx-game' },
        itch: { name: 'itch.io', icon: 'bx bx-game' },
        humble: { name: 'Humble Bundle', icon: 'bx bx-package' },
        rockstar: { name: 'Rockstar Games', icon: 'bx bx-star' },
        bethesda: { name: 'Bethesda Launcher', icon: 'bx bx-game' },
        official: { name: 'Official Website', icon: 'bx bx-globe' },
        trailer: { name: 'Watch Trailer', icon: 'bx bx-play-circle' },
        twitch: { name: 'Twitch', icon: 'bx bxl-twitch' },
        youtube: { name: 'YouTube', icon: 'bx bxl-youtube' }
    };

    return platforms[type] || { name: 'View', icon: 'bx bx-link-external' };
}

// Authentication Functions
function updateAuthUI() {
    if (currentUser) {
        userInfo.style.display = 'flex';
        authButtons.style.display = 'none';
        currentUsername.textContent = currentUser.username;
        profileUsername.textContent = currentUser.username;

        // Show chat input for logged in users
        if (chatInputSection) {
            chatInputSection.style.display = 'block';
            chatLoginPrompt.style.display = 'none';
        }

        // Show chat page input for logged in users
        if (chatPageInputSection) {
            chatPageInputSection.style.display = 'block';
            chatPageLoginPrompt.style.display = 'none';
        }
    } else {
        userInfo.style.display = 'none';
        authButtons.style.display = 'flex';

        // Hide chat input for non-logged in users
        if (chatInputSection) {
            chatInputSection.style.display = 'none';
            chatLoginPrompt.style.display = 'block';
        }

        // Hide chat page input for non-logged in users
        if (chatPageInputSection) {
            chatPageInputSection.style.display = 'none';
            chatPageLoginPrompt.style.display = 'block';
        }
    }
}

async function validateSession() {
    if (sessionToken) {
        try {
            const result = await ipcRenderer.invoke('validate-session', sessionToken);
            if (result.success) {
                currentUser = result.user;
                updateAuthUI();
                return true;
            } else {
                // Invalid session, clear it
                sessionToken = null;
                localStorage.removeItem('sessionToken');
                currentUser = null;
                updateAuthUI();
                return false;
            }
        } catch (error) {
            console.error('Error validating session:', error);
            sessionToken = null;
            localStorage.removeItem('sessionToken');
            currentUser = null;
            updateAuthUI();
            return false;
        }
    } else {
        updateAuthUI();
        return false;
    }
}

function openLoginModal() {
    loginModal.classList.add('active');
    document.getElementById('loginUsername').focus();
}

function closeLoginModalFunc() {
    loginModal.classList.remove('active');
    loginForm.reset();
}

function openRegisterModal() {
    registerModal.classList.add('active');
    document.getElementById('registerUsername').focus();
}

function closeRegisterModalFunc() {
    registerModal.classList.remove('active');
    registerForm.reset();
}

async function handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(loginForm);
    const username = formData.get('username');
    const password = formData.get('password');

    try {
        const result = await ipcRenderer.invoke('login-user', { username, password });
        if (result.success) {
            currentUser = result.user;
            sessionToken = result.sessionToken;
            localStorage.setItem('sessionToken', sessionToken);
            updateAuthUI();
            closeLoginModalFunc();

            // Reload chat if viewing game details
            if (currentGameDetails) {
                loadChatMessages(currentGameDetails.id);
            }
        } else {
            alert('Login failed: ' + result.error);
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed. Please try again.');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(registerForm);
    const username = formData.get('username');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }

    try {
        // Use username as email for now since we removed email field
        const result = await ipcRenderer.invoke('register-user', { username, email: username + '@starlite.local', password });
        if (result.success) {
            currentUser = result.user;
            sessionToken = result.sessionToken;
            localStorage.setItem('sessionToken', sessionToken);
            updateAuthUI();
            closeRegisterModalFunc();

            // Reload chat if viewing game details
            if (currentGameDetails) {
                loadChatMessages(currentGameDetails.id);
            }
        } else {
            alert('Registration failed: ' + result.error);
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed. Please try again.');
    }
}

// Password visibility toggle function
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(inputId + 'Icon');

    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'bx bx-show';
    } else {
        input.type = 'password';
        icon.className = 'bx bx-hide';
    }
}

async function handleLogout() {
    try {
        if (sessionToken) {
            await ipcRenderer.invoke('logout-user', sessionToken);
        }
        currentUser = null;
        sessionToken = null;
        localStorage.removeItem('sessionToken');
        updateAuthUI();

        // Reload chat if viewing game details
        if (currentGameDetails) {
            loadChatMessages(currentGameDetails.id);
        }
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Chat Functions
async function loadChatMessages(gameId, silent = false) {
    if (!silent) {
        setLoading(chatMessages, true);
    }

    try {
        const result = await ipcRenderer.invoke('get-chat-messages', gameId);
        if (result.success) {
            renderChatMessages(result.messages);
            if (!silent) {
                showToast('Chat messages loaded', 'success', 2000);
            }
        } else {
            console.error('Error loading chat messages:', result.error);
            if (!silent) {
                showToast('Failed to load chat messages', 'error');
            }
        }
    } catch (error) {
        console.error('Error loading chat messages:', error);
        if (!silent) {
            showToast('Connection error while loading chat', 'error');
        }
    } finally {
        if (!silent) {
            setLoading(chatMessages, false);
        }
    }
}

function renderChatMessages(messages) {
    chatMessages.innerHTML = '';

    if (messages.length === 0) {
        chatMessages.innerHTML = '<p style="text-align: center; color: #a0a0a0; font-style: italic;">No messages yet. Start the conversation!</p>';
        return;
    }

    messages.forEach(message => {
        const messageElement = document.createElement('div');
        const isOwnMessage = currentUser && currentUser.id === message.user_id;
        messageElement.className = `chat-message ${isOwnMessage ? 'own' : 'other'}`;

        const messageTime = new Date(message.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageElement.innerHTML = `
            <div class="message-header">
                <span class="message-author">${message.username}</span>
                <span class="message-time">${messageTime}</span>
            </div>
            <div class="message-content">${message.message}</div>
        `;

        chatMessages.appendChild(messageElement);
    });

    // Auto-scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendChatMessage() {
    const message = chatInput.value.trim();
    if (!message) {
        showToast('Please enter a message', 'error', 2000);
        return;
    }

    if (!currentUser || !sessionToken) {
        showToast('Please login to send messages', 'error');
        return;
    }

    // Add loading state to send button
    setLoading(sendMessageBtn, true);

    try {
        const result = await ipcRenderer.invoke('send-chat-message', {
            gameId: currentGameDetails.id,
            sessionToken: sessionToken,
            message: message
        });

        if (result.success) {
            chatInput.value = '';
            loadChatMessages(currentGameDetails.id, true); // Silent refresh
            showToast('Message sent successfully!', 'success', 2000);

            // Add pulse animation to chat area
            chatMessages.classList.add('pulse');
            setTimeout(() => chatMessages.classList.remove('pulse'), 500);
        } else {
            showToast(`Failed to send message: ${result.error}`, 'error');
        }
    } catch (error) {
        console.error('Error sending message:', error);
        showToast('Connection error. Please try again.', 'error');
    } finally {
        setLoading(sendMessageBtn, false);
    }
}

// Chat Page Functions
function openChatPage(game) {
    currentGameDetails = game;

    // Update window title
    document.title = `${game.name} Chat - Starlite Game Countdown Manager`;

    // Update chat page title
    chatPageGameTitle.textContent = `${game.name} Chat`;
    chatPageGameSubtitle.textContent = 'Join the conversation about this game';

    // Load chat messages
    loadChatPageMessages(game.id);

    // Show chat page
    chatPage.classList.add('active');
}

function closeChatPage() {
    chatPage.classList.remove('active');
    document.title = 'Starlite Game Countdown Manager';
    currentGameDetails = null;
}

async function loadChatPageMessages(gameId) {
    try {
        const result = await ipcRenderer.invoke('get-chat-messages', gameId);
        if (result.success) {
            renderChatPageMessages(result.messages);
        } else {
            console.error('Error loading chat messages:', result.error);
        }
    } catch (error) {
        console.error('Error loading chat messages:', error);
    }
}

function renderChatPageMessages(messages) {
    chatPageMessages.innerHTML = '';

    if (messages.length === 0) {
        chatPageMessages.innerHTML = '<p style="text-align: center; color: #a0a0a0; font-style: italic; padding: 40px;">No messages yet. Start the conversation!</p>';
        return;
    }

    messages.forEach(message => {
        const messageElement = document.createElement('div');
        const isOwnMessage = currentUser && currentUser.id === message.user_id;
        messageElement.className = `chat-message ${isOwnMessage ? 'own' : 'other'}`;

        const messageTime = new Date(message.created_at).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageElement.innerHTML = `
            <div class="message-header">
                <span class="message-author">${message.username}</span>
                <span class="message-time">${messageTime}</span>
            </div>
            <div class="message-content">${message.message}</div>
        `;

        chatPageMessages.appendChild(messageElement);
    });

    // Auto-scroll to bottom
    chatPageMessages.scrollTop = chatPageMessages.scrollHeight;
}

async function sendChatPageMessage() {
    const message = chatPageInput.value.trim();
    if (!message) {
        return;
    }

    if (!currentUser || !sessionToken) {
        alert('Please login to send messages');
        return;
    }

    try {
        const result = await ipcRenderer.invoke('send-chat-message', {
            gameId: currentGameDetails.id,
            sessionToken: sessionToken,
            message: message
        });

        if (result.success) {
            chatPageInput.value = '';
            loadChatPageMessages(currentGameDetails.id);

            // Show notification for new chat message
            if (currentUser) {
                showNotification(
                    'Chat Message Sent',
                    `Your message in ${currentGameDetails.name} chat was sent`,
                    'starlite.ico'
                );
            }
        } else {
            alert('Error sending message: ' + result.error);
        }
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Error sending message. Please try again.');
    }
}

// Profile Menu Functions
function toggleProfileMenu() {
    profileMenu.classList.toggle('active');
    profileBtn.classList.toggle('active');
}

function closeProfileMenu() {
    profileMenu.classList.remove('active');
    profileBtn.classList.remove('active');
}

// Online Users Functions
async function joinGameChat(gameId) {
    if (!currentUser || !sessionToken) return;

    try {
        await ipcRenderer.invoke('join-game-chat', { gameId, sessionToken });
        loadOnlineUsers(gameId);
    } catch (error) {
        console.error('Error joining game chat:', error);
    }
}

async function leaveGameChat(gameId) {
    if (!currentUser || !sessionToken) return;

    try {
        await ipcRenderer.invoke('leave-game-chat', { gameId, sessionToken });
    } catch (error) {
        console.error('Error leaving game chat:', error);
    }
}

async function loadOnlineUsers(gameId) {
    try {
        const result = await ipcRenderer.invoke('get-online-users', gameId);
        if (result.success) {
            renderOnlineUsers(result.users);
        } else {
            console.error('Error loading online users:', result.error);
        }
    } catch (error) {
        console.error('Error loading online users:', error);
    }
}

function renderOnlineUsers(users) {
    // Update count
    onlineCount.textContent = users.length;

    // Render in game details sidebar
    if (onlineUsersListDetails) {
        onlineUsersListDetails.innerHTML = '';

        if (users.length === 0) {
            onlineUsersListDetails.innerHTML = '<p style="text-align: center; color: #a0a0a0; font-style: italic; padding: 20px;">No users online</p>';
            return;
        }

        users.forEach(user => {
            const userElement = document.createElement('div');
            const isCurrentUser = currentUser && currentUser.id === user.user_id;
            userElement.className = `online-user-item ${isCurrentUser ? 'current-user' : ''}`;

            userElement.innerHTML = `
                <i class='bx bx-user-circle'></i>
                <span>${user.username}${isCurrentUser ? ' (You)' : ''}</span>
                <div class="user-status"></div>
            `;

            onlineUsersListDetails.appendChild(userElement);
        });
    }

    // Render in chat page sidebar
    if (onlineUsersList) {
        onlineUsersList.innerHTML = '';

        users.forEach(user => {
            const userElement = document.createElement('div');
            const isCurrentUser = currentUser && currentUser.id === user.user_id;
            userElement.className = `user-item ${isCurrentUser ? 'current-user' : ''}`;

            userElement.innerHTML = `
                <i class='bx bx-user-circle'></i>
                <span>${user.username}${isCurrentUser ? ' (You)' : ''}</span>
            `;

            onlineUsersList.appendChild(userElement);
        });
    }
}

async function updateUserActivity(gameId) {
    if (!currentUser || !sessionToken) return;

    try {
        await ipcRenderer.invoke('update-user-activity', { gameId, sessionToken });
    } catch (error) {
        console.error('Error updating user activity:', error);
    }
}

// Toast Notifications
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);

    // Auto remove
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, duration);
}

// Enhanced Loading States
function setLoading(element, loading = true) {
    if (loading) {
        element.classList.add('loading');
        element.disabled = true;
    } else {
        element.classList.remove('loading');
        element.disabled = false;
    }
}

// Auto-refresh chat messages
let chatRefreshInterval = null;

function startChatAutoRefresh(gameId) {
    // Clear existing interval
    if (chatRefreshInterval) {
        clearInterval(chatRefreshInterval);
    }

    // Refresh every 5 seconds
    chatRefreshInterval = setInterval(() => {
        if (currentGameDetails && currentGameDetails.id === gameId) {
            loadChatMessages(gameId, true); // Silent refresh
        } else {
            clearInterval(chatRefreshInterval);
            chatRefreshInterval = null;
        }
    }, 5000);
}

function stopChatAutoRefresh() {
    if (chatRefreshInterval) {
        clearInterval(chatRefreshInterval);
        chatRefreshInterval = null;
    }
}

// Notifications Functions
async function requestNotificationPermission() {
    if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }
    return false;
}

function showNotification(title, body, icon = 'starlite.ico') {
    const chatNotificationsEnabled = localStorage.getItem('chatNotifications') !== 'false';
    const releaseNotificationsEnabled = localStorage.getItem('releaseNotifications') !== 'false';

    // Check if notifications are enabled for this type
    if (title.includes('Chat') && !chatNotificationsEnabled) return;
    if (title.includes('Release') && !releaseNotificationsEnabled) return;

    if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body: body,
            icon: icon,
            badge: icon,
            tag: 'starlite-notification'
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
            notification.close();
        }, 5000);

        // Focus window when notification is clicked
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    }
}

function checkForGameReleases() {
    const releaseNotificationsEnabled = localStorage.getItem('releaseNotifications') !== 'false';
    if (!releaseNotificationsEnabled) return;

    games.forEach(game => {
        const countdown = calculateCountdown(game.releaseDateTime);
        const totalMinutes = countdown.days * 24 * 60 + countdown.hours * 60 + countdown.minutes;

        // Notify when game releases in 1 hour, 30 minutes, 10 minutes, and 1 minute
        const notificationKey = `notified_${game.id}`;
        const notifiedTimes = JSON.parse(localStorage.getItem(notificationKey) || '[]');

        if (totalMinutes <= 60 && !notifiedTimes.includes('1hour')) {
            showNotification(
                'Game Release Alert!',
                `${game.name} releases in 1 hour!`,
                'starlite.ico'
            );
            notifiedTimes.push('1hour');
            localStorage.setItem(notificationKey, JSON.stringify(notifiedTimes));
        } else if (totalMinutes <= 30 && !notifiedTimes.includes('30min')) {
            showNotification(
                'Game Release Alert!',
                `${game.name} releases in 30 minutes!`,
                'starlite.ico'
            );
            notifiedTimes.push('30min');
            localStorage.setItem(notificationKey, JSON.stringify(notifiedTimes));
        } else if (totalMinutes <= 10 && !notifiedTimes.includes('10min')) {
            showNotification(
                'Game Release Alert!',
                `${game.name} releases in 10 minutes!`,
                'starlite.ico'
            );
            notifiedTimes.push('10min');
            localStorage.setItem(notificationKey, JSON.stringify(notifiedTimes));
        } else if (totalMinutes <= 1 && !notifiedTimes.includes('1min')) {
            showNotification(
                'Game Release Alert!',
                `${game.name} releases in 1 minute!`,
                'starlite.ico'
            );
            notifiedTimes.push('1min');
            localStorage.setItem(notificationKey, JSON.stringify(notifiedTimes));
        } else if (countdown.isReleased && !notifiedTimes.includes('released')) {
            showNotification(
                'Game Released!',
                `${game.name} is now available!`,
                'starlite.ico'
            );
            notifiedTimes.push('released');
            localStorage.setItem(notificationKey, JSON.stringify(notifiedTimes));
        }
    });
}

// Keyboard Shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to send message
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (currentGameDetails && chatInput === document.activeElement) {
                e.preventDefault();
                sendChatMessage();
            }
        }

        // Escape to close modals/pages
        if (e.key === 'Escape') {
            if (profilePage.classList.contains('active')) {
                closeProfilePage();
            } else if (settingsPage.classList.contains('active')) {
                closeSettingsPage();
            } else if (chatPage.classList.contains('active')) {
                closeChatPage();
            } else if (gameDetailsPage.classList.contains('active')) {
                closeGameDetails();
            } else if (modalOverlay.classList.contains('active')) {
                closeModalFunc();
            } else if (loginModal.classList.contains('active')) {
                closeLoginModalFunc();
            } else if (registerModal.classList.contains('active')) {
                closeRegisterModalFunc();
            }
        }

        // Ctrl/Cmd + N to add new game
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            openModal();
        }

        // Ctrl/Cmd + P to open profile (when logged in)
        if ((e.ctrlKey || e.metaKey) && e.key === 'p' && currentUser) {
            e.preventDefault();
            openProfilePage();
        }

        // Ctrl/Cmd + , to open settings
        if ((e.ctrlKey || e.metaKey) && e.key === ',') {
            e.preventDefault();
            openSettingsPage();
        }
    });
}

// Get user message count from database
async function getUserMessageCount(userId) {
    try {
        const result = await ipcRenderer.invoke('get-user-message-count', userId);
        return result.success ? result.count : 0;
    } catch (error) {
        console.error('Error getting message count:', error);
        return 0;
    }
}

// Profile Page Functions
function openProfilePage() {
    if (!currentUser) return;

    // Update window title
    document.title = `${currentUser.username} - Profile - Starlite Game Countdown Manager`;

    // Populate profile information
    profileDisplayName.textContent = currentUser.username;
    profileEmail.textContent = currentUser.email || `${currentUser.username}@starlite.local`;
    profileUsernameEdit.value = currentUser.username;
    profileEmailEdit.value = currentUser.email || `${currentUser.username}@starlite.local`;

    // Set join date (you could get this from user data if available)
    const joinDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short'
    });
    profileJoinDate.textContent = joinDate;

    // Get actual message count from database
    getUserMessageCount(currentUser.id).then(count => {
        profileMessageCount.textContent = count.toString();
    });

    // Show profile page
    profilePage.classList.add('active');
}

function closeProfilePage() {
    profilePage.classList.remove('active');
    document.title = 'Starlite Game Countdown Manager';
}

// Settings Page Functions
function openSettingsPage() {
    // Update window title
    document.title = 'Settings - Starlite Game Countdown Manager';

    // Load current settings from localStorage
    loadSettings();

    // Show settings page
    settingsPage.classList.add('active');
}

function closeSettingsPage() {
    settingsPage.classList.remove('active');
    document.title = 'Starlite Game Countdown Manager';
}

function loadSettings() {
    // Load theme
    const theme = localStorage.getItem('theme') || 'blue';
    themeSelect.value = theme;

    // Load other settings
    compactMode.checked = localStorage.getItem('compactMode') === 'true';
    chatNotifications.checked = localStorage.getItem('chatNotifications') !== 'false';
    releaseNotifications.checked = localStorage.getItem('releaseNotifications') !== 'false';
    showOnlineUsers.checked = localStorage.getItem('showOnlineUsers') !== 'false';
}

function saveSettings() {
    // Save theme
    localStorage.setItem('theme', themeSelect.value);

    // Save other settings
    localStorage.setItem('compactMode', compactMode.checked);
    localStorage.setItem('chatNotifications', chatNotifications.checked);
    localStorage.setItem('releaseNotifications', releaseNotifications.checked);
    localStorage.setItem('showOnlineUsers', showOnlineUsers.checked);

    // Apply theme and other settings
    applyTheme(themeSelect.value);
    applyCompactMode(compactMode.checked);
    applyOnlineUsersVisibility(showOnlineUsers.checked);
}

function applyTheme(theme) {
    const root = document.documentElement;

    switch(theme) {
        case 'purple':
            root.style.setProperty('--primary-color', '#8b5cf6');
            root.style.setProperty('--primary-hover', '#7c3aed');
            break;
        case 'green':
            root.style.setProperty('--primary-color', '#10b981');
            root.style.setProperty('--primary-hover', '#059669');
            break;
        case 'red':
            root.style.setProperty('--primary-color', '#ef4444');
            root.style.setProperty('--primary-hover', '#dc2626');
            break;
        default: // blue
            root.style.setProperty('--primary-color', '#4a9eff');
            root.style.setProperty('--primary-hover', '#3a8eef');
            break;
    }
}

function applyCompactMode(enabled) {
    const root = document.documentElement;
    if (enabled) {
        root.style.setProperty('--game-card-height', '200px');
        root.style.setProperty('--game-card-padding', '15px');
        root.style.setProperty('--font-size-small', '0.8rem');
    } else {
        root.style.setProperty('--game-card-height', '300px');
        root.style.setProperty('--game-card-padding', '20px');
        root.style.setProperty('--font-size-small', '0.9rem');
    }
}

function applyOnlineUsersVisibility(visible) {
    const onlineUsersSidebars = document.querySelectorAll('.chat-users-sidebar, .online-users');
    onlineUsersSidebars.forEach(sidebar => {
        sidebar.style.display = visible ? 'flex' : 'none';
    });

    // Adjust chat container layout when online users are hidden
    const chatContainers = document.querySelectorAll('.chat-container');
    chatContainers.forEach(container => {
        if (visible) {
            container.style.gridTemplateColumns = '1fr 250px';
        } else {
            container.style.gridTemplateColumns = '1fr';
        }
    });
}

async function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;

    if (!currentPassword || !newPassword || !confirmNewPassword) {
        alert('Please fill in all password fields');
        return;
    }

    if (newPassword !== confirmNewPassword) {
        alert('New passwords do not match');
        return;
    }

    if (newPassword.length < 6) {
        alert('New password must be at least 6 characters long');
        return;
    }

    // TODO: Implement password change functionality
    alert('Password change functionality will be implemented soon');
}

async function clearChatHistory() {
    if (!confirm('Are you sure you want to clear all your chat messages? This cannot be undone.')) {
        return;
    }

    // TODO: Implement clear chat history functionality
    alert('Clear chat history functionality will be implemented soon');
}

async function deleteAccount() {
    if (!confirm('Are you sure you want to delete your account? This will permanently delete all your data and cannot be undone.')) {
        return;
    }

    const confirmation = prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation !== 'DELETE') {
        alert('Account deletion cancelled');
        return;
    }

    // TODO: Implement account deletion functionality
    alert('Account deletion functionality will be implemented soon');
}

function updateGameDetailsCountdown() {
    if (!currentGameDetails) return;

    const countdown = calculateCountdown(currentGameDetails.releaseDateTime);

    gameDetailsDays.textContent = countdown.days;
    gameDetailsHours.textContent = countdown.hours;
    gameDetailsMinutes.textContent = countdown.minutes;
    gameDetailsSeconds.textContent = countdown.seconds;

    // Update status
    if (countdown.isReleased) {
        gameDetailsStatus.textContent = `${currentGameDetails.name.toUpperCase()} IS NOW AVAILABLE!`;
        gameDetailsStatus.style.color = '#28a745';
    } else {
        const now = new Date();
        const target = new Date(currentGameDetails.releaseDateTime);
        const timeDifference = target - now;
        const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));

        if (days > 30) {
            gameDetailsStatus.textContent = 'COUNTDOWN ACTIVE';
        } else if (days > 7) {
            gameDetailsStatus.textContent = 'FINAL MONTH - RELEASE IMMINENT';
        } else if (days > 1) {
            gameDetailsStatus.textContent = 'FINAL WEEK - ALMOST HERE';
        } else {
            gameDetailsStatus.textContent = 'FINAL DAY - LAUNCHING SOON';
        }
        gameDetailsStatus.style.color = '#e94560';
    }
}

function resetForm() {
    gameForm.reset();
    selectedImagePath = null;
    imagePreview.classList.remove('active');
    previewImg.src = '';

    // Reset image tabs
    urlTab.classList.add('active');
    uploadTab.classList.remove('active');
    urlInput.classList.add('active');
    uploadInput.classList.remove('active');
}

// Modern Navigation Functions
function switchTab(targetTab) {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    // Remove active class from all content views
    document.querySelectorAll('.content-view').forEach(view => {
        view.classList.remove('active');
    });
    
    // Add active class to target tab
    targetTab.classList.add('active');
    
    // Show corresponding content view
    const viewType = targetTab.dataset.view;
    const targetView = document.getElementById(`${viewType}View`);
    if (targetView) {
        targetView.classList.add('active');
    }
    
    // Add smooth transition effect
    targetTab.style.transform = 'scale(0.95)';
    setTimeout(() => {
        targetTab.style.transform = 'scale(1)';
    }, 150);
}

function refreshData() {
    // Add loading animation to refresh button
    refreshBtn.classList.add('loading');
    refreshBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i>';
    
    // Simulate refresh with actual data reload
    setTimeout(async () => {
        try {
            await loadGames();
            await loadArchive();
            renderGames();
            renderArchive();
            updateCounts();
            
            // Show success feedback
            showToast('Data refreshed successfully!', 'success', 2000);
        } catch (error) {
            showToast('Failed to refresh data', 'error');
        } finally {
            // Reset refresh button
            refreshBtn.classList.remove('loading');
            refreshBtn.innerHTML = '<i class="bx bx-refresh"></i>';
        }
    }, 1000);
}

// Navigation event listeners
activeTab.addEventListener('click', () => switchTab(activeTab));
archiveTab.addEventListener('click', () => switchTab(archiveTab));
refreshBtn.addEventListener('click', refreshData);
settingsNavBtn.addEventListener('click', () => {
    if (currentUser) {
        openSettingsPage();
    } else {
        showToast('Please login to access settings', 'info');
    }
});

// Image tab switching
function switchImageTab(tab) {
    if (tab === 'url') {
        urlTab.classList.add('active');
        uploadTab.classList.remove('active');
        urlInput.classList.add('active');
        uploadInput.classList.remove('active');
    } else {
        uploadTab.classList.add('active');
        urlTab.classList.remove('active');
        uploadInput.classList.add('active');
        urlInput.classList.remove('active');
    }

    // Clear preview when switching tabs
    imagePreview.classList.remove('active');
    previewImg.src = '';
    selectedImagePath = null;
}

// Preview URL image
function previewUrlImage() {
    const url = imageUrl.value.trim();
    if (url) {
        previewImg.src = url;
        imagePreview.classList.add('active');
        selectedImagePath = url; // Store URL as the image path
    }
}

// Image Selection
async function selectImage() {
    try {
        const result = await ipcRenderer.invoke('select-image');
        if (result.success && !result.canceled) {
            selectedImagePath = result.imagePath;
            previewImg.src = `file://${result.imagePath}`;
            imagePreview.classList.add('active');
        }
    } catch (error) {
        console.error('Error selecting image:', error);
        alert('Error selecting image. Please try again.');
    }
}

function removeSelectedImage() {
    selectedImagePath = null;
    imagePreview.classList.remove('active');
    previewImg.src = '';
}

// Auto-add Black Ops 7 function
async function ensureBlackOps7Exists() {
    // Check if Black Ops 7 already exists
    const bo7Exists = games.some(game => game.name === 'Black Ops 7' || game.name === 'Call of Duty: Black Ops 7');

    if (!bo7Exists) {
        const bo7Game = {
            name: 'Call of Duty: Black Ops 7',
            description: 'The highly anticipated next installment in the Black Ops series featuring cutting-edge warfare, intense multiplayer action, and an immersive campaign that pushes the boundaries of tactical combat.',
            releaseDate: '2025-11-14',
            releaseTime: '05:00',
            timezone: 'UTC',
            releaseDateTime: '2025-11-14T05:00:00.000Z',
            imagePath: './assets/bo7.png', // Use Black Ops 7 image from assets folder
            isUrl: false, // Mark as local file
            links: [
                {
                    type: 'steam',
                    url: 'https://store.steampowered.com/app/callofduty'
                },
                {
                    type: 'battlenet',
                    url: 'https://us.shop.battle.net/en-us/product/call-of-duty-black-ops-7'
                },
                {
                    type: 'trailer',
                    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
                }
            ]
        };

        try {
            const result = await ipcRenderer.invoke('save-game', bo7Game);
            if (result.success) {
                games.push(result.game);
                renderGames();
                updateCounts();
            }
        } catch (error) {
            console.error('Error adding Black Ops 7:', error);
        }
    }
}

// Navigation
function switchView(view) {
    currentView = view;

    // Update tabs
    activeTab.classList.toggle('active', view === 'active');
    archiveTab.classList.toggle('active', view === 'archive');

    // Update views
    activeView.classList.toggle('active', view === 'active');
    archiveView.classList.toggle('active', view === 'archive');
}

// Game Management
async function loadGames() {
    try {
        games = await ipcRenderer.invoke('load-games');
        renderGames();
    } catch (error) {
        console.error('Error loading games:', error);
    }
}

async function loadArchive() {
    try {
        archivedGames = await ipcRenderer.invoke('load-archive');
        renderArchive();
    } catch (error) {
        console.error('Error loading archive:', error);
    }
}

async function saveGame(gameData) {
    try {
        const result = await ipcRenderer.invoke('save-game', gameData);
        if (result.success) {
            games.push(result.game);
            renderGames();
            updateCounts();
            closeModalFunc();
        } else {
            alert('Error saving game: ' + result.error);
        }
    } catch (error) {
        console.error('Error saving game:', error);
        alert('Error saving game. Please try again.');
    }
}


async function deleteGame(gameId) {
    if (confirm('Are you sure you want to delete this game?')) {
        try {
            const result = await ipcRenderer.invoke('delete-game', gameId);
            if (result.success) {
                games = games.filter(g => g.id !== gameId);
                renderGames();
                updateCounts();
            } else {
                alert('Error deleting game: ' + result.error);
            }
        } catch (error) {
            console.error('Error deleting game:', error);
            alert('Error deleting game. Please try again.');
        }
    }
}

async function archiveGame(gameId) {
    try {
        const result = await ipcRenderer.invoke('archive-game', gameId);
        if (result.success) {
            await loadGames();
            await loadArchive();
            updateCounts();
        } else {
            alert('Error archiving game: ' + result.error);
        }
    } catch (error) {
        console.error('Error archiving game:', error);
        alert('Error archiving game. Please try again.');
    }
}


async function deleteArchivedGame(gameId) {
    if (confirm('Permanently delete this archived game? This cannot be undone.')) {
        try {
            const result = await ipcRenderer.invoke('delete-archived-game', gameId);
            if (result.success) {
                archivedGames = archivedGames.filter(g => g.id !== gameId);
                renderArchive();
                updateCounts();
            } else {
                alert('Error deleting archived game: ' + result.error);
            }
        } catch (error) {
            console.error('Error deleting archived game:', error);
            alert('Error deleting archived game. Please try again.');
        }
    }
}

// Countdown Calculations
function calculateCountdown(targetDate) {
    const now = new Date();
    const target = new Date(targetDate);
    const timeDifference = target - now;

    if (timeDifference <= 0) {
        return {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            isReleased: true
        };
    }

    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);

    return {
        days: days.toString().padStart(2, '0'),
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0'),
        isReleased: false
    };
}

// Render Functions
function renderGames() {
    gamesGrid.innerHTML = '';
    
    // FORCE ROW LAYOUT WITH INLINE STYLES
    gamesGrid.style.display = 'flex';
    gamesGrid.style.flexDirection = 'row';
    gamesGrid.style.flexWrap = 'wrap';
    gamesGrid.style.justifyContent = 'flex-start';
    gamesGrid.style.gap = '30px';
    
    if (games.length === 0) {
        noGames.style.display = 'block';
        return;
    }
    
    noGames.style.display = 'none';
    
    games.forEach(game => {
        const gameCard = createGameCard(game);
        // Force card width inline for maximized screens
        gameCard.style.width = '420px';
        gameCard.style.flex = '0 0 420px';
        gameCard.style.flexShrink = '0';
        gamesGrid.appendChild(gameCard);
    });
}

function renderArchive() {
    // FORCE ROW LAYOUT WITH INLINE STYLES FOR ARCHIVE
    archiveGrid.style.display = 'flex';
    archiveGrid.style.flexDirection = 'row';
    archiveGrid.style.flexWrap = 'wrap';
    archiveGrid.style.justifyContent = 'flex-start';
    archiveGrid.style.gap = '30px';
    
    if (archivedGames.length === 0) {
        noArchive.style.display = 'block';
        return;
    }

    noArchive.style.display = 'none';
    archiveGrid.innerHTML = '';

    archivedGames.forEach(game => {
        const gameCard = createGameCard(game, true);
        // Force card width inline for archive too
        gameCard.style.width = '420px';
        gameCard.style.flex = '0 0 420px';
        gameCard.style.flexShrink = '0';
        archiveGrid.appendChild(gameCard);
    });
}

function updateCounts() {
    activeCount.textContent = games.length;
    archiveCount.textContent = archivedGames.length;
}

function createGameCard(game, isArchived = false) {
    const card = document.createElement('div');
    card.className = `game-card fade-in ${isArchived ? 'archived' : ''}`;
    card.dataset.gameId = game.id;

    const countdown = calculateCountdown(game.releaseDateTime);

    // Determine image source
    let imageSrc = 'https://via.placeholder.com/300x200?text=No+Image';
    if (game.imagePath) {
        if (game.isUrl || (game.imagePath.startsWith('http://') || game.imagePath.startsWith('https://'))) {
            imageSrc = game.imagePath;
        } else {
            // For local files, use relative path from the app root
            imageSrc = game.imagePath.replace('./', '');
        }
    }

    const actionButtons = isArchived ? `` : `
        ${countdown.isReleased ? `
            <button class="btn-restore" onclick="event.stopPropagation(); archiveGame('${game.id}')">
                <i class='bx bx-archive-in'></i> Archive
            </button>
        ` : ''}
    `;

    card.innerHTML = `
        <div class="game-image">
            <img src="${imageSrc}" alt="${game.name}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
        </div>
        <div class="game-info">
            <h3 class="game-title">${game.name}</h3>
            <p class="game-description">${(game.description || 'No description available.').length > 120 ? (game.description || 'No description available.').substring(0, 120) + '...' : (game.description || 'No description available.')}</p>
            <div class="countdown-mini">
                <div class="countdown-unit">
                    <span class="number">${countdown.days}</span>
                    <span class="label">DAYS</span>
                </div>
                <div class="countdown-unit">
                    <span class="number">${countdown.hours}</span>
                    <span class="label">HOURS</span>
                </div>
                <div class="countdown-unit">
                    <span class="number">${countdown.minutes}</span>
                    <span class="label">MIN</span>
                </div>
                <div class="countdown-unit">
                    <span class="number">${countdown.seconds}</span>
                    <span class="label">SEC</span>
                </div>
            </div>
            <div class="game-status ${countdown.isReleased ? 'released' : 'active'}">
                ${countdown.isReleased ? 'RELEASED' : 'COUNTDOWN ACTIVE'}
            </div>
            ${actionButtons}
        </div>
        <div class="click-overlay">
            <i class='bx bx-mouse'></i>
            <span>CLICK FOR DETAILS</span>
        </div>
    `;

    // Add optimized click handler
    let clickTimeout;
    card.addEventListener('click', () => {
        clearTimeout(clickTimeout);
        clickTimeout = setTimeout(() => openGameDetails(game), 100);
    });

    return card;
}

// Update all countdowns
function updateAllCountdowns() {
    const gameCards = document.querySelectorAll('.game-card:not(.archived)'); // Only check active games
    const gamesToArchive = [];

    gameCards.forEach(card => {
        const gameId = card.dataset.gameId;
        const game = games.find(g => g.id === gameId);
        if (game) {
            const countdown = calculateCountdown(game.releaseDateTime);
            const countdownUnits = card.querySelectorAll('.countdown-unit .number');

            if (countdownUnits.length >= 4) {
                countdownUnits[0].textContent = countdown.days;
                countdownUnits[1].textContent = countdown.hours;
                countdownUnits[2].textContent = countdown.minutes;
                countdownUnits[3].textContent = countdown.seconds;
            }

            // If game is released, mark it for archiving
            if (countdown.isReleased) {
                gamesToArchive.push(gameId);
            }
        }
    });

    // Auto-archive all released games
    gamesToArchive.forEach(gameId => {
        archiveGame(gameId);
    });
}

// Form Submission
function handleFormSubmit(e) {
    e.preventDefault();

    const formData = new FormData(gameForm);
    // Collect official links
    const links = [];
    if (linkType1.value && linkUrl1.value) {
        links.push({ type: linkType1.value, url: linkUrl1.value });
    }
    if (linkType2.value && linkUrl2.value) {
        links.push({ type: linkType2.value, url: linkUrl2.value });
    }
    if (linkType3.value && linkUrl3.value) {
        links.push({ type: linkType3.value, url: linkUrl3.value });
    }

    const gameData = {
        name: formData.get('gameName'),
        description: formData.get('gameDescription'),
        releaseDate: formData.get('releaseDate'),
        releaseTime: formData.get('releaseTime'),
        timezone: formData.get('timezone'),
        imagePath: selectedImagePath,
        isUrl: selectedImagePath && (selectedImagePath.startsWith('http://') || selectedImagePath.startsWith('https://')),
        links: links
    };

    // Create combined datetime string
    const dateTimeString = `${gameData.releaseDate}T${gameData.releaseTime}:00`;

    // Convert to UTC based on selected timezone
    try {
        const localDate = new Date(dateTimeString);
        // For simplicity, we'll store the datetime as provided
        // In a real app, you'd use moment-timezone for proper conversion
        gameData.releaseDateTime = localDate.toISOString();

        saveGame(gameData);
    } catch (error) {
        alert('Invalid date/time format. Please check your inputs.');
    }
}

// Event Listeners
addGameBtn.addEventListener('click', openModal);
closeModal.addEventListener('click', closeModalFunc);
cancelBtn.addEventListener('click', closeModalFunc);
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModalFunc();
    }
});

selectImageBtn.addEventListener('click', selectImage);
removeImage.addEventListener('click', removeSelectedImage);
gameForm.addEventListener('submit', handleFormSubmit);

// Image tab event listeners
urlTab.addEventListener('click', () => switchImageTab('url'));
uploadTab.addEventListener('click', () => switchImageTab('upload'));
previewUrlBtn.addEventListener('click', previewUrlImage);

// Navigation event listeners
activeTab.addEventListener('click', () => switchView('active'));
archiveTab.addEventListener('click', () => switchView('archive'));

// Game details event listeners
backBtn.addEventListener('click', closeGameDetails);

// Authentication event listeners
loginBtn.addEventListener('click', openLoginModal);
registerBtn.addEventListener('click', openRegisterModal);
logoutBtn.addEventListener('click', handleLogout);
closeLoginModal.addEventListener('click', closeLoginModalFunc);
closeRegisterModal.addEventListener('click', closeRegisterModalFunc);
cancelLoginBtn.addEventListener('click', closeLoginModalFunc);
cancelRegisterBtn.addEventListener('click', closeRegisterModalFunc);
loginForm.addEventListener('submit', handleLogin);
registerForm.addEventListener('submit', handleRegister);

// Chat event listeners
sendMessageBtn.addEventListener('click', sendChatMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendChatMessage();
    }
});

// Profile menu event listeners
profileBtn.addEventListener('click', toggleProfileMenu);
viewProfileBtn.addEventListener('click', () => {
    closeProfileMenu();
    openProfilePage();
});
settingsBtn.addEventListener('click', () => {
    closeProfileMenu();
    openSettingsPage();
});

// Chat page event listeners
fullscreenChatBtn.addEventListener('click', () => {
    if (currentGameDetails) {
        openChatPage(currentGameDetails);
    }
});
chatBackBtn.addEventListener('click', closeChatPage);
chatPageSendBtn.addEventListener('click', sendChatPageMessage);
chatPageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendChatPageMessage();
    }
});
chatLoginBtn.addEventListener('click', openLoginModal);
chatRegisterBtn.addEventListener('click', openRegisterModal);

// Profile and Settings page event listeners
profileBackBtn.addEventListener('click', closeProfilePage);
settingsBackBtn.addEventListener('click', closeSettingsPage);
changePasswordBtn.addEventListener('click', changePassword);
clearChatBtn.addEventListener('click', clearChatHistory);
deleteAccountBtn.addEventListener('click', deleteAccount);

// Settings change listeners
themeSelect.addEventListener('change', saveSettings);
compactMode.addEventListener('change', saveSettings);
chatNotifications.addEventListener('change', saveSettings);
releaseNotifications.addEventListener('change', saveSettings);
showOnlineUsers.addEventListener('change', saveSettings);

// Close profile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!profileBtn.contains(e.target) && !profileMenu.contains(e.target)) {
        closeProfileMenu();
    }
});

// Modal click outside to close
loginModal.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        closeLoginModalFunc();
    }
});

registerModal.addEventListener('click', (e) => {
    if (e.target === registerModal) {
        closeRegisterModalFunc();
    }
});

// Initialize App
document.addEventListener('DOMContentLoaded', async function() {
    await loadGames();
    await loadArchive();

    // Ensure Black Ops 7 exists as a regular game
    await ensureBlackOps7Exists();

    updateCounts();

    // Validate existing session on startup
    await validateSession();

    // Initialize theme and settings
    const savedTheme = localStorage.getItem('theme') || 'blue';
    const compactModeEnabled = localStorage.getItem('compactMode') === 'true';
    const showOnlineUsersEnabled = localStorage.getItem('showOnlineUsers') !== 'false';

    applyTheme(savedTheme);
    applyCompactMode(compactModeEnabled);
    applyOnlineUsersVisibility(showOnlineUsersEnabled);

    // Setup keyboard shortcuts
    setupKeyboardShortcuts();

    // Request notification permission
    const notificationGranted = await requestNotificationPermission();

    // Show welcome notification if permission granted
    if (notificationGranted) {
        setTimeout(() => {
            showNotification(
                'Starlite Game Countdown Manager',
                'Notifications are enabled! You\'ll be alerted about game releases.',
                'starlite.ico'
            );
        }, 2000);
    }

    // Update countdowns every second (including details page)
    setInterval(() => {
        updateAllCountdowns();
        updateGameDetailsCountdown();

        // Check for game releases and send notifications
        checkForGameReleases();

        // Update user activity and online users if viewing game details
        if (currentGameDetails && currentUser && sessionToken) {
            updateUserActivity(currentGameDetails.id);
        }
    }, 1000);

    // Update online users every 10 seconds
    setInterval(() => {
        if (currentGameDetails) {
            loadOnlineUsers(currentGameDetails.id);
        }
    }, 10000);

    // Initialize lazy loading
    initializeLazyLoading();

    console.log('Starlite Game Countdown Manager with Authentication and Chat initialized successfully!');
});

// Lazy Loading Implementation
function initializeLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy-load');
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });

    // Observe all lazy-load images
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });

    // Set up mutation observer to handle dynamically added images
    const mutationObserver = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) { // Element node
                    const lazyImages = node.querySelectorAll ? node.querySelectorAll('img[data-src]') : [];
                    lazyImages.forEach(img => imageObserver.observe(img));
                }
            });
        });
    });

    mutationObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Performance optimizations
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Optimized rendering with virtual scrolling for large lists
function renderGamesOptimized(gamesToRender, container, isArchived = false) {
    // Use document fragment for better performance
    const fragment = document.createDocumentFragment();

    // Batch DOM updates
    requestAnimationFrame(() => {
        gamesToRender.forEach((game, index) => {
            // Stagger animations for better visual effect
            setTimeout(() => {
                const card = createGameCard(game, isArchived);
                fragment.appendChild(card);

                // Batch append every 5 cards or at the end
                if ((index + 1) % 5 === 0 || index === gamesToRender.length - 1) {
                    container.appendChild(fragment.cloneNode(true));
                    // Clear fragment for next batch
                    while (fragment.firstChild) {
                        fragment.removeChild(fragment.firstChild);
                    }
                }
            }, index * 50); // 50ms delay between cards
        });
    });
}

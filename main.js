const { app, BrowserWindow, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const Database = require('./database');

let mainWindow;
let database;
const dataPath = path.join(__dirname, 'data');
const gamesFile = path.join(dataPath, 'games.json');
const archiveFile = path.join(dataPath, 'archive.json');
const imagesDir = path.join(dataPath, 'images');

// Ensure data directories exist
if (!fs.existsSync(dataPath)) {
  fs.mkdirSync(dataPath);
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false
    },
    icon: path.join(__dirname, 'starlite.ico'),
    title: 'Starlite Game Countdown Manager',
    show: false,
    backgroundColor: '#1a1a1a',
    titleBarStyle: 'default',
    autoHideMenuBar: true
  });

  mainWindow.loadFile('index.html');

  // Remove menu bar for cleaner look
  Menu.setApplicationMenu(null);

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    mainWindow.maximize();
    mainWindow.focus();
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

// App event handlers
app.whenReady().then(() => {
  database = new Database();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC handlers for game management
ipcMain.handle('load-games', async () => {
  try {
    if (fs.existsSync(gamesFile)) {
      const data = fs.readFileSync(gamesFile, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading games:', error);
    return [];
  }
});

ipcMain.handle('save-game', async (event, gameData) => {
  try {
    let games = [];
    if (fs.existsSync(gamesFile)) {
      const data = fs.readFileSync(gamesFile, 'utf8');
      games = JSON.parse(data);
    }
    
    gameData.id = uuidv4();
    gameData.createdAt = new Date().toISOString();
    games.push(gameData);
    
    fs.writeFileSync(gamesFile, JSON.stringify(games, null, 2));
    return { success: true, game: gameData };
  } catch (error) {
    console.error('Error saving game:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-game', async (event, gameData) => {
  try {
    if (!fs.existsSync(gamesFile)) {
      return { success: false, error: 'No games file found' };
    }
    
    const data = fs.readFileSync(gamesFile, 'utf8');
    let games = JSON.parse(data);
    
    const gameIndex = games.findIndex(g => g.id === gameData.id);
    if (gameIndex === -1) {
      return { success: false, error: 'Game not found' };
    }
    
    // Update the game while preserving original creation data
    games[gameIndex] = {
      ...games[gameIndex],
      ...gameData,
      updatedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(gamesFile, JSON.stringify(games, null, 2));
    return { success: true, game: games[gameIndex] };
  } catch (error) {
    console.error('Error updating game:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-game', async (event, gameId) => {
  try {
    if (fs.existsSync(gamesFile)) {
      const data = fs.readFileSync(gamesFile, 'utf8');
      let games = JSON.parse(data);
      
      const gameIndex = games.findIndex(g => g.id === gameId);
      if (gameIndex > -1) {
        const game = games[gameIndex];
        // Delete image file if exists
        if (game.imagePath && fs.existsSync(game.imagePath)) {
          fs.unlinkSync(game.imagePath);
        }
        games.splice(gameIndex, 1);
        fs.writeFileSync(gamesFile, JSON.stringify(games, null, 2));
      }
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting game:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('load-archive', async () => {
  try {
    if (fs.existsSync(archiveFile)) {
      const data = fs.readFileSync(archiveFile, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading archive:', error);
    return [];
  }
});

ipcMain.handle('archive-game', async (event, gameId) => {
  try {
    // Load current games
    let games = [];
    if (fs.existsSync(gamesFile)) {
      const data = fs.readFileSync(gamesFile, 'utf8');
      games = JSON.parse(data);
    }
    
    // Find game to archive
    const gameIndex = games.findIndex(g => g.id === gameId);
    if (gameIndex === -1) {
      return { success: false, error: 'Game not found' };
    }
    
    const gameToArchive = games[gameIndex];
    gameToArchive.archivedAt = new Date().toISOString();
    
    // Load current archive
    let archive = [];
    if (fs.existsSync(archiveFile)) {
      const archiveData = fs.readFileSync(archiveFile, 'utf8');
      archive = JSON.parse(archiveData);
    }
    
    // Move game to archive
    archive.push(gameToArchive);
    games.splice(gameIndex, 1);
    
    // Save both files
    fs.writeFileSync(gamesFile, JSON.stringify(games, null, 2));
    fs.writeFileSync(archiveFile, JSON.stringify(archive, null, 2));
    
    return { success: true };
  } catch (error) {
    console.error('Error archiving game:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('restore-game', async (event, gameId) => {
  try {
    // Load current archive
    let archive = [];
    if (fs.existsSync(archiveFile)) {
      const data = fs.readFileSync(archiveFile, 'utf8');
      archive = JSON.parse(data);
    }
    
    // Find game to restore
    const gameIndex = archive.findIndex(g => g.id === gameId);
    if (gameIndex === -1) {
      return { success: false, error: 'Game not found in archive' };
    }
    
    const gameToRestore = archive[gameIndex];
    delete gameToRestore.archivedAt;
    
    // Load current games
    let games = [];
    if (fs.existsSync(gamesFile)) {
      const gamesData = fs.readFileSync(gamesFile, 'utf8');
      games = JSON.parse(gamesData);
    }
    
    // Move game back to active
    games.push(gameToRestore);
    archive.splice(gameIndex, 1);
    
    // Save both files
    fs.writeFileSync(gamesFile, JSON.stringify(games, null, 2));
    fs.writeFileSync(archiveFile, JSON.stringify(archive, null, 2));
    
    return { success: true };
  } catch (error) {
    console.error('Error restoring game:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-archived-game', async (event, gameId) => {
  try {
    if (fs.existsSync(archiveFile)) {
      const data = fs.readFileSync(archiveFile, 'utf8');
      let archive = JSON.parse(data);
      
      const gameIndex = archive.findIndex(g => g.id === gameId);
      if (gameIndex > -1) {
        const game = archive[gameIndex];
        // Delete image file if exists
        if (game.imagePath && fs.existsSync(game.imagePath)) {
          fs.unlinkSync(game.imagePath);
        }
        archive.splice(gameIndex, 1);
        fs.writeFileSync(archiveFile, JSON.stringify(archive, null, 2));
      }
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting archived game:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('select-image', async () => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openFile'],
      filters: [
        { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'] }
      ]
    });
    
    if (!result.canceled && result.filePaths.length > 0) {
      const sourcePath = result.filePaths[0];
      const fileName = `${uuidv4()}${path.extname(sourcePath)}`;
      const destPath = path.join(imagesDir, fileName);
      
      // Copy image to app data directory
      fs.copyFileSync(sourcePath, destPath);
      
      return { success: true, imagePath: destPath, fileName };
    }
    
    return { success: false, canceled: true };
  } catch (error) {
    console.error('Error selecting image:', error);
    return { success: false, error: error.message };
  }
});

// Authentication IPC Handlers
ipcMain.handle('register-user', async (event, { username, email, password }) => {
  try {
    const user = await database.registerUser(username, email, password);
    const session = await database.createSession(user.id);
    return { success: true, user, sessionToken: session.sessionToken };
  } catch (error) {
    console.error('Error registering user:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('login-user', async (event, { username, password }) => {
  try {
    const user = await database.loginUser(username, password);
    const session = await database.createSession(user.id);
    return { success: true, user, sessionToken: session.sessionToken };
  } catch (error) {
    console.error('Error logging in user:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('validate-session', async (event, sessionToken) => {
  try {
    const user = await database.validateSession(sessionToken);
    return { success: true, user };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('logout-user', async (event, sessionToken) => {
  try {
    await database.logout(sessionToken);
    return { success: true };
  } catch (error) {
    console.error('Error logging out user:', error);
    return { success: false, error: error.message };
  }
});

// Chat IPC Handlers
ipcMain.handle('send-chat-message', async (event, { gameId, sessionToken, message }) => {
  try {
    const user = await database.validateSession(sessionToken);
    const chatMessage = await database.addChatMessage(gameId, user.id, message);
    return { success: true, message: { ...chatMessage, username: user.username, created_at: new Date().toISOString() } };
  } catch (error) {
    console.error('Error sending chat message:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-chat-messages', async (event, gameId) => {
  try {
    const messages = await database.getChatMessages(gameId);
    return { success: true, messages };
  } catch (error) {
    console.error('Error getting chat messages:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-chat-message', async (event, { messageId, sessionToken }) => {
  try {
    const user = await database.validateSession(sessionToken);
    const deleted = await database.deleteChatMessage(messageId, user.id);
    return { success: deleted };
  } catch (error) {
    console.error('Error deleting chat message:', error);
    return { success: false, error: error.message };
  }
});

// Online Users IPC Handlers
ipcMain.handle('join-game-chat', async (event, { gameId, sessionToken }) => {
  try {
    const user = await database.validateSession(sessionToken);
    await database.joinGameChat(user.id, gameId);
    return { success: true };
  } catch (error) {
    console.error('Error joining game chat:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('leave-game-chat', async (event, { gameId, sessionToken }) => {
  try {
    const user = await database.validateSession(sessionToken);
    await database.leaveGameChat(user.id, gameId);
    return { success: true };
  } catch (error) {
    console.error('Error leaving game chat:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-online-users', async (event, gameId) => {
  try {
    const users = await database.getOnlineUsers(gameId);
    return { success: true, users };
  } catch (error) {
    console.error('Error getting online users:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('update-user-activity', async (event, { gameId, sessionToken }) => {
  try {
    const user = await database.validateSession(sessionToken);
    await database.updateUserActivity(user.id, gameId);
    return { success: true };
  } catch (error) {
    console.error('Error updating user activity:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('get-user-message-count', async (event, userId) => {
  try {
    const count = await database.getUserMessageCount(userId);
    return { success: true, count };
  } catch (error) {
    console.error('Error getting user message count:', error);
    return { success: false, error: error.message };
  }
});

// Close database on app quit
app.on('before-quit', () => {
  if (database) {
    database.close();
  }
});

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev');
const Database = require('./electron-db');
const os = require('os');

let mainWindow;
let db;
let localIP = 'localhost';

// Get local IP address for LAN access
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'electron-preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const startUrl = isDev
    ? `http://${localIP}:3000`
    : `file://${path.join(__dirname, '.next/standalone/.next/server/pages')}/index.html`;

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
    console.log(`App running at: http://${localIP}:3000`);
    console.log(`Other devices on same network can access: http://${localIP}:3000`);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Initialize database
app.on('ready', () => {
  localIP = getLocalIP();
  db = new Database(path.join(app.getPath('userData'), 'finance.db'));
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC Handlers for Database Operations
ipcMain.handle('db:getTransactions', async () => {
  return db.getTransactions();
});

ipcMain.handle('db:addTransaction', async (event, transaction) => {
  return db.addTransaction(transaction);
});

ipcMain.handle('db:updateTransaction', async (event, id, transaction) => {
  return db.updateTransaction(id, transaction);
});

ipcMain.handle('db:deleteTransaction', async (event, id) => {
  return db.deleteTransaction(id);
});

ipcMain.handle('db:getGoals', async () => {
  return db.getGoals();
});

ipcMain.handle('db:addGoal', async (event, goal) => {
  return db.addGoal(goal);
});

ipcMain.handle('db:updateGoal', async (event, id, goal) => {
  return db.updateGoal(id, goal);
});

ipcMain.handle('db:deleteGoal', async (event, id) => {
  return db.deleteGoal(id);
});

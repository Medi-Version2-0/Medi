/* eslint-disable @typescript-eslint/no-var-requires */
const { app, BrowserWindow } = require('electron');
const url = require('url');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      // contextIsolation: false, // Disable context isolation for simplicity

    },
  });

  const startUrl = url.format({
    pathname: path.join(__dirname, './build/index.html'),
    protocol: 'file',
  });

  win.loadURL(startUrl);

  win.webContents.on('did-finish-load', () => {
    const { cookies } = win.webContents.session;
  
    // Log cookies for debugging
    cookies.get({}).then((cookies) => {
    });
  });
  // win.loadURL('http://localhost:3000'); // this is used only for testing purposes this will change in the future
}

app.whenReady().then(createWindow);

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

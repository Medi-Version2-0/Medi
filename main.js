const { app, BrowserWindow, dialog } = require("electron");
const url = require("url");
const path = require("path");

// Declare mainWindow globally
let mainWindow;

if (app) {
  const dbPath = path.join(app.getPath("userData"), "medi.db"); // todo : change the path of db
  process.env.dbPath = dbPath;
  // process.env.tpath = app.getPath("downloads")
}
// const { addLoginStatistics, updateLastLogoutTime } = require("./database/mongo")

// to make the shortcut for the exe file
// var cp = require('child_process');

// var handleSquirrelEvent = function() {
//    if (process.platform != 'win32') {
//       return false;
//    }

//    function executeSquirrelCommand(args, done) {
//       var updateDotExe = path.resolve(path.dirname(process.execPath),
//          '..', 'update.exe');
//       var child = cp.spawn(updateDotExe, args, { detached: true });

//       child.on('close', function(code) {
//          done();
//       });
//    };

//    function install(done) {
//       var target = path.basename(process.execPath);
//       executeSquirrelCommand(["--createShortcut", target], done);
//    };

//    function uninstall(done) {
//       var target = path.basename(process.execPath);
//       executeSquirrelCommand(["--removeShortcut", target], done);
//    };

//    var squirrelEvent = process.argv[1];

//    switch (squirrelEvent) {

//       case '--squirrel-install':
//          install(app.quit);
//          return true;

//       case '--squirrel-updated':
//          install(app.quit);
//          return true;

//       case '--squirrel-obsolete':
//          app.quit();
//          return true;

//       case '--squirrel-uninstall':
//          uninstall(app.quit);
//          return true;
//    }

//    return false;
// };

// if (handleSquirrelEvent()) {
//    return;
// }

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: "Medi",
    width: 810,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: true,
      preload: path.join(__dirname, "./preload.js"),
    },
  });
  // mainWindow.removeMenu()
  mainWindow.webContents.openDevTools(); // TODO: Remove in prod builds

  // const startUrl = url.format({
  //   pathname: path.join(__dirname, "./app/build/index.html"),
  //   protocol: 'file',
  // });
  // mainWindow.loadURL(startUrl) // Uncomment for production builds

  mainWindow.loadURL("http://localhost:3000"); // For local builds

  // Handle the 'close' event on the main window
  mainWindow.on("close", (event) => {
    // Show a confirmation dialog to the user
    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: "warning",
      title: "Confirm Exit",
      message:
        "Your all unsaved changes and tabs will be lost. Are you sure you want to quit?",
      buttons: ["Yes", "No"],
      defaultId: 1,
    });

    if (choice === 1) {
      // Prevent the window from closing
      event.preventDefault();
    }
  });
}

app.locale = "en-GB";

app.whenReady().then(createMainWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

let internetCheckInterval, updateInterval, mongoIdToUpdate, isInprogress;

// Function to check internet connectivity by attempting to fetch a resource
const checkInternetConnectivity = async () => {
  try {
    const response = await fetch("https://www.google.com", { method: "HEAD" });
    return response.ok; // Internet connection detected if response is ok
  } catch (error) {
    return false; // Internet connection not detected
  }
};

// Function to update database (example using Mongoose)
const updateDatabase = async () => {
  try {
    if (isInprogress) return;
    isInprogress = true;
    // Update last login time for a document (example)
    await updateLastLogoutTime(mongoIdToUpdate);
    isInprogress = false;
  } catch (error) {
    isInprogress = false;
    // console.error('Error updating database:', error);
    stopUpdateInterval(); // Clear update interval if error occurs
    startInternetCheckInterval(); // Restart internet check interval
  }
};

// Function to start internet check interval
const startInternetCheckInterval = () => {
  internetCheckInterval = setInterval(async () => {
    const isConnected = await checkInternetConnectivity();
    if (isConnected) {
      clearInterval(internetCheckInterval);
      startUpdateInterval(); // Start database update interval
    } else {
      // console.log('No internet connection. Waiting...');
    }
  }, 20 * 1000); // Check internet connectivity every 20 seconds
};

// Function to start database update interval
const startUpdateInterval = async () => {
  try {
    if (!mongoIdToUpdate) {
      const statsObj = await addLoginStatistics();
      if (statsObj && statsObj._id) mongoIdToUpdate = statsObj._id;
      else return startInternetCheckInterval();
    }
    updateInterval = setInterval(updateDatabase, 10 * 60 * 1000); // Run update every 10 minutes
  } catch (error) {
    // console.error('Error starting the database interval:', error);
    startInternetCheckInterval(); // Restart internet check interval
  }
};

// Function to stop database update interval
const stopUpdateInterval = () => {
  clearInterval(updateInterval);
};

// Start internet check interval
startInternetCheckInterval();

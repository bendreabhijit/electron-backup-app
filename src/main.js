const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fsExtra = require("fs-extra");

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });
  //win.webContents.openDevTools();

  win.loadFile(path.join(__dirname, "index.html")).catch((err) => {
    console.error("Failed to load index.html:", err);
  });
}

app.whenReady().then(createWindow);

// Handle folder selection
ipcMain.handle("select-folder", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });
  return result.filePaths[0];
});

// Handle the backup process
ipcMain.on("start-backup", async (event, source, destination) => {
  try {
    const files = await fsExtra.readdir(source);
    let completed = 0;

    for (const file of files) {
      await fsExtra.copy(path.join(source, file), path.join(destination, file));
      completed += 1;
      const progress = Math.round((completed / files.length) * 100);
      event.sender.send("backup-progress", progress);
    }

    event.sender.send("backup-complete");
  } catch (error) {
    event.sender.send("backup-error", error.message);
  }
});

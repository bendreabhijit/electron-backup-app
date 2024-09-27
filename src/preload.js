const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  selectFolder: () => ipcRenderer.invoke("select-folder"),
  startBackup: (source, destination) =>
    ipcRenderer.send("start-backup", source, destination),
  onProgress: (callback) =>
    ipcRenderer.on("backup-progress", (event, progress) => callback(progress)),
  onBackupComplete: (callback) =>
    ipcRenderer.on("backup-complete", () => callback()),
  onBackupError: (callback) =>
    ipcRenderer.on("backup-error", (event, error) => callback(error)),
});

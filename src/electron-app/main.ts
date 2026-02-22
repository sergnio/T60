import { app, BrowserWindow } from "electron";

const createWindow = () => {
  const win = new BrowserWindow({
    fullscreen: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile("dist/index.html");
};

app.whenReady().then(() => {
  createWindow();

  // needed if we are not quitting the app on all window close.
  // app.on('activate', () => {
  //     if (BrowserWindow.getAllWindows().length === 0) {
  //         createWindow()
  //     }
  // })
});

app.on("window-all-closed", () => {
  app.quit();
});

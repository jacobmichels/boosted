const { app, BrowserWindow, autoUpdater, dialog} = require('electron');
const path = require('path');
require('update-electron-app')({
  repo:'jacobmichels/boosted',
  notifyUser:false
})

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

autoUpdater.on('update-downloaded',(event, releaseNotes, releaseName, releaseDate, updateURL)=>{
  const dialogOpts = {
    type: 'info',
    buttons: ['Restart','Later'],
    title: 'Application Update',
    message: process.platform === 'win32' ? releaseNotes : releaseName,
    detail: 'A new version has been downloaded. Click restart to apply the update.'
  }
  let index = dialog.showMessageBoxSync(dialogOpts);
  if(index===0){
    autoUpdater.quitAndInstall();
  }
})



const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 430,
    height: 280,
    backgroundColor:'#121212',
    webPreferences:{
      nodeIntegration:true,
    },
    show:false,
    frame:false,
    resizable:false
  });

  mainWindow.on('ready-to-show',()=>{
    mainWindow.show();
  })

  mainWindow.setMenu(null);
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.on('close',()=>{
    if (process.platform !== 'darwin') {
      app.quit();
    }
  })

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready',()=>{
  createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

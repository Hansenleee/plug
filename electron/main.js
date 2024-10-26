import { start, stop } from '../dist/index.js'
import { app, BrowserWindow, WebContentsView, Tray, Menu } from 'electron'
import path from 'node:path'

const logoPath = path.join(__dirname, '..', 'resources', 'images', 'electron-logo.png')
const createWindow = async () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: logoPath,
  })

  mainWindow.loadFile(path.join(__dirname, '..', 'electron', 'index.html'))
  await start({ debug: true, originProxyPort: '7890', source: 'APP' })

  const view1 = new WebContentsView()
  const [width, height] = mainWindow.getSize();

  mainWindow.contentView.addChildView(view1)
  view1.webContents.loadURL('http://localhost:9001/management')
  view1.setBounds({ x: 0, y: 0, width, height })

  mainWindow.on('resized', () => {
    const [width, height] = mainWindow.getSize();

    view1.setBounds({ x: 0, y: 0, width, height })
  });

  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow.hide();
    mainWindow.setSkipTaskbar(true);
  });
}

app.on('window-all-closed', () => {
  stop();

  if (process.platform !== 'darwin') {
    app.quit();
  }
})

app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    app.dock.setIcon(logoPath);

    const tray = new Tray(path.join(__dirname, '..', 'resources', 'images', 'app-dock-icon.png'))
    const contextMenu = Menu.buildFromTemplate([
      { label: '显示', type: 'radio', click: () => {
        const mainWindow = BrowserWindow.getAllWindows();

        if (mainWindow.length) {
          mainWindow[0].show();
          mainWindow[0].setSkipTaskbar(false);
        } else {
          createWindow();
        }
      }},
      { label: '退出', type: 'radio', click: () => {
        app.quit();
      }}
    ])
    tray.setContextMenu(contextMenu)
  }
}).then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
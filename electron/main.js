import { app, BrowserWindow, WebContentsView, Tray, Menu } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

global.__filename = __filename;
global.__dirname = __dirname;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
// import { start } from '../dist/index.js'

// console.log(11111, path.join(__dirname, '..', 'resources', 'images', 'electron-logo.png'));
const logoPath = path.join(__dirname, '..', 'resources', 'images', 'electron-logo.png')

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    icon: logoPath,
  })

  win.loadFile(path.join(__dirname, 'index.html'))
  // start({ debug: true, originProxyPort: '7890', source: 'APP' })

  // const view1 = new WebContentsView()
  // const [width, height] = win.getSize();

  // win.contentView.addChildView(view1)
  // view1.webContents.loadURL('http://localhost:9001/management')
  // view1.setBounds({ x: 0, y: 0, width, height })

  // win.on('resized', () => {
  //   const [width, height] = win.getSize();

  //   view1.setBounds({ x: 0, y: 0, width, height })
  // })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
  if (process.platform === 'darwin') {
    // app.setIcon(path.join(process.cwd(), 'resources', 'images', 'electron-logo.png'))
    app.dock.setIcon(logoPath);

    // const tray = new Tray(path.join(process.cwd(), 'resources', 'images', 'electron-logo.png'))
    // const contextMenu = Menu.buildFromTemplate([
    //   { label: 'Item1', type: 'radio' },
    //   { label: 'Item2', type: 'radio' },
    //   { label: 'Item3', type: 'radio', checked: true },
    //   { label: 'Item4', type: 'radio' }
    // ])
    // tray.setToolTip('This is my application.')
    // tray.setContextMenu(contextMenu)
  }
}).then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
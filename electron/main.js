import { app, BrowserWindow, WebContentsView } from 'electron'
import path from 'node:path'
import { start } from '../dist/index.js'

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(process.cwd(), 'electron', 'preload.js')
    }
  })

  win.loadFile(path.join(process.cwd(), 'electron', 'index.html'))
  start({ debug: true, originProxyPort: '7890' })

  const view1 = new WebContentsView()

  win.contentView.addChildView(view1)
  view1.webContents.loadURL('http://localhost:9001/management')
  view1.setBounds({ x: 0, y: 0, width: 800, height: 600 })

  win.on('resized', () => {
    const [width, height] = win.getSize();

    view1.setBounds({ x: 0, y: 0, width, height })
  })
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
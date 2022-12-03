const {
    app,
    BrowserWindow
} = require('electron')
const path = require('path')
const os = require("os")
const targetPath = path.join(os.homedir(), "example-project")
const {
    ipcMain
} = require('electron')
const fs = require("fs")

let win

function createWindow() {
    win = new BrowserWindow({
        width: 1000,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true
        },
    })

    win.loadFile(path.join(__dirname, "./index.html"))
    win.webContents.openDevTools()
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on("loadFiles", (e, data) => {
    const availableFiles = []

    if (!fs.existsSync(targetPath))
        fs.mkdirSync(targetPath)

    fs.readdirSync(targetPath).forEach(file => availableFiles.push(file))

    win.webContents.send("loadedFiles", {
        "fileList": availableFiles
    })
})

ipcMain.on("readFile", (e, data) => {
    const buffer = fs.readFileSync(path.join(targetPath, data.file))

    win.webContents.send("readyFile", {
        "buffer": buffer
    })
})
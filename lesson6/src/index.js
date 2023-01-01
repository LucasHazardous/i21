const {
    app,
    BrowserWindow,
    Menu,
    ipcMain,
    shell
} = require('electron')
const fs = require("fs")
const path = require('path')
const os = require("os")

let window

const tasksPath = path.join(os.homedir(), "todo")

const gotTheLock = app.requestSingleInstanceLock()

const menu = [
    {
        label: "File",
        submenu: [
            {
                label: "Path",
                click: () => shell.openPath(tasksPath),
                accelerator: "CmdOrCtrl+F"
            },
            {
                label: "Refresh",
                click: loadTasks,
                accelerator: "CmdOrCtrl+R"
            },
            {
                label: "Quit",
                click: app.quit,
                accelerator: "CmdOrCtrl+W"
            }
        ]
    }
]

function loadWindow() {
    window = new BrowserWindow({
        height: 800,
        width: 800,
        resizable: false,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    })

    window.loadFile(path.join(__dirname, "public", "index.html")).then(res => loadTasks())
    window.webContents.openDevTools()

    const newMenu = Menu.buildFromTemplate(menu)
    Menu.setApplicationMenu(newMenu)
}

if (!gotTheLock) {
	app.quit()
} else {
	app.on("second-instance", (e, cmd, dir) => {
		if (window) {
			if (window.isMinimized()) window.restore()
			window.focus()
		}
	})

    app.whenReady().then(() => {
        loadWindow()
    
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) loadWindow()
        })
    })
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin' || process.env.NODE_ENV === 'dev') app.quit()
})

function loadTasks() {
    if (!fs.existsSync(tasksPath))
        fs.mkdirSync(tasksPath)

    const tasks = []
    fs.readdirSync(tasksPath).forEach(file => tasks.push({...JSON.parse(fs.readFileSync(path.join(tasksPath, file), "utf8")), trueFilename: file}))

    window.webContents.send("loadedTasks", {
        "taskList": tasks
    })
}

function addTask(e, data) {
    fs.writeFileSync(path.join(tasksPath, data.task.title + Date.now() + ".json"), JSON.stringify(data.task), "utf8")
    loadTasks()
}

function switchTask(e, data) {
    const fileLocation = path.join(tasksPath, data.trueFilename)
    const task = JSON.parse(fs.readFileSync(fileLocation, "utf8"))
    task.completed = !task.completed
    fs.writeFileSync(fileLocation, JSON.stringify(task), "utf8")
    loadTasks()
}

ipcMain.on("createTask", addTask)

ipcMain.on("switchTask", switchTask)

if(process.env.NODE_ENV === 'dev')
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron'),
    })
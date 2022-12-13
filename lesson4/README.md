# Building an Electron app - continuation

> In this lesson you will reinforce your Electron knowledge by building a todo list app.

### Task

Initialize new Electron project and install Bulma framework with npm, add a *start* script.

<details>
    <summary>Solution</summary>

Make sure you have NodeJS installed and execute:

```
npm init -y
npm install -D electron
npm install bulma
```

package.json
```json
"scripts": {
    "start": "electron ."
},
```

</details>

<br>

### Electron Overview

Electron has multi-process architecutre and is very similar to a modern web browser. Electron app has a single main process (which is controlled through *app* module) that is application's entry point. Each instance of the *BrowserWindow* class creates an application window that loads a web page in a separate renderer process. Renderer is responsible for rendering web content and behaves according to web standards implemented in [Chromium](https://en.wikipedia.org/wiki/Chromium_(web_browser)). Renderer has no direct access to require or other NodeJS APIs.
Preload scripts contain code that executes in a renderer process before its web content begins loading. These scripts run within the renderer context, but are granted more privileges by having access to NodeJS APIs.

### IPC

In Electron, processes communicate by passing messages through developer-defined "channels" with the ipcMain and ipcRenderer modules. These channels are **arbitrary** (you can name them anything you want) and **bidirectional** (you can use the same channel name for both modules).

Instantiate *preload.js* with the following content:

```js
const {
    contextBridge,
    ipcRenderer
} = require('electron')

contextBridge.exposeInMainWorld("ipcRenderer", {
    send: (channel, data) => ipcRenderer.send(channel, data),
    on: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
})
```

Create an *index.html* file in *public* directory:

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'" />
    <meta http-equiv="X-Content-Security-Policy" content="default-src 'self'; script-src 'self'" />
    <title>Todo-list</title>
    <link rel="stylesheet" href="style.css">
</head>

<body>
    <div class="control p-4">
        <input id="title" class="input" type="text" placeholder="Title">
        <input id="description" class="input" type="text" placeholder="Description">
        <div class="select">
            <select id="priority">
              <option selected value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
        </div>
        <button id="createBtn" class="button is-primary">Create</button>
    </div>
    <div id="taskList" class="p-4"></div>
</body>
<script src="renderer.js"></script>
</html>
```

In *public* folder also create *renderer.js* and *style.css*:

```css
@import "../node_modules/bulma/css/bulma.css";

body {
    user-select: none;
}
::-webkit-scrollbar {
	display: none;
}
```

In *index.js* import the following modules that will be neccessary for the rest of this tutorial:

```js
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
```

### Task

Write a *loadWindow* function that assigns new BrowserWindow instance to a global *window* variable and executes it when app is ready. Set height to 800 and width to 1300. 

<details>
    <summary>Solution</summary>

```js
let window

function loadWindow() {
    window = new BrowserWindow({
        height: 800,
        width: 1300,
        resizable: false,
        webPreferences: {
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
        }
    })

    window.loadFile(path.join(__dirname, "public", "index.html"))
    window.webContents.openDevTools()
}

app.whenReady().then(() => {
    loadWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) loadWindow()
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
```

</details>

### Task

Write a function to load and to add a task, tasks should be loaded from todo folder in user's home directory and sent to renderer. Tasks should be saved as json files when received from renderer.

Task created by the user can look like:

```json
{
    "priority": "high",
    "title": "Clean room",
    "completed": false,
    "description": "Put trash in the bin"
}
```

Create appropriate html elements to display tasks, add form for creating tasks, use Bulma styling.

### Task

Add a Menu to the app that includes various options under File section for example:

- Path <kbd>CmdOrCtrl+F</kbd>
- Refresh <kbd>CmdOrCtrl+R</kbd>
- Quit <kbd>CmdOrCtrl+W</kbd>
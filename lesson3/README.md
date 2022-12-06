# Building an Electron app

> In this lesson you will learn Electron basics and build an amazing desktop app to read pdfs.

Our goal is to build an app that will load pdfs from a directory and enable user to read them in the app.

Electron is a framework for building desktop applications using JavaScript, HTML, and CSS. It embeds Chromium and Node.js into its binary, it allows to create cross-platform apps that work on Windows, macOS and Linux.

Benefits of using Electron include:
* extended accessibility (you can operate on files)
* fast development (UI is built just like a standard website, the rest is Node.js app, for both additional frameworks/modules can be installed)
* cross-platform (apps work on Windows, macOS and Linux)

## Setup

Install newest LTS releast of Node.js. Make a new directory, enter it and create package.json with npm, when asked about main entry, enter **main.js**:

```
npm init
```

Then install Electron:

```
npm install --save-dev electron
```

and add a start script:

```json
"scripts": {
    "start": "electron ."
}
```

After creating **main.js** place for example a `console.log("hello")` and run:

```
npm start
```

## Electron basics

Now let's add some imports to our **main.js**:

```js
const {
    app, // controls your application's event lifecycle
    BrowserWindow // creates and manages app windows
} = require('electron')
const path = require('path') // provides utilities for working with file and directory paths
```

path module is included in Node.js by default so you don't have to worry about installing it.

Create an **index.html** and provide it with the following content:

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'" />
    <meta http-equiv="X-Content-Security-Policy" content="default-src 'self'; script-src 'self'" />
    <title>example-project</title>
</head>

<body>
    hello there
</body>
</html>
```

Notice the meta elements, they set [Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP), it *controls what resources the user agent is allowed to load for that page*.

This function is responsible for creating a window that will work similarly to a browser tab and load our html file.

```js
let win

function createWindow () {
    win = new BrowserWindow({
        width: 800,
        height: 600,
    })

    win.loadFile(path.join(__dirname, "./index.html"))
    win.webContents.openDevTools()
}
```

To make Electron create a our window we need to tell him to do so when it's ready:

```js
app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})
```

Electron is cross-platform but different operating systems can work differently in some ways, we want to take care of those edges cases. macOS users may be used to program still running in the background when the window is closed:

```js
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})
```

When you run `npm start` now you should see a window with your html file.

## Connecting Node.js with BrowserWindow

Now create two new files: **preload.js** and **renderer.js**.

Add the following to object passed as an argument to new BrowserWindow instance:

```js
webPreferences: {
    preload: path.join(__dirname, 'preload.js'), // tells which script to load as a preload
    contextIsolation: true // ensures that both your preload scripts and Electron's internal logic run in a separate context, enabling it will stop showing warnings in the console
},
```

Because we can't use Node.js modules in the browser by default so we need a solution to share those modules with our browser code.

When we put this code into preload.js we will grant our renderer.js, which will be executed in the browser, an ability to send events to main.js.

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

> IPC = Inter-Process Communication

*Notice how function calls are wrapped inside helper arrow functions. You never want to directly expose the entire ipcRenderer module via preload. This would give your renderer the ability to send arbitrary IPC messages to the main process, which becomes a powerful attack vector for malicious code.*

Task\
Add a div, a button and an iframe to our index.html. Connect renderer.js to index.html and assign html elements to variables with getElementById. 

<details>
    <summary>Solution</summary>

**index.html**

```html
<body>
    <button id="reloadBtn">Load</button>
    <div id="fileList"></div>
    <iframe id="iframeElement"></iframe>
</body>
<script src="renderer.js"></script>
```

**renderer.js**

```js
const fileList = document.getElementById("fileList")
const iframeElement = document.getElementById("iframeElement")
const reloadBtn = document.getElementById("reloadBtn")
```

</details>

Now that we have preload.js configured we can send events to Node.js as well as receive events from it.

```js
reloadBtn.addEventListener("click", () => {
    ipcRenderer.send("loadFiles")
})

ipcRenderer.on("loadedFiles", (data) => {
    fileList.innerText = data.fileList
})
```

Let's assign a directory from which we will be reading files from:

```js
const os = require("os")
const targetPath = path.join(os.homedir(), "example-project")
```

In our main.js we will import ipcMain to let it receive and sent events to our browser.

```js
const {
    ipcMain
} = require('electron')
const fs = require("fs")

ipcMain.on("loadFiles", (e, data) => {
    const availableFiles = []

    // creates directory if it doesn't exist
    if (!fs.existsSync(targetPath))
        fs.mkdirSync(targetPath)

    // pushes each file to an array
    fs.readdirSync(targetPath).forEach(file => availableFiles.push(file))

    // sends availableFiles to the browser
    win.webContents.send("loadedFiles", {
        "fileList": availableFiles
    })
})
```

Feel free to add some pdf files to *your_home_directory*/example-project and test the app. 

Now let's transform our loadedFiles event handler (**preload.js**):

```js
ipcRenderer.on("loadedFiles", (data) => {
    // clear fileList
    fileList.innerHTML = ""
    // for each found file create a button that when clicked tells Node.js to read selected file
    data.fileList.forEach(file => {
        const fileElement = document.createElement("button")
        fileElement.innerText = file

        fileElement.addEventListener("click", () => {
            ipcRenderer.send("readFile", {
                file
            })
        })
        
        fileList.appendChild(fileElement)
    })
})
```

For each file a button will be created that on click will send a request to load a selected file. That event of course has to be handled in our **main.js**:

```js
ipcMain.on("readFile", (e, data) => {
    const buffer = fs.readFileSync(path.join(targetPath, data.file))

    win.webContents.send("readyFile", {
        buffer
    })
})
```

Now let's load this file into our iframe (**preload.js**):

```js
ipcRenderer.on("readyFile", (data) => {
    const blob = new Blob([data.buffer], {
        type: 'application/pdf'
    })
    const url = window.URL.createObjectURL(blob)
    iframeElement.setAttribute("src", url)
})
```

Try to run the app now. What happens? You get an error? It seems like we have to change Content Security Policy directive. Change both Content-Security-Policy meta tags:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline'; script-src 'self'; frame-src blob:" />
<meta http-equiv="X-Content-Security-Policy" content="default-src 'self' 'unsafe-inline'; script-src 'self'; frame-src blob:" />
```

## Summary

In an Electron app we can take advantage of available Node.js modules while writing the UI for our app in simple HTML and Javascript. We learned how to create a basic window and how to open our app. We took advantage of accessing filesystem and accessed local files. But before that we discovered IPC and how to make our frontend code communicate with Node.js in both ways.

## Assignment

> Warning! When sending the assignment **do not send node_modules** folder. Include project files in ***name_surname.zip*** archive.

You can use [this project](https://github.com/LucasHazardous/music-player) as a reference.

Use code provided in this lesson to implement the following functionality:

After each file read add an entry (entry = filename + newline character) to file called *.history* which should be located in *targetPath* defined in [example-project](./src/main.js).

Add a [Menu](https://www.electronjs.org/docs/latest/api/menu) to your app that consists of one tab called **File** which contains three elements:
* **Load history** <kbd>Cmd/Ctrl+H</kbd> - sends history to renderer which prints it onto the console, do not forget to set the encoding to **utf8**!, when trying to read the file after it has been removed print null
* **Clear history** <kbd>Cmd/Ctrl+C</kbd> - removes the file
* **Quit** <kbd>Cmd/Ctrl+W</kbd> - closes the app *Hint: for this use built-in function app.quit*

> Warning! When you load the files make sure to **not display the .history file**.

Use these **fs** functions:
- [existsSync](https://nodejs.org/api/fs.html#fsexistssyncpath)
- [readFileSync](https://nodejs.org/api/fs.html#fsreadfilesyncpath-options)
- [unlinkSync](https://nodejs.org/api/fs.html#fsunlinksyncpath)
- [appendFileSync](https://nodejs.org/api/fs.html#fsappendfilesyncpath-data-options)

## Extra Assignment Extension

Use a framework like [Bulma](https://bulma.io/) or [Tailwind](https://tailwindcss.com/) or write your own style to make the app more user friendly. Add custom features that extends app functionality. You can also play with app settings: change icon, hide the console and display history in custom element (but other task requirements still apply, ex. when there is no file display null).
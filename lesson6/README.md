# Important Electron aspects

> In this lesson you will discover variety of ways to extend your Electron knowledge: building an app, preventing multiple app instances running at the same time and hot reload for development.

---

## Hot reload

When we develop an Electron app we introduce small changes in code and in case of modifying app appearance, it is time saving to see the changes instantly. Hot reload provides that. Whenever we save a file our app will be quickly restarted.

Install development dependency [electron-reload](https://www.npmjs.com/package/electron-reload) with:

    npm install -D electron-reload

Now we add the following piece of code to our main Node.js entry point:

```js
// import path only if not present
const path = require('path')

if(process.env.NODE_ENV === 'dev')
    require('electron-reload')(__dirname, {
        electron: path.join(__dirname, 'node_modules', '.bin', 'electron')
    })
```

---

## Building app executable

Install [electron-builder](https://www.electron.build/):

```
npm i -D electron-builder
```

Add build script:

```json
"scripts": {
    "start": "electron .",
    "build": "electron-builder"
},
```

as well as repository information (change url to your own repository link), see [package.json](./src/package.json) for reference:

```json
"repository": {
    "type": "git",
    "url": "git+https://github.com/lucashazardous/i21.git"
}
```

and run:

```
npm run build
```

Architecture and os will be automatically detected. **dist** directory should appear containing exe installer in case of Windows.

---

## Preventing multiple app instances

In our Node.js main entry define a variable:

```js
const gotTheLock = app.requestSingleInstanceLock() // The return value of this method indicates whether or not this instance of your application successfully obtained the lock. If it failed to obtain the lock, you can assume that another instance of your application is already running with the lock and exit immediately.
```

So according to the documentation we can do this:

```js
// another instance of your application is already running with the lock so exit
if (!gotTheLock) {
	app.quit()
// first instance
} else {
    // This event will be emitted inside the primary instance of your application when a second instance has been executed and calls app.requestSingleInstanceLock(). When that happens we just restore the window if minimized and set focus on it.
	app.on("second-instance", (e, cmd, dir) => {
		if (window) {
			if (window.isMinimized()) window.restore()
			window.focus()
		}
	})

    // standard window loading when app is ready
    app.whenReady().then(() => {
        loadWindow()
    
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) loadWindow()
        })
    })
}
```

---

## The end

In this lesson you discovered three useful techniques for Electron app development. The last one (Preventing multiple app instances) you may not necessarily need, it depends on your app's constraints. Generally when developing a simple application it is worth to consider if you need multiple instances. 
electron-builder is very powerful tool that can automatically build and publish releases and allowing easily implementing app update functionality.
Hot reload can be a time-saver, especially when developing app UI.
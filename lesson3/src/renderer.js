const fileList = document.getElementById("fileList")
const iframeElement = document.getElementById("iframeElement")
const reloadBtn = document.getElementById("reloadBtn")

reloadBtn.addEventListener("click", () => {
    ipcRenderer.send("loadFiles")
})

ipcRenderer.on("loadedFiles", (data) => {
    fileList.innerHTML = ""
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

ipcRenderer.on("readyFile", (data) => {
    const blob = new Blob([data.buffer], {
        type: 'application/pdf'
    })
    const url = window.URL.createObjectURL(blob)
    iframeElement.setAttribute("src", url)
})
const taskList = document.getElementById("taskList")
const title = document.getElementById("title")
const description = document.getElementById("description")
const priority = document.getElementById("priority")
const createBtn = document.getElementById("createBtn")

const priorityMap = {
    "low": "is-success",
    "medium": "is-warning",
    "high": "is-danger"
}

ipcRenderer.on("loadedTasks", (data) => {
    console.log(data.taskList)
    taskList.innerHTML = ""
    data.taskList.forEach(task => {
        const taskElement = document.createElement("div")

        const heading = document.createElement("div")
        heading.classList.add("panel-heading")
        heading.innerText = task.title

        taskElement.classList.add(...["panel", priorityMap[task.priority]])
        taskElement.appendChild(heading)

        const content = document.createElement("div")
        content.classList.add("panel-block")
        content.innerText = task.description
        taskElement.appendChild(content)

        const completed = document.createElement("a")
        completed.classList.add(...["panel-block", task.completed ? "has-text-success" : "has-text-danger"])
        completed.innerText = task.completed
        completed.addEventListener("click", () => {
            ipcRenderer.send("switchTask", {
                trueFilename: task.trueFilename
            })
        })
        taskElement.appendChild(completed)
        
        taskList.appendChild(taskElement)
    })
})

createBtn.addEventListener("click", () => {
    ipcRenderer.send("createTask", {
        task: {
            completed: false,
            priority: priority.value,
            title: title.value,
            description: description.value
        }
    })
})
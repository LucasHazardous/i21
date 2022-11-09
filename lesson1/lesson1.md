# PyQt Basics

> In this lesson you will learn about APIs, PyQt and you will create you first PyQt desktop application.

---

## What is PyQt?

PyQt6 is a "comprehensive set of Python bindings for Qt". Where Qt is "set of cross-platform C++ libraries that implement high-level APIs for accessing many aspects of modern desktop and mobile systems". For simplicity we can just assume that it is a Python framework for desktop applications using Qt with C++ under the hood.


## Basic Window

For this lesson we will be use Python version 3.11.0 but any version compatible with PyQt6 is also ok.
Install PyQt version 6 with the following command:

```
pip install PyQt6
```

Our next step is creating an empty file with the following imports:

```py
import sys
from PyQt6.QtWidgets import QWidget, QApplication
```

QWidget is a base class for all user interface objects. In this class we will be adding all GUI related elements.

Create your own class that inherits QWidget and name it whatever you want:

```py
class Window(QWidget):
    def __init__(self):
        super().__init__()
        self.setFixedHeight(600)
        self.setFixedWidth(1000)
        self.setWindowTitle("Project App")
```

This class contains a call to the QWidget constructor as well as method calls to the inherited methods.
Methods here are self explanatory, fixed height and width means that the window will not be resizable.

After our class definiton we will make one instance of it and the following code will show and keep the app running:

```py
app = QApplication(sys.argv)
win = Window()

win.show()
sys.exit(app.exec())
```

## PyQt Elements

Let's add some more imports to our code.

```py
from PyQt6.QtWidgets import QWidget, QApplication, QPushButton, QLabel
```

QPushButton is a button that when clicked will execute connected action and QLabel is just a container for Python strings.

Add the following code to your QWidget inhereting class' constructor (in my case Window constructor):

```py
button = QPushButton("Button", self)
label = QLabel("Label", self)
```

When you run this app the elements will overlap each other. How to fix it?
We will use on each of them setGeometry method that will relocate and resize them.

```py
button.setGeometry(100, 100, 100, 100)
label.setGeometry(300, 100, 100, 100)
```

For changing things like color of the button use setStyleSheet:

```py
button.setStyleSheet("color:blue")
```

Learn more about stylesheets [here](https://doc.qt.io/qtforpython/overviews/stylesheet-examples.html).

## Layouts

QVBoxLayout is used to construct vertical box layouts, elements will be placed one under another and properly resized horizontally.

```py
layout = QVBoxLayout(self)
button = QPushButton("Button")
label = QLabel("Label")
layout.addWidget(button)
layout.addWidget(label)
```

This will create a layout inside our Window class and place elements in a vertical column, remember to import QVBoxLayout.

To attach an action to our button:

```py
button.clicked.connect(lambda: print("Button Clicked"))
```

## API requests

For this projects we will use two APIs:

- [NewsAPI](https://newsapi.org/)
- [wttr.in](https://wttr.in/)

Sending a GET request to an API in Python looks like this:

```py
import requests
response = requests.get("https://wttr.in/?format=j2").json()
print(response)
```

Response stores Python dict that is received by converting JSON into it. The *?format=j2* is a query that tells the API that we want to receive JSON response.

## Final project

Project for our lesson is making an application that gets current weather conditions and list of news based on entered text.
Remember to add imports for all elements or do `from PyQt6.QtWidgets import`.

Create a basic window and inside it create:

- a label for showing current weather conditions
- a button for refreshing data

and add them to the QVBoxLayout.

<details>
    <summary>Solution</summary>

```py
weatherLabel = QLabel("Weather data")
refreshBtn = QPushButton("Refresh")

boxLayout = QVBoxLayout(self)

boxLayout.addWidget(refreshBtn)
boxLayout.addWidget(weatherLabel)
```

</details>

Okay now let's introduce two new elemente: QLineEdit (text input field) and QScrollArea (area that allows scrolling when list of elements does not fit in the application).

```py
self.newsSearchInput = QLineEdit()
  
self.scroll = QScrollArea()
self.scroll.setWidgetResizable(True)
        
boxLayout.addWidget(self.newsSearchInput)
boxLayout.addWidget(self.scroll)
```

Why did we define these elements with *self.*? Later our code will be split up into functions (it is not a good practice to make the entire app in one function - in this case constructor). Add self. prefix to our weatherLabel as well in case we need to edit its value.

The following function will be used for generating our list of news. Two new elements are introduced: QFormLayout and QGroupBox.

```py
def updateNewsSection(self):
    formLayout = QFormLayout()
    groupBox = QGroupBox("Articles")
        
    for i in range(100):
        l = QLabel(str(i))
        b = QPushButton(f"Print {i}")
        b.clicked.connect((lambda v: lambda: print(v))(i))
        formLayout.addRow(l, b)
            
    groupBox.setLayout(formLayout)
    self.scroll.setWidget(groupBox)
```

What does `lambda v: lambda: print(v))(i)` mean? This creates a function that is immediately called and produces new function `lambda: print(v)` where v is replaced by the given argument i. For each button a different function will be created with a copy of i from each iteration.

Call this function in your constructor to get a list of label-button pairs.

Now let's replace data in our list with actual articles.

```py
res = r.get(f"https://newsapi.org/v2/everything?q={self.newsSearchInput.text()}&apiKey=API_KEY&pageSize=50&page=1").json()
data = res['articles']
```

This call to NewsAPI (API_KEY is your key that you can check in your profile on NewsAPI website) will return results for topic given in our QLineEdit.

Modify your list generating loop accordingly to display article headlines and copy article links to the clipboard:

```py
for article in data:
    l = QLabel(article["title"])
    b = QPushButton(article["source"]["name"])
    b.clicked.connect((lambda v: lambda: QApplication.clipboard().setText(v))(article["url"]))
    formLayout.addRow(l, b)
```

Now connect the updateNewsSection method to your refreshBtn.
<details>
    <summary>Solution</summary>

```py
refreshBtn.clicked.connect(self.updateNewsSection)
```

</details>

Can you come up with a function that shows some weather parameters? Then add the call to this function in your constructor.

<details>
    <summary>Solution</summary>

```py
def updateWeatherDataInfo(self):
    res = requests.get("https://wttr.in?format=j2").json()
    temp = res['current_condition'][0]['temp_C']
    area = res['nearest_area'][0]['areaName'][0]['value']
    self.weatherLabel.setText(f"{temp}°C in {area}")
```

</details>

# The End

See the [example project](./project.py) for reference.
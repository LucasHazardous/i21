import sys, requests
from PyQt6.QtWidgets import QWidget, QApplication, QPushButton, QLabel, QFormLayout, QScrollArea, QVBoxLayout, QGroupBox, QLineEdit

class Window(QWidget):
    def __init__(self):
        super().__init__()
        self.setFixedHeight(600)
        self.setFixedWidth(1000)
        self.setWindowTitle("Project App")
        
        self.weatherLabel = QLabel("Weather data")
        self.updateWeatherDataInfo()
        
        refreshBtn = QPushButton("Refresh")
        refreshBtn.clicked.connect(self.updateNewsSection)

        self.newsSearchInput = QLineEdit()

        boxLayout = QVBoxLayout(self)
        
        self.scroll = QScrollArea()
        self.scroll.setWidgetResizable(True)
        
        boxLayout.addWidget(refreshBtn)
        boxLayout.addWidget(self.weatherLabel)
        boxLayout.addWidget(self.newsSearchInput)
        boxLayout.addWidget(self.scroll)
        
    def updateNewsSection(self):
        targetSearch = self.newsSearchInput.text()
        if(targetSearch.strip() == ""): return
        formLayout = QFormLayout()
        groupBox = QGroupBox("Articles")
        
        res = requests.get(f"https://newsapi.org/v2/everything?q={targetSearch}&apiKey=API_KEY&pageSize=50&page=1").json()
        data = res['articles']
        
        for article in data:
            l = QLabel(article["title"])
            b = QPushButton(article["source"]["name"])
            b.clicked.connect((lambda v: lambda: QApplication.clipboard().setText(v))(article["url"]))
            formLayout.addRow(l, b)
            
        groupBox.setLayout(formLayout)
        self.scroll.setWidget(groupBox)
        
    def updateWeatherDataInfo(self):
        res = requests.get("https://wttr.in?format=j2").json()
        temp = res['current_condition'][0]['temp_C']
        area = res['nearest_area'][0]['areaName'][0]['value']
        self.weatherLabel.setText(f"{temp}°C in {area}")
        
app = QApplication(sys.argv)
win = Window()

win.show()
sys.exit(app.exec())
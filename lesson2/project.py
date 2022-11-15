from PyQt6.QtWidgets import QApplication, QWidget, QLineEdit, QVBoxLayout, QLabel, QPushButton
import sys, rsa

class Window(QWidget):
    def __init__(self):
        super().__init__()
        self.setFixedHeight(400)
        self.setFixedWidth(1000)
        self.encryptedMessage = None
        
        (self.pubkey, self.privkey) = rsa.newkeys(512)
        
        layout = QVBoxLayout(self)
        
        self.messageInput = QLineEdit("")
        encryptBtn = QPushButton("Encrypt")
        encryptBtn.clicked.connect(self.encrypt)
        decryptBtn = QPushButton("Decrypt")
        decryptBtn.clicked.connect(self.decrypt)
        
        self.label = QLabel("")
        
        layout.addWidget(self.messageInput)
        layout.addWidget(encryptBtn)
        layout.addWidget(decryptBtn)
        layout.addWidget(self.label)
        
    def encrypt(self):
        self.encryptedMessage = rsa.encrypt(self.messageInput.text().encode('utf8'), self.pubkey)
        self.label.setText(str(self.encryptedMessage))
        
    def decrypt(self):
        if(self.encryptedMessage == None): return
        decryptedMessage = rsa.decrypt(self.encryptedMessage, self.privkey)
        self.label.setText(decryptedMessage.decode("utf8"))

app = QApplication(sys.argv)

win = Window()
win.show()

sys.exit(app.exec())
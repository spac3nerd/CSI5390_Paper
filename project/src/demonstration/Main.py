import wx
import threading
from App.TestingFrame import TestFrame

app    = wx.App(False)
window = TestFrame(None)

window.Show()
app.MainLoop()

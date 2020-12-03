import sys
sys.path.append("../centralData")
from .utils import BrowserManager

import Clients

import wx
import time

gameDescriptor = "game"
testDescriptor = "testing"

# ctrlClient = Clients.Control(ip,9090)
# dataClient = Clients.Data(ip,9091)



def GetDataClient():
    with ctrlClient as ctrl:
        ctrl.Client.StartDataServer(9091)
    dataClient.AutoConnect()

def AddItem(text,panel,sizer):
    temp = DispPanel(text,parent=panel)
    sizer.Add(temp,0,wx.ALL,5)
    return temp

def Init():
    browser = BrowserManager()
    browser.AddBasePage('http://'+ip)
    browser.AddSubPage(gameDescriptor,"")
    browser.AddSubPage(testDescriptor,"unitTesting")
    return browser


class DispPanel(wx.Panel):
    def __init__(self,name,*args,**kwargs):
        wx.Panel.__init__(self,*args,**kwargs)
        self.HorizontalSizer = wx.BoxSizer(wx.HORIZONTAL)
        self.LabelT          = wx.StaticText(self,wx.ID_ANY,label="Test: ")
        self.Text            = wx.StaticText(self,wx.ID_ANY,label=name,style=wx.BORDER_RAISED)
        self.HorizontalSizer.Add(self.LabelT,0,wx.ALL,2)
        self.HorizontalSizer.Add(self.Text,0,wx.ALL,2)
        self.SetSizer(self.HorizontalSizer)

    def GetValue(self):
        return self.Text.GetValue()

    def MarkFailed(self):
        self.Text.SetBackgroundColour(wx.RED)
    def MarkSucceeded(self):
        self.Text.SetBackgroundColour(wx.GREEN)

    def SetValue(self,v):
        self.Text.SetLabel(str(v))

class View(wx.Panel):
    def __init__(self,*args,**kwargs):
        wx.Panel.__init__(self,*args,**kwargs)
        self.Horiz    = wx.BoxSizer(wx.VERTICAL)
        self.Sz       = wx.BoxSizer(wx.VERTICAL)
        self.BtnSizer = wx.BoxSizer(wx.HORIZONTAL)

        self.servers = ["127.0.0.1","173.255.226.26"]
        self.current = 0
        self.ip      = self.servers[self.current]

        self.Panel    = wx.Panel(self,id=wx.ID_ANY,style=wx.BORDER_SUNKEN)
        self.BPanel   = wx.Panel(self,id=wx.ID_ANY)

        self.textDisp = wx.StaticText(self.BPanel,wx.ID_ANY,label="Using: "+self.ip)
        self.button1  = wx.Button(self.BPanel,label='ToggleServer')
        self.button2  = wx.Button(self.BPanel,label='CheckTests')
        self.button3  = wx.Button(self.BPanel,label='PopulateTests')
        self.button4  = wx.Button(self.BPanel,label='RunTests')

        self.button1.Bind(wx.EVT_BUTTON,self.Toggle)
        self.button2.Bind(wx.EVT_BUTTON,self.OnSecond)
        self.button4.Bind(wx.EVT_BUTTON,self.OnRun)
        self.button3.Bind(wx.EVT_BUTTON,self.OnCheckTests)

        self.BtnSizer.Add(self.button1,0,wx.ALL,5)
        self.BtnSizer.Add(self.button2,0,wx.ALL,5)
        self.BtnSizer.Add(self.button4,0,wx.ALL,5)
        self.BtnSizer.Add(self.button3,0,wx.ALL,5)
        self.BtnSizer.Add(self.textDisp,0,wx.ALL,5)

        self.Horiz.Add(self.BPanel,0,wx.ALL,5)
        self.Horiz.Add(self.Panel,0,wx.ALL,5)

        self.BPanel.SetSizer(self.BtnSizer)
        self.Panel.SetSizer(self.Sz)
        self.SetSizer(self.Horiz)

        self.FirstRun = True
        self.Disps = []
        # self.LoadTestThings()
        self.SetEnabledButton(3)
        self.button1.Enable()

    def ClearPanel(self):
        for item in self.Disps:
            item.Destroy()
        self.Disps = []
        self.Horiz.Layout()
        self.GetParent()._Resize()

    def SetEnabledButton(self,*btns):
        buttons = [self.button1,self.button2,self.button4,self.button3]
        for button in buttons:
            button.Disable()
        for i,button in enumerate(buttons):
            if(i in btns):
                button.Enable()
    def LoadTestThings(self):
        self.browser = BrowserManager()
        self.browser.AddBasePage('http://'+self.ip)
        self.browser.AddSubPage(gameDescriptor,"")
        self.browser.AddSubPage(testDescriptor,"unitTesting")
        if(self.FirstRun==False):
            if(self.ctrlClient.DefaultIp != self.ip):
                self.ctrlClient.Transport.close()
                self.dataClient.Transport.close()
        self.ctrlClient = Clients.Control(self.ip,9090)
        self.dataClient = Clients.Data(self.ip,9091)

    def Toggle(self,event):
        self.current += 1
        self.current = self.current%2
        self.ip = self.servers[self.current]
        self.textDisp.SetLabel("Using: "+self.ip)
        self.ClearPanel()

    def OnRun(self,event):
        self.SetEnabledButton(-1)
        self.dataClient.RunTests(len(self.Disps))
        time.sleep(2)
        self.SetEnabledButton(1)

    def OnSecond(self,event):
        res = self.dataClient.GetTestResults()
        for a,b in res:
            if(b==True):
                self.Disps[a-1].MarkSucceeded()
                self.Disps[a-1].Refresh()
            else:
                self.Disps[a-1].MarkFailed()
                self.Disps[a-1].Refresh()
        self.SetEnabledButton(0,3)

    def OnCheckTests(self,event):
        print("size: {}".format(self.Horiz.GetSize()))
        self.ClearPanel()
        self.SetEnabledButton(-1)
        self.LoadTestThings()
        self.browser.Load(testDescriptor)
        time.sleep(2)
        print("size: {}".format(self.Horiz.GetSize()))

        with self.ctrlClient as ctrl:
            ctrl.Client.StartDataServer(9091)
        self.dataClient.AutoConnect()
        self.FirstRun = False

        cases = self.dataClient.GetTestCases()
        for item in cases:
            self.Add(item)
        self.Horiz.Layout()
        self.SetEnabledButton(2)

    def Add(self,text):
        self.Disps.append(AddItem(text,self.Panel,self.Sz))


class TestFrame(wx.Frame):
    def __init__(self,*args,**kwargs):
        wx.Frame.__init__(self,*args,**kwargs)
        self.Panel = View(self,
                          id  =wx.ID_ANY,
                          size=(550,550),
                          pos =(50,50))
    def _Resize(self):
        self.SetSize(self.Panel.GetSize())

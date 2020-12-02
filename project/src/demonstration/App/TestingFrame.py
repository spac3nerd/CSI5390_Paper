import sys
sys.path.append("../centralData")
from .utils import BrowserManager

import Clients

import wx
import time

gameDescriptor = "game"
testDescriptor = "testing"

hostedPage = "173.255.226.26"
localhost  = '127.0.0.1'
ip         = localhost

ctrlClient = Clients.Control(ip,9090)
dataClient = Clients.Data(ip,9091)

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

        self.Panel    = wx.Panel(self,id=wx.ID_ANY,style=wx.BORDER_SUNKEN)
        self.BPanel   = wx.Panel(self,id=wx.ID_ANY)

        self.button1  = wx.Button(self.BPanel,label='button1')
        self.button2  = wx.Button(self.BPanel,label='button2')
        self.button3  = wx.Button(self.BPanel,label='PopulateTests')

        self.button1.Bind(wx.EVT_BUTTON,self.OnAdd)
        self.button2.Bind(wx.EVT_BUTTON,self.OnSecond)
        self.button3.Bind(wx.EVT_BUTTON,self.OnThird)

        self.BtnSizer.Add(self.button1,0,wx.ALL,5)
        self.BtnSizer.Add(self.button2,0,wx.ALL,5)
        self.BtnSizer.Add(self.button3,0,wx.ALL,5)

        self.Horiz.Add(self.BPanel,0,wx.ALL,5)
        self.Horiz.Add(self.Panel,0,wx.ALL,5)

        self.BPanel.SetSizer(self.BtnSizer)
        self.Panel.SetSizer(self.Sz)
        self.SetSizer(self.Horiz)

        self.Disps = []
        self.LoadTestThings()

    def LoadTestThings(self):
        self.browser = BrowserManager()
        self.browser.AddBasePage('http://'+ip)
        self.browser.AddSubPage(gameDescriptor,"")
        self.browser.AddSubPage(testDescriptor,"unitTesting")
        self.ctrlClient = Clients.Control(ip,9090)
        self.dataClient = Clients.Data(ip,9091)

    def OnAdd(self,event):
        self.Add("asdfasdf")
        self.Horiz.Layout()

    def OnSecond(self,event):
        t   = int(time.time())
        pos = t%len(self.Disps)
        self.Disps[pos].SetValue("lll")
        self.Disps[pos].MakeRed()

    def OnThird(self,event):
        self.browser.Load(testDescriptor)
        time.sleep(2)

        with self.ctrlClient as ctrl:
            ctrl.Client.StartDataServer(9091)
        self.dataClient.AutoConnect()

        cases = self.dataClient.GetTestCases()
        for item in cases:
            self.Add(item)
        self.Horiz.Layout()

    def Add(self,text):
        self.Disps.append(AddItem(text,self.Panel,self.Sz))


class TestFrame(wx.Frame):
    def __init__(self,*args,**kwargs):
        wx.Frame.__init__(self,*args,**kwargs)
        self.Panel = View(self,
                          id  =wx.ID_ANY,
                          size=(300,300),
                          pos =(50,50))

import webbrowser

class BrowserManager(object):
    def __init__(self):
        self.Browser = webbrowser.get()
        self.BaseUrl = ""
        self.Pages = {}
        self.Port = 8080
    def AddSubPage(self,name,urlPath):
        self.Pages[name] = urlPath
    def AddBasePage(self,page):
        self.BaseUrl = page
    def SetPort(self,port):
        self.Port = port
    def CleanPath(self,pathString):
        return pathString.replace('\\','/')
    def JoinPaths(self,pathA,pathB):
        pathA = self.CleanPath(pathA).strip('/')
        pathB = self.CleanPath(pathB).strip('/')
        return pathA+'/'+pathB
    def Load(self,pageName):
        base = self.BaseUrl + ':' + str(self.Port)
        path = self.JoinPaths(base,self.Pages[pageName])
        if(not self.Browser.open(path)):
            raise Exception("Could not load page: {}".format(path))

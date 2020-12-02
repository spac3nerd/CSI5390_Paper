from .ThriftCommon import *

import sys
sys.path.append("..")

import API
from API.Data.python.PYDataInterface import *
import time
import math
import threading

import json

def TestResultAssist(results):
    #dataClient.GetTestResults()
    results = json.loads(results)
    tests = [(ndx+1,x['pass'] if( x['pass'] or x['fail']) else None) for ndx,x in enumerate(results)]
    return tests

class Data(ClientConnector):
    def __init__(self,IPAddr='127.0.0.1',port=9091):
        super().__init__(DataInterface,IPAddr,port)
        self.Delay = .25
    def GetTestResults(self):
        if(self.Transport.isOpen()):
            results = self.Client.GetTestResults()
            while(len(results)==0):
                results = self.Client.GetTestResults()
            return TestResultAssist(results)
        return []
    def SetDelay(self,delay):
        self.Delay = delay
    def RunTests(self,n):
        for i in range(n):
            self.Client.ExecuteTest(i)
            time.sleep(self.Delay)
    def GetTestCases(self):
        prev = self.Client.GetTestCases()
        time.sleep(.125)
        t = time.time()
        while(len(prev)==0 and time.time()-t < 5):
            if(len(prev)>0):
                break
            prev = self.Client.GetTestCases()
            time.sleep(.125)
        if(len(prev)>0):
            return [ x.strip().split('\n')[0] for x in json.loads(prev)]
        return []

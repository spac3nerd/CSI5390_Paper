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
    def GetTestResults(self):
        if(self.Transport.isOpen()):
            results = self.Client.GetTestResults()
            if(len(results)==0):
                results = self.Client.GetTestResults()
            return TestResultAssist(results)
        return []
    def RunTests(self,n):
        for i in range(n):
            self.Client.ExecuteTest(i)
            time.sleep(.5)

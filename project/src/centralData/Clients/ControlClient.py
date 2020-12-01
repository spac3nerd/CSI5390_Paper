from .ThriftCommon import *

import sys
sys.path.append("..")

import API
from API.RemoteCtrl.python.PYAgentInterface import *
import time
import math
import threading

class Control(ClientConnector):
    def __init__(self,IPAddr='127.0.0.1',port=9090):
        super().__init__(AgentInterface,IPAddr,port)

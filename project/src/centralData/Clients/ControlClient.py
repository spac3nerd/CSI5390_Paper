from .ThriftCommon import *

import sys
sys.path.append("..")

import API
from API.RemoteCtrl.python.PYAgentInterface import *
import time
import math
import threading

class Control(object):
    def __init__(self,IPAddr='127.0.0.1',port=9090):
        self.DefaultPortNo = port
        self.DefaultIp     = IPAddr
    def Connect(ip=self.DefaultPortNo,port=self.DefauoltPortNo):
        transport = TSocket.TSocket(ip,port)
        transport = TTransport.TBufferedTransport(transport)
        protocol  = TBinaryProtocol.TBinaryProtocol(transport)
        client    = AgentInterface.Client(protocol)
        return client,transport

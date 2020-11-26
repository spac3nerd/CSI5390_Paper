from API.python.PYAgentInterface import *
import time
import math
import threading

import thrift
from thrift import Thrift
from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol

def Connect(ip='127.0.0.1',port=9090):
    transport = TSocket.TSocket(ip,port)
    transport = TTransport.TBufferedTransport(transport)
    protocol = TBinaryProtocol.TBinaryProtocol(transport)
    client = AgentInterface.Client(protocol)
    return client,transport


def LoopConnect(state):
    while(not state[0]):
        try:
            client,tx = Connect()
            tx.open()
            state[1] = True
            print("Success...")
            state[2],state[3] = client,tx
            break
        except Exception as ex:
            pass
        time.sleep(1)
        print("trying again...")
    print("Returning...")

def TryConnect():
    stopper = [False,False,None,None]
    trd = threading.Thread(target=LoopConnect,args=(stopper,))
    trd.start()
    return stopper,trd

if(__name__=='__main__'):
    client,tx = Connect()
    tx.open()

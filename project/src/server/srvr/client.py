from API.python.PYAgentInterface import *

import math

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

client,tx = Connect()
tx.open()

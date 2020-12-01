import thrift
from thrift import Thrift
from thrift.transport import TSocket
from thrift.transport import TTransport
from thrift.protocol import TBinaryProtocol

class ClientConnector(object):
    def __init__(self,
                 ThriftInterface,
                 IPAddr='127.0.0.1',
                 port=9090):
            self.DefaultPortNo = port
            self.DefaultIp     = IPAddr
            self.ThriftIFace   = ThriftInterface
            self.Client        = None
            self.Transport     = None
    def Connect(self,ip=None,port=None):
        if(ip==None):
            ip=self.DefaultIp
        if(port==None):
            port=self.DefaultPortNo
        transport = TSocket.TSocket(ip,port)
        transport = TTransport.TBufferedTransport(transport)
        protocol  = TBinaryProtocol.TBinaryProtocol(transport)
        client    = self.ThriftIFace.Client(protocol)

        self.Client    = client
        self.Transport = transport
        return client
    def OpenCommunication(self):
        if(self.Transport):
            self.Transport.open()
            return True
        return False
    def CloseCommunication(self):
        self.Transport.close()

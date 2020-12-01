import Clients

ctrlClient = Clients.Control()
dataClient = Clients.Data()

def ExecTests():
    with ctrlClient as ctrl:
        ctrl.Client.StartDataServer(9091)
        with dataClient as dclient:
            dclient.Client.ExecuteTests()

def GetDataClient():
    with ctrlClient as ctrl:
        ctrl.Client.StartDataServer(9091)
    dataClient.AutoConnect()

# ctrlClient.Connect()
# ctrlClient.OpenCommunication()
#
# ctrlClient.Client.StartDataServer(9091)
#
#
# dataClient.Connect(port=9091)
# dataClient.OpenCommunication()

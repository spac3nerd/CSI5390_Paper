import Clients

from Preprocessing.imageProcessing import PreProcess,CVShow,DisplayStream

ip = "173.255.226.26"
localhost = '127.0.0.1'

ip = localhost

ctrlClient = Clients.Control(ip,9090)
dataClient = Clients.Data(ip,9091)


def ExecTests():
    with ctrlClient as ctrl:
        ctrl.Client.StartDataServer(9090)
        with dataClient as dclient:
            dclient.Client.ExecuteTests()

def GetDataClient():
    with ctrlClient as ctrl:
        ctrl.Client.StartDataServer(9091)
    dataClient.AutoConnect()

images = []
def ShowNow(xscale=1.0,yscale=1.0):
    d = ctrlClient.Client.GetImageData(token)
    while(len(d)==0):
        d = ctrlClient.Client.GetImageData(token)
        time.sleep(.1)
    f = PreProcess(d,xscale,yscale)
    print("shape: {}".format(f.shape))
    images.append(f)
    CVShow(f)

# ctrlClient.Connect()
# ctrlClient.OpenCommunication()
#
# ctrlClient.Client.StartDataServer(9091)
#
#
# dataClient.Connect(port=9091)
# dataClient.OpenCommunication()

from client import TryConnect,Connect
from Preprocessing.imageProcessing import PreProcess,CVShow,DisplayStream
import time

TEST_NAME = "name"

# results,thread = TryConnect()
#
# while(results[1]==False):
#     time.sleep(1)

client = Clients.Control()
client.Connect()
client.OpenCommunication()

token = client.GetTokenByName(TEST_NAME)

images = []

def ShowNow(xscale=1.0,yscale=1.0):
    d = client.GetImageData(token)
    while(len(d)==0):
        d = client.GetImageData(token)
        time.sleep(.1)
    f = PreProcess(d,xscale,yscale)
    print("shape: {}".format(f.shape))
    images.append(f)
    CVShow(f)

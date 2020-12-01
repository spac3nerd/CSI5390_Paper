import io
import cv2
import base64
import time

import numpy as np
from PIL import Image

DEFAULT_SIZE = (472,600)

# The only function needed for now
def PreProcess(urlString,xscale=1.0,yscale=1.0):
    strn     = urlString.split(',')[1]
    rawBytes = base64.b64decode(strn)
    ndarray  = np.frombuffer(rawBytes,np.uint8)
    imgArray = cv2.imdecode(ndarray,cv2.COLOR_BGR2RGB)
    sz = DEFAULT_SIZE
    sz = (int(sz[0]*xscale),int(sz[1]*yscale))
    return cv2.resize(imgArray,dsize=sz,interpolation=cv2.INTER_CUBIC)

def ConvertToBytes(urlString):
    strn = urlString.split(',')[1]
    return base64.b64decode(strn)

def URLToImage(urlString):
    data = ConvertToBytes(urlString)
    bts  = io.BytesIO(data)
    return Image.open(bts)

def ToNumpyArray(urlString):
    bts = ConvertToBytes(urlString)
    arry = np.frombuffer(bts,np.uint8)
    arry = cv2.imdecode(arry,cv2.COLOR_BGR2RGB)
    return arry

####################################################

def CVConvertToImage(arry,conversion=cv2.COLOR_BGR2RGB):
    return cv2.cvtColor(arry,conversion)

def CVShow(arry):
    cv2.imshow("",arry)

def DisplayStream(durration,delay,dataFunc):
    t = time.time()
    while(time.time()-t < durration):
        data = dataFunc()
        if(len(data)>0):
            print(data)
            data = PreProcess(data)
            CVShow(data)
            cv2.destroyAllWindows()
        time.sleep(delay)

def CVResize(arry,scaling=.5):
    n = tuple([int(x*scaling) for x in ii.shape[:2]])
    rsz = cv2.resize(ii,
                    dsize=n,
                    interpolation=cv2.INTER_CUBIC)
    return rsz

from .ThriftCommon import *

import sys
sys.path.append("..")

import API
from API.Data.python.PYDataInterface import *
import time
import math
import threading

class Data(ClientConnector):
    def __init__(self,IPAddr='127.0.0.1',port=9091):
        super().__init__(DataInterface,IPAddr,port)

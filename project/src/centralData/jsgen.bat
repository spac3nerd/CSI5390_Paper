if not exist "API/RemoteCtrl/nodejs" mkdir "API/RemoteCtrl/nodejs"
if not exist "API/RemoteCtrl/python" mkdir "API/RemoteCtrl/python"
thrift-0.13.0 --gen js:node -out "API/RemoteCtrl/nodejs" jstest.idl
thrift-0.13.0 --gen py -out "API/RemoteCtrl/python" jstest.idl

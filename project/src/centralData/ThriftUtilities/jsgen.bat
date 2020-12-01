if not exist "%~dp0/../API/RemoteCtrl/nodejs" mkdir "%~dp0/../API/RemoteCtrl/nodejs"
if not exist "%~dp0/../API/RemoteCtrl/python" mkdir "%~dp0/../API/RemoteCtrl/python"
"%~dp0/thrift-0.13.0" --gen js:node -out "%~dp0/../API/RemoteCtrl/nodejs" %~dp0/jstest.idl
"%~dp0/thrift-0.13.0" --gen py -out "%~dp0/../API/RemoteCtrl/python" %~dp0/jstest.idl

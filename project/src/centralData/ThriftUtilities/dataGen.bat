if not exist "%~dp0/../API/Data/nodejs" mkdir "%~dp0/../API/Data/nodejs"
if not exist "%~dp0/../API/Data/python" mkdir "%~dp0/../API/Data/python"
"%~dp0\thrift-0.13.0" --gen js:node -out "%~dp0/../API/Data/nodejs" %~dp0/data.idl
"%~dp0\thrift-0.13.0" --gen py -out "%~dp0/../API/Data/python" %~dp0/data.idl

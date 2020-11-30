if not exist "API/Data/nodejs" mkdir "API/Data/nodejs"
if not exist "API/Data/python" mkdir "API/Data/python"
thrift-0.13.0 --gen js:node -out "API/Data/nodejs" data.idl
thrift-0.13.0 --gen py -out "API/Data/python" data.idl

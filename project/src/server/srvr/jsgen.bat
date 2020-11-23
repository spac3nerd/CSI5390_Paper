if not exist "API/nodejs" mkdir "API/nodejs"
if not exist "API/python" mkdir "API/python"
thrift-0.13.0 --gen js:node -out "API/nodejs" jstest.idl
thrift-0.13.0 --gen py -out "API/python" jstest.idl

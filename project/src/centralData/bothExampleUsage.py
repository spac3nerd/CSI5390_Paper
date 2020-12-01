import Clients

ctrlClient = Clients.Control()
ctrlClient.Connect()
ctrlClient.OpenCommunication()
token = ctrlClient.Client.GetTokenByName('name')
print(token)

ctrlClient.Client.StartDataServer(9091)

dataClient = Clients.Data()
dataClient.Connect(port=9091)
dataClient.OpenCommunication()

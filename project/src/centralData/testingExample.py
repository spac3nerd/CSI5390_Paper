import Clients

ctrlClient = Clients.Control()
ctrlClient.Connect()
ctrlClient.OpenCommunication()

ctrlClient.Client.StartDataServer(9091)

dataClient = Clients.Data()
dataClient.Connect(port=9091)
dataClient.OpenCommunication()

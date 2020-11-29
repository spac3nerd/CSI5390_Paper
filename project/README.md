# NodeTank
Quick demo project to go along with CSI 5390 research paper 

## Prerequisites:
  nodejs
  
## Building Project
  Navigate to ~/src/server and run:
  
    $ npm install
    
  To start the server, run:
  
    $ node ./init.js
    
  Navigate to "http://localhost:8080" for starting one instance of the game, up to 4 concurrent players may be active.
  
   Navigate to "http://localhost:8080/unitTesting" to access the front-end testing framework
   
   Navigate to "http://localhost:8080/fullStackTesting" to access end to end testing framework
  
  
  The current iteration does not disconnect players, the only way to remove them is to restart the server. 

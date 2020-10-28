# NodeTank
Quick demo project to go along with CSI 5390 research paper 

## Prerequisites:
  nodejs
  
## Building Project
  Navigate to ~/src/server and run:
  
    $ npm install
    
  To start the server, run:
  
    $ node ./init.js
    
  Navigate to "http://localhost" for starting one instance of the game, up to 4 concurrent players may be active.
  
  **NOTE** The only way to reset the game is to restart the server. 
  
  The current iteration does not disconnect players, the only way to remove them is to restart the server. 

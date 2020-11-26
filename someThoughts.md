# Reinforcement learning
## Main components
  - Agent
  - Environment
  - Bellman equation
  - reward (often delayed)
  - data is not independent or evenly distributed, often highly correlated

- Traditional Q-Learning
  - Q-tables
    - linear models
    - quick to train/optimise rewards
    - memory consumption issues when state space grows large
    - lack robustness and ability to handle unseen/new data
  - Mapping of a set of states to a set(s) of actions.
    - States are "observations" received by the agent from the environment
      - speed
      - position
      - orientation
      - etc.
    - Upon observation of a state, an action is taken
    - Environment generates a reward value based upon the quality of the selected action
    - Agent attempts to identify which actions optimize reward for all possible states
      - agent maintains a "policy", or table, of these states and actions
  -  State Explosion
    - It can be impractical (in terms of memory) to maintain all possible states, or all possible combinations of position, orientation, velocity, etc. in an environment.





### Deep neural networks are traditionally not well suited for reinforcement learning
- Deep neural networks
  - longer to train, consume fixed amount of space
  - resilient to new inputs
  - better suited for handling higher dimensional states
  - strength of feature extraction allow for classifiers without being explicitly defined first
  - work best with minimally correlated data
- State explosion is resolved by changing the representation of the agent's policy from a table to a deep-neural network.
- DQN overcomes limitations through:
  - Experience replay
  - target network
  - reward clipping
  - skipping input opportunities (skipping image frame data)


# Introduce Thrift/RPC concepts
  - What are RPCs
  - Purpose for inclusion
    - data submission
    - how the agent provides input to the game

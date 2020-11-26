# ---Unfinished---

from keras.models     import Sequential
from keras.layers     import Dense,Dropout,Conv2D,MaxPool2D,Activation,Flatten
from keras.callbacks  import TensorBoard
from keras.optimizers import Adam

import numpy as np

from collections import deque
import random,optimizer

MINI_BATCH_SIZE     = 64
DISCOUNT            = 0.99
UPDATE_TARGET_EVERY = 5

#Modifying the tensorboard class so a new log file isnt created every single iteration
class ModifiedTensorBoard(TensorBoard):

    # Overriding init to set initial step and writer (we want one log file for all .fit() calls)
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.step = 1
        self.writer = tf.summary.FileWriter(self.log_dir)
    # Overriding this method to stop creating default log writer
    def set_model(self, model):
        pass
    # Overrided, saves logs with our step number
    # (otherwise every .fit() will start writing from 0th step)
    def on_epoch_end(self, epoch, logs=None):
        self.update_stats(**logs)
    # Overrided
    # We train for one batch only, no need to save anything at epoch end
    def on_batch_end(self, batch, logs=None):
        pass
    # Overrided, so won't close writer
    def on_train_end(self, _):
        pass
    # Custom method for saving own metrics
    # Creates writer, writes custom metrics and closes writer
    def update_stats(self, **stats):
        self._write_logs(stats, self.step)


REPLAY_MEMORY_SIZE = 50_000#Note around 20-minute mark
MODEL_NAME = "256X2"

class DQNetwork(object):
    def __init__(self):
        # main model # gets trained every step
        self.model = self.create_model()

        # target model: is what we .predict() against every step
        self.target_model  = self.create_model()
        self.replay_memory = deque(maxlen=REPLAY_MEMORY_SIZE)
        self.tensorboard   = ModifiedTensorBoard(log_dir=f"logs/{MODEL_NAME}-{int(time.time())}")

        self.target_model.set_weights(self.model.get_weights())

        self.target_update_counter = 0

    def create_model(self):
        model = Sequential()
        convs = 256
        sz = (3,3)

        model.add(Conv2D(convs,sz,input_shape=env.OBSERVSTION_SPACE_VALUES))
        model.add(Activation("relu"))
        modle.add(MaxPooling2D(2,2))
        model.add(Dropout(.2))#dropout layer, drop 20%

        model.add(Conv2D(convs,sz))
        model.add(Activation("relu"))
        modle.add(MaxPooling2D(2,2))
        model.add(Dropout(.2))

        model.add(Flatten())
        model.add(Dense(64))

        model.add(Dense(env.ACTION_SPACE_SIZE,activation="linear"))
        model.compile(loss="mse",
                      optimizer=Adam(lr=.001),
                      metrices=['accuracy'])
        return model

    def update_replay_memory(self,transition):
        self.replay_memory.append(transition)

    def get_qs(self,state,terminal_state):
        return self.model_predict(np.array(state).reshape(-1,*state.shape)/255)[0]

    def train(self,terminal_state,step):
        if(len(self.replay_memory)<MIN_REPLAY_MEMORY_SIZE):
            return
        minibatch = random.sample(self.replay_memory,MINI_BATCH_SIZE)
        current_states     = np.array([transition[0] for transition in minibatch])/255#255 is for normalization (255 for rgb images)
        current_qs_list    = self.model.predict(current_states)
        new_current_states = np.array([transition[3] for transition in minibatch])/255
        future_qs_list = self.target_model.predict(new_current_states)

        #images from game:
        X = []

        # actions to take:
        Y = []

        for index,parts in enumerate(minibatch):
            current_state     = parts[0]
            action            =parts[1]
            reward            =parts[2]
            new_current_state =parts[3]
            done              =parts[4]
            if(not done):
                max_future_q = np.max(future_qs_list[index])
                new_q = reward+DISCOUNT*max_future_q
            else:
                new_q = reward
            X.append(current_state)
            Y.append(current_qs)
        self.model.fit(np.array(X)/255,np.array(Y),batch_size=MINI_BATCH_SIZE,
        verbose=0,shuffle=False,callbacks=[self.tensorboard] if terminal_state else None)

        # updating to determine if we want to update target_model yet
        if(terminal_state):
            self.target_update_counter += 1

        if(self.target_update_counter > UPDATE_TARGET_EVERY):
            self.target_model.set_weights(self.model.get_weights())
            self.target_update_counter = 0

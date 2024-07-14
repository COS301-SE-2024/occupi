import numpy as np
import pandas as pd
from matplotlib import pyplot as plt
from tensorflow.keras.models import Sequential #type: ignore
from tensorflow.keras.layers import LSTM #type: ignore
from tensorflow.keras.layers import Dense, Dropout #type: ignore
from sklearn.preprocessing import MinMaxScaler
from keras.wrappers.scikit_learn import KerasRegressor #type: ignore
from sklearn.model_selection import GridSearchCV

df=pd.read_csv("Attendance_data(1).csv",parse_dates=["Date"],index_col=[0])
df.head()
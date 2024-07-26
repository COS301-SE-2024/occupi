# scaler.py
import numpy as np
from sklearn.preprocessing import StandardScaler

# Initialize the scaler (use the same scaler used during training)
# Assume you have access to the original training data for initializing the scaler
X_train = np.array([[0, 3, 15, 0, 1], [1, 3, 16, 0, 1], [2, 3, 17, 0, 1], [3, 3, 18, 0, 1], [4, 3, 19, 0, 1], [5, 3, 20, 1, 1], [6, 3, 21, 1, 1]])
scaler = StandardScaler().fit(X_train)

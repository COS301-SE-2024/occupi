import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from tensorflow.keras.models import Sequential #type: ignore
from tensorflow.keras.layers import LSTM, Dense, Dropout #type: ignore
from matplotlib import pyplot as plt

# Load data
df = pd.read_csv("datasets/Attendance_data(1).csv", parse_dates=["Date"], index_col="Date")

# Display data
print(df.head())

# Add Day of the Week feature
df['Day_of_Week'] = df.index.dayofweek + 1  # Monday=1, Sunday=7

# Group by DayOfWeek and calculate the mean
day_of_week_avg = df.groupby('Day_of_Week').mean()

# Bar Plot for Day of the Week
plt.figure(figsize=(14, 7))
day_of_week_avg['Number_Attended'].plot(kind='line')
plt.xlabel('Day of the Week')
plt.ylabel('Average Value')
plt.title('Average Attendance by Day of the Week')
plt.show()

# Line Plot
plt.figure(figsize=(14, 7))
plt.plot(df.index, df['Number_Attended'], label='Attendance')
plt.xlabel('Date')
plt.ylabel('Value')
plt.title('Line Plot of Attendance Over Time')
plt.legend()
plt.show()

# Normalize the data
scaler = MinMaxScaler(feature_range=(0, 1))
scaled_data = scaler.fit_transform(df)

# Convert data to sequences
def create_sequences(data, seq_length):
    xs, ys = [], []
    for i in range(len(data) - seq_length):
        x = data[i:i+seq_length]
        y = data[i+seq_length]
        xs.append(x)
        ys.append(y)
    return np.array(xs), np.array(ys)

# Define sequence length
seq_length = 10

# Create sequences
X, y = create_sequences(scaled_data, seq_length)

# Split into train and test sets
trainX, testX, trainY, testY = train_test_split(X, y, test_size=0.2, random_state=42)

# Print shapes
print(f"trainX shape: {trainX.shape}")
print(f"trainY shape: {trainY.shape}")
print(f"testX shape: {testX.shape}")
print(f"testY shape: {testY.shape}")

# Define the model
def build_model(input_shape):
    model = Sequential()
    model.add(LSTM(units=50, return_sequences=True, input_shape=input_shape))
    model.add(Dropout(0.2))
    model.add(LSTM(units=50))
    model.add(Dropout(0.2))
    model.add(Dense(units=input_shape[1]))  # Number of features
    model.compile(optimizer='adam', loss='mean_squared_error')
    return model

# Get the input shape
input_shape = (trainX.shape[1], trainX.shape[2])

# Build the model
model = build_model(input_shape)
model.summary()

# Train the model
history = model.fit(trainX, trainY, epochs=50, batch_size=32, validation_data=(testX, testY))

# Evaluate the model
loss = model.evaluate(testX, testY)
print(f"Test loss: {loss}")

# Make predictions
predictions = model.predict(testX)

# Inverse transform the predictions and the true values
predicted_values = scaler.inverse_transform(predictions)
true_values = scaler.inverse_transform(testY.reshape(-1, testY.shape[1]))

# Print the first few predictions and true values
print(predicted_values[:5])
print(true_values[:5])

# Plot predictions vs true values
plt.figure(figsize=(14, 7))
plt.plot(true_values[:, 0], color='blue', label='Actual')
plt.plot(predicted_values[:, 0], color='red', label='Predicted')
plt.xlabel('Time')
plt.ylabel('Attendance')
plt.title('LSTM Predictions vs Actual')
plt.legend()
plt.show()

# Predict attendance for a specific day of the week (e.g., Monday)
day_of_week = 1  # Monday
specific_day_data = df[df['Day_of_Week'] == day_of_week]

# Prepare the input sequence for prediction
scaled_specific_day_data = scaler.transform(specific_day_data)
X_specific_day, _ = create_sequences(scaled_specific_day_data, seq_length)

# Make predictions for the specific day
predictions_specific_day = model.predict(X_specific_day)

# Inverse transform the predictions
predicted_values_specific_day = scaler.inverse_transform(predictions_specific_day)

# Plot predicted values for the specific day
plt.figure(figsize=(14, 7))
plt.plot(specific_day_data.index[seq_length:], predicted_values_specific_day[:, 0], color='red', label='Predicted')
plt.xlabel('Date')
plt.ylabel('Attendance')
plt.title('Predicted Attendance for Specific Day of the Week (Monday)')
plt.legend()
plt.show()

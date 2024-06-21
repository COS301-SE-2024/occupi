import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from sklearn.model_selection import train_test_split
from tensorflow.keras.callbacks import EarlyStopping #type: ignore
from tensorflow.keras.models import Sequential #type: ignore
from tensorflow.keras.layers import LSTM, Dense, Dropout #type: ignore
from matplotlib import pyplot as plt

# Load data
df = pd.read_csv("Attendance_data(1).csv", parse_dates=["Date"], index_col="Date")

# Add Day of the Week feature
df['Day_of_Week'] = df.index.dayofweek + 1  # Monday=1, Sunday=7
df['Is_Weekend'] = df['Day_of_Week'].apply(lambda x: 1 if x >= 6 else 0)

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

# Separate scaler for the target column
attendance_scaler = MinMaxScaler(feature_range=(0, 1))
df[['Number_Attended']] = attendance_scaler.fit_transform(df[['Number_Attended']])

# Normalize the data for all features
scaler = MinMaxScaler(feature_range=(0, 1))
scaled_data = scaler.fit_transform(df)

# Convert data to sequences
def create_sequences(data, seq_length):
    xs, ys = [], []
    for i in range(len(data) - seq_length):
        x = data[i:i + seq_length]
        y = data[i + seq_length, df.columns.get_loc('Number_Attended')]  # Ensure we are taking the correct target column (Number_Attended)
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
    model.add(Dense(units=1))  # Predict only the target value
    model.compile(optimizer='adam', loss='mean_squared_error')
    return model

# Get the input shape
input_shape = (trainX.shape[1], trainX.shape[2])

# Build the model
model = build_model(input_shape)
model.summary()

# Train the model with early stopping
early_stopping = EarlyStopping(monitor='val_loss', patience=15, restore_best_weights=True)

history = model.fit(trainX, trainY, epochs=100, batch_size=30, validation_data=(testX, testY), callbacks=[early_stopping])

# Evaluate the model
loss = model.evaluate(testX, testY)
print(f"Test loss: {loss}")

# Make predictions
predictions = model.predict(testX)

# Inverse transform the predictions and the true values
predicted_attendance = attendance_scaler.inverse_transform(predictions)
true_attendance = attendance_scaler.inverse_transform(testY.reshape(-1, 1))

# Print the first few predictions and true values
print(predicted_attendance[:5])
print(true_attendance[:5])

# Plot predictions vs true values
plt.figure(figsize=(14, 7))
plt.plot(true_attendance, color='blue', label='Actual')
plt.plot(predicted_attendance, color='red', label='Predicted')
plt.xlabel('Time')
plt.ylabel('Attendance')
plt.title('LSTM Predictions vs Actual')
plt.legend()
plt.show()

# Predict attendance for each day of the week
days_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
predictions_per_day = []

for day in range(1, 8):  # Days of the week 1-7 (Monday-Sunday)
    specific_day_data = df[df['Day_of_Week'] == day]
    
    if specific_day_data.empty:
        continue
    
    scaled_specific_day_data = scaler.transform(specific_day_data)
    X_specific_day, _ = create_sequences(scaled_specific_day_data, seq_length)
    
    if X_specific_day.size == 0:
        continue
    
    predictions_specific_day = model.predict(X_specific_day)
    predicted_values_specific_day = attendance_scaler.inverse_transform(predictions_specific_day)
    
    # Average prediction for the specific day
    average_prediction = predicted_values_specific_day.mean()
    
    predictions_per_day.append({
        "Day": days_of_week[day - 1],
        "Predicted Attendance": average_prediction
    })

# Create a DataFrame for the predictions
df_predictions = pd.DataFrame(predictions_per_day)
print(df_predictions)

# Save to CSV if needed
df_predictions.to_csv("predicted_attendance_per_day.csv", index=False)

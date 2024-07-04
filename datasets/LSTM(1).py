import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
from sklearn.model_selection import train_test_split
from tensorflow.keras.callbacks import EarlyStopping # type: ignore
from tensorflow.keras.models import Sequential # type: ignore
from tensorflow.keras.layers import LSTM, Dense, Dropout # type: ignore
from tensorflow.keras.utils import to_categorical
from matplotlib import pyplot as plt

# Load data
df = pd.read_csv("datasets/Attendance_data(1).csv", parse_dates=["Date"], index_col="Date")

# Add Day of the Week feature
df['Day_of_Week'] = df.index.dayofweek + 1  # Monday=1, Sunday=7
df['Is_Weekend'] = df['Day_of_Week'].apply(lambda x: 1 if x >= 6 else 0)

# Quantile-based categorization into 7 categories
quantiles = df['Number_Attended'].quantile([i/7 for i in range(1, 7)])

def categorize_attendance_quantile(number):
    if number <= quantiles.iloc[0]:
        return 0  # Very Low attendance
    elif number <= quantiles.iloc[1]:
        return 1  # Low attendance
    elif number <= quantiles.iloc[2]:
        return 2  # Below Average attendance
    elif number <= quantiles.iloc[3]:
        return 3  # Average attendance
    elif number <= quantiles.iloc[4]:
        return 4  # Above Average attendance
    elif number <= quantiles.iloc[5]:
        return 5  # High attendance
    else:
        return 6  # Very High attendance

df['Attendance_Category'] = df['Number_Attended'].apply(categorize_attendance_quantile)

# Bar Plot for Day of the Week
plt.figure(figsize=(14, 7))
day_of_week_avg = df.groupby('Day_of_Week').mean()
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

# Normalize the data for all features except the target
scaler = MinMaxScaler(feature_range=(0, 1))
features_scaled = scaler.fit_transform(df.drop(['Attendance_Category'], axis=1))

# Convert the target to categorical
target = to_categorical(df['Attendance_Category'])

# Convert data to sequences
def create_sequences(data, target, seq_length):
    xs, ys = [], []
    for i in range(len(data) - seq_length):
        x = data[i:i + seq_length]
        y = target[i + seq_length]
        xs.append(x)
        ys.append(y)
    return np.array(xs), np.array(ys)

# Define sequence length
seq_length = 28

# Create sequences
X, y = create_sequences(features_scaled, target, seq_length)

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
    model.add(Dense(units=7, activation='softmax'))  # Predict 7 categories
    model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
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
loss, accuracy = model.evaluate(testX, testY)
print(f"Test loss: {loss}")
print(f"Test accuracy: {accuracy * 100:.2f}%")

# Make predictions
predictions = model.predict(testX)
predicted_classes = np.argmax(predictions, axis=1)
true_classes = np.argmax(testY, axis=1)

# Print the first few predictions and true values
print(predicted_classes[:5])
print(true_classes[:5])

# Plot predictions vs true values
plt.figure(figsize=(14, 7))
plt.plot(true_classes, color='blue', label='Actual')
plt.plot(predicted_classes, color='red', label='Predicted')
plt.xlabel('Time')
plt.ylabel('Attendance Category')
plt.title('LSTM Predictions vs Actual Categories')
plt.legend()
plt.show()

# Predict attendance category for each day of the week
days_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
predictions_per_day = []

for day in range(1, 8):  # Days of the week 1-7 (Monday-Sunday)
    specific_day_data = df[df['Day_of_Week'] == day]
    
    if specific_day_data.empty:
        continue
    
    scaled_specific_day_data = scaler.transform(specific_day_data.drop(['Attendance_Category'], axis=1))
    X_specific_day, _ = create_sequences(scaled_specific_day_data, specific_day_data['Attendance_Category'].values, seq_length)
    
    if X_specific_day.size == 0:
        continue
    
    predictions_specific_day = model.predict(X_specific_day)
    predicted_classes_specific_day = np.argmax(predictions_specific_day, axis=1)
    
    # Most frequent prediction for the specific day
    unique, counts = np.unique(predicted_classes_specific_day, return_counts=True)
    most_frequent_prediction = unique[np.argmax(counts)]
    
    predictions_per_day.append({
        "Day": days_of_week[day - 1],
        "Predicted Attendance Category": most_frequent_prediction
    })

# Create a DataFrame for the predictions
df_predictions = pd.DataFrame(predictions_per_day)
print(df_predictions)

# Save to CSV if needed
df_predictions.to_csv("predicted_attendance_category_per_day.csv", index=False)

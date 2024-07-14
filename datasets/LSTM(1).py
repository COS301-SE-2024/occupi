import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv1D, MaxPooling1D, LSTM, Dense, Flatten, Dropout, BatchNormalization
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping
from datetime import datetime

# Load the dataset
file_path = 'datasets/Attendance_data(1).csv'
data = pd.read_csv(file_path)

# Convert the Date feature to datetime
data['Date'] = pd.to_datetime(data['Date'])

# Create a mapping for days of the week
day_mapping = {
    'Monday': 0,
    'Tuesday': 1,
    'Wednesday': 2,
    'Thursday': 3,
    'Friday': 4,
    'Saturday': 5,
    'Sunday': 6
}

# Apply the mapping to the 'Day_of_Week' column
data['Day_of_Week'] = data['Day_of_Week'].map(day_mapping).astype(int)

# Label encode the 'Special_Event' column
label_encoder = LabelEncoder()
data['Special_Event'] = label_encoder.fit_transform(data['Special_Event'])

# Define bins for categorizing attendance into increments of 150
bins = [0, 300, 600, 900, 1200, 1500, 1800, float('inf')]
labels = list(range(len(bins) - 1))

# Categorize the attendance data
data['Attendance_Level'] = pd.cut(data['Number_Attended'], bins=bins, labels=labels)

# Handle missing values (replace with 0)
data['Attendance_Level'] = data['Attendance_Level'].cat.codes  # Convert categories to codes
data['Attendance_Level'] = data['Attendance_Level'].replace(-1, np.nan)  # Replace -1 with NaN
data['Attendance_Level'] = data['Attendance_Level'].fillna(0)  # Fill NaN values with 0

# Convert Attendance_Level to integer type after filling
data['Attendance_Level'] = data['Attendance_Level'].astype(int)


# Attendance Levels by Day of Week
plt.figure(figsize=(12, 8))
sns.boxplot(x='Day_of_Week', y='Attendance_Level', data=data)
plt.xlabel('Day of Week')
plt.ylabel('Attendance Level')
plt.title('Attendance Levels by Day of the Week')
plt.show()

# Select features and target (using minimal preprocessing)
features = ['Day_of_Week', 'Month', 'Day_of_month', 'Is_Weekend', 'Special_Event']
target = 'Attendance_Level'

X = data[features].values
y = data[target].values

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Standardize the features
scaler = StandardScaler()
X_train = scaler.fit_transform(X_train)
X_test = scaler.transform(X_test)

# Original Distribution of Number Attended
plt.figure(figsize=(14, 6))
plt.subplot(1, 2, 1)
sns.histplot(data['Number_Attended'], kde=True)
plt.xlabel('Number Attended (Original)')
plt.ylabel('Count')
plt.title('Original Number Attended Distribution')

# Original Distribution of Attendance Level
plt.subplot(1, 2, 2)
sns.histplot(data['Attendance_Level'], kde=True)
plt.xlabel('Attendance Level (Original)')
plt.ylabel('Count')
plt.title('Original Attendance Level Distribution')

plt.tight_layout()
plt.show()

# Reshape the data to 3D for CNN-LSTM
X_train = X_train.reshape((X_train.shape[0], X_train.shape[1], 1))
X_test = X_test.reshape((X_test.shape[0], X_test.shape[1], 1))

print(f'X_train shape: {X_train.shape}')
print(f'X_test shape: {X_test.shape}')

# Build the improved CNN-LSTM model
model = Sequential()

#CNN Part
model.add(Conv1D(filters=64, kernel_size=3, activation='relu', input_shape=(X_train.shape[1], X_train.shape[2]), padding='same'))
model.add(BatchNormalization())
model.add(MaxPooling1D(pool_size=2))
model.add(Conv1D(filters=128, kernel_size=2, activation='relu'))
model.add(BatchNormalization())
model.add(MaxPooling1D(pool_size=1))  # Adjust pool size to 1 to prevent negative dimension

# LSTM Part
model.add(LSTM(50, return_sequences=True))
model.add(Dropout(0.25))
model.add(LSTM(100, return_sequences=False))
model.add(Dropout(0.25))

#Fully Connected Part
model.add(Dense(100, activation='relu'))
model.add(Dropout(0.5))
model.add(Dense(50, activation='relu'))
model.add(Dropout(0.5))

# Output layer
model.add(Dense(len(labels), activation='softmax'))  # Adjust the output layer for 7 classes

# Compile the model
model.compile(loss='sparse_categorical_crossentropy', optimizer=Adam(learning_rate=0.001), metrics=['accuracy'])

print(f"Model's input shape: {model.input_shape}")

# Define early stopping
early_stopping = EarlyStopping(monitor='val_loss', patience=25, restore_best_weights=True)

# Train the model with callbacks
history = model.fit(X_train, y_train, epochs=60, batch_size=32, validation_data=(X_test, y_test), callbacks=[early_stopping], verbose=2)

# Evaluate the model
loss, accuracy = model.evaluate(X_test, y_test)
print(f'Test Accuracy: {accuracy:.4f}')

# Make predictions
predictions = model.predict(X_test)
predicted_labels = np.argmax(predictions, axis=1)

# Create a DataFrame to compare actual and predicted values
results = pd.DataFrame({'Actual': y_test, 'Predicted': predicted_labels})

# Display the results
print(results.head())

# Plot the results
plt.figure(figsize=(10, 6))
plt.plot(results['Actual'].values, label='Actual')
plt.plot(results['Predicted'].values, label='Predicted', alpha=0.7)
plt.xlabel('Sample Index')
plt.ylabel('Attendance Level')
plt.legend()
plt.title('Actual vs. Predicted Attendance Levels')
plt.show()

# Function to predict attendance level for a given day
def predict_attendance(day_of_week, month, day_of_month, is_weekend, special_event):
    # Create a feature vector based on the input
    input_features = np.array([[day_of_week, month, day_of_month, is_weekend, special_event]])
    
    # Standardize the input features
    input_features = scaler.transform(input_features)
    
    # Reshape the input features to match the model's input shape
    input_features = input_features.reshape((input_features.shape[0], input_features.shape[1], 1))
    
    # Make predictions
    predictions = model.predict(input_features)
    predicted_label = np.argmax(predictions, axis=1)
    
    return predicted_label[0]

# Predict attendance levels for each day of the week
# def predict_weekly_attendance(year, month, start_day):
#     days_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
#     predictions = []
    
#     for i, day_name in enumerate(days_of_week):
#         day_of_week = i  # Monday is 0, Sunday is 6
#         date = datetime(year, month, start_day + i)
#         day_of_month = date.day
#         is_weekend = 1 if day_of_week in [5, 6] else 0
#         special_event = 0  # Assuming no special event
        
#         predicted_attendance_level = predict_attendance(day_of_week, month, day_of_month, is_weekend, special_event, year, start_day + i)
#         predictions.append((day_name, predicted_attendance_level))
    
#     return predictions

# # Example usage
# year = 2026
# month = 3
# start_day = 11  # Starting from Monday, March 11, 2024

# weekly_predictions = predict_weekly_attendance(year, month, start_day)

# # Display the predictions
# print("Weekly Attendance Level Predictions:")
# for day, prediction in weekly_predictions:
#     print(f"{day}: {prediction}")

# # Plot the predictions
# days, levels = zip(*weekly_predictions)
# plt.figure(figsize=(10, 6))
# plt.plot(days, levels, marker='o')
# plt.xlabel('Day of the Week')
# plt.ylabel('Attendance Level')
# plt.title('Predicted Attendance Levels for the Week')
# plt.show()

# model.save('models/attendance_model.h5')
# model.export('C:/Users/retha/Capstone/occupi/models/attendance_model/1')

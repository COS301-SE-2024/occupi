import pandas as pd
import tensorflow as tf
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv1D, MaxPooling1D, Flatten, Dense, Dropout
from tensorflow.keras.utils import to_categorical
import numpy as np
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay, classification_report
import matplotlib.pyplot as plt

# Load the Excel file
file_path = 'datasets/Hourly_Predictions.xlsx'  # Replace with your actual file path
excel_data = pd.ExcelFile(file_path)

# Combine all sheets into one DataFrame
sheets_data = {sheet: excel_data.parse(sheet) for sheet in excel_data.sheet_names}
combined_data = pd.concat(sheets_data.values(), keys=sheets_data.keys(), names=['Day', 'Index']).reset_index(level=1, drop=True).reset_index()

# Data Preparation
# Encode 'Day' as a categorical feature
label_encoder_day = LabelEncoder()
combined_data['Day_Encoded'] = label_encoder_day.fit_transform(combined_data['Day'].fillna('Unknown'))

# Extract hour directly from 'Time' column, ensuring 'Time' is not null
combined_data['Hour'] = combined_data['Time'].apply(lambda t: t.hour if pd.notnull(t) else 0)

# Define custom bins and labels for each day
day_bins = {
    'Monday': [0, 50, 100, 150, 200, 250, 300, float('inf')],
    'Tuesday': [0, 300, 600, 900, 1200, 1500, 1800, float('inf')],
    'Wednesday': [0, 50, 100, 150, 200, 250, 300, float('inf')],
    'Thursday': [0, 300, 600, 900, 1200, 1500, 1800, float('inf')],
    'Friday': [0, 50, 100, 150, 200, 250, 300, float('inf')],
    'Saturday': [0, 25, 50, 75, 100, 125, 150, float('inf')],
    'Sunday': [0, 10, 20, 30, 40, 50, 60, float('inf')],
    # ...
}

day_labels = {
    'Monday': list(range(len(day_bins['Monday']) - 1)),  # Labels: 0, 1, 2, ...
    'Tuesday': list(range(len(day_bins['Tuesday']) - 1)),
    'Wednesday': list(range(len(day_bins['Wednesday']) - 1)),
    'Thursday': list(range(len(day_bins['Thursday']) - 1)),
    'Friday': list(range(len(day_bins['Friday']) - 1)),
    'Saturday': list(range(len(day_bins['Saturday']) - 1)),
    'Sunday': list(range(len(day_bins['Sunday']) - 1)),
}

# Function to apply the appropriate bins for each day
def apply_bins(row):
    day = row['Day']
    bins = day_bins.get(day, [0, float('inf')])  # Default to a single bin if not specified
    labels = day_labels.get(day, [0])
    return pd.cut([row['Attendance']], bins=bins, labels=labels, include_lowest=True)[0]

# Apply the binning function to the DataFrame
combined_data['Attendance_Bin'] = combined_data.apply(apply_bins, axis=1)

# Ensure all bins are used by checking unique labels and adjusting if necessary
combined_data.dropna(subset=['Attendance_Bin'], inplace=True)
combined_data['Attendance_Bin'] = combined_data['Attendance_Bin'].astype(int)

# Encode the attendance bins as numerical labels
y = combined_data['Attendance_Bin']

# Separate Day_Encoded and Hour to handle them correctly
day_encoded = combined_data['Day_Encoded'].values.reshape(-1, 1)
hour = combined_data['Hour'].values.reshape(-1, 1)

# Standardize only the 'Hour' feature
scaler = StandardScaler()
hour_scaled = scaler.fit_transform(hour)

# Combine back the correctly processed features
X_scaled = np.hstack([day_encoded, hour_scaled])

# Reshape X for CNN input: (samples, time steps, features)
X_scaled = X_scaled.reshape(X_scaled.shape[0], X_scaled.shape[1], 1)

# Convert labels to categorical (one-hot encoding)
y_categorical = to_categorical(y)

# Ensure the number of classes in the model matches the target labels
num_classes = y_categorical.shape[1]

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_categorical, test_size=0.2, random_state=42)

# Define CNN model architecture
model = Sequential([
    Conv1D(filters=64, kernel_size=1, activation='relu', input_shape=(X_train.shape[1], 1)),
    MaxPooling1D(pool_size=1),  # Adjusted pool size to 1
    Flatten(),
    Dense(50, activation='relu'),
    Dropout(0.5),
    Dense(num_classes, activation='softmax')  # Output layer for number of classes detected
])

# Compile the model
model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])

# Train the model
history = model.fit(X_train, y_train, epochs=20, batch_size=16, validation_split=0.2, verbose=1)

# Evaluate the model on test data
test_loss, test_accuracy = model.evaluate(X_test, y_test, verbose=0)
print(f"Test Loss: {test_loss}, Test Accuracy: {test_accuracy}")

# Step 6: Predict for a Specific Day - Monday
# Encode 'Monday' using the label encoder used in training
monday_encoded = label_encoder_day.transform(['Tuesday'])[0]

# Prepare input features for each hour of Tuesday (0 to 23)
hours = np.arange(0, 24).reshape(-1, 1)  # Hours of the day

# Standardize the 'Hour' feature using the scaler used during training
hours_scaled = scaler.transform(hours)

# Combine the 'Day_Encoded' and scaled 'Hour' features
monday_features = np.hstack([np.full((24, 1), monday_encoded), hours_scaled])

# Reshape the data for CNN input: (samples, time steps, features)
monday_features = monday_features.reshape(monday_features.shape[0], monday_features.shape[1], 1)

# Make predictions for Tuesday
monday_predictions = model.predict(monday_features)

# Convert predictions from one-hot encoded format to labels (attendance bins)
monday_pred_labels = np.argmax(monday_predictions, axis=1)

# Decode the attendance bins into human-readable ranges if needed
monday_bins_labels = [f'{day_bins["Tuesday"][i]}-{day_bins["Tuesday"][i+1]}' for i in range(len(day_bins["Tuesday"]) - 1)]
decoded_predictions = [monday_bins_labels[label] for label in monday_pred_labels]

# Display the predictions for each hour
predictions_df = pd.DataFrame({
    'Hour': range(24),
    'Predicted Attendance Bin': monday_pred_labels,
    'Decoded Prediction': decoded_predictions
})

print(predictions_df)

tf.saved_model.save(model, 'models/hourly_predictions/1')

new_model = tf.saved_model.load('hourly_predictions/1')
new_model.summary()
tf.saved_model.save(new_model, 'serving/')
# Function to predict attendance bins for a specific day
def predict_for_day(day: str, hours: np.ndarray = np.arange(0, 24)):
    # Encode the specified day using the fitted label encoder
    day_encoded = label_encoder_day.transform([day])[0]

    # Ensure hours are in the correct shape and scale them
    hours = hours.reshape(-1, 1)
    hours_scaled = scaler.transform(hours)

    # Combine the 'Day_Encoded' and scaled 'Hour' features
    day_features = np.hstack([np.full((hours.shape[0], 1), day_encoded), hours_scaled])

    # Reshape the data for CNN input: (samples, time steps, features)
    day_features = day_features.reshape(day_features.shape[0], day_features.shape[1], 1)

    # Make predictions for the specified day
    predictions = model.predict(day_features)

    # Convert predictions from one-hot encoded format to labels (attendance bins)
    pred_labels = np.argmax(predictions, axis=1)

    # Decode the attendance bins into human-readable ranges if needed
    bins_labels = [f'{day_bins[day][i]}-{day_bins[day][i+1]}' for i in range(len(day_bins[day]) - 1)]
    decoded_predictions = [bins_labels[label] for label in pred_labels]

    # Create a DataFrame to display the predictions
    predictions_df = pd.DataFrame({
        'Hour': hours.flatten(),
        'Predicted Attendance Bin': pred_labels,
        'Decoded Prediction': decoded_predictions
    })

    return predictions_df

monday_predictions = predict_for_day('Monday')
print(monday_predictions)

# Make predictions for Tuesday from 9 AM to 5 PM (9-17 hours)
tuesday_predictions = predict_for_day('Tuesday', np.arange(5, 19))
print(tuesday_predictions)

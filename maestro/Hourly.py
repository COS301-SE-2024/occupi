import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Conv1D, MaxPooling1D, Flatten, Dense, Dropout, LSTM
from tensorflow import keras
import numpy as np
import joblib

# Load the Excel file
file_path = 'datasets/Hourly_Predictions.xlsx'  # Replace with your actual file path
excel_data = pd.ExcelFile(file_path)

# Combine all sheets into one DataFrame
sheets_data = {sheet: excel_data.parse(sheet) for sheet in excel_data.sheet_names}
combined_data = pd.concat(sheets_data.values(), keys=sheets_data.keys(), names=['Day', 'Index']).reset_index(level=1, drop=True).reset_index()

# Data Preparation
label_encoder_day = LabelEncoder()
combined_data['Day_Encoded'] = label_encoder_day.fit_transform(combined_data['Day'].fillna('Unknown'))

# Extract hour from 'Time' column
combined_data['Hour'] = combined_data['Time'].apply(lambda t: t.hour if pd.notnull(t) else 0)

# Define bins and labels for each day (customized for each day of the week)
day_bins = {
    'Monday': [0, 50, 100, 150, 200, 250, 300, float('inf')],
    'Tuesday': [0, 300, 600, 900, 1200, 1500, 1800, float('inf')],
    'Wednesday': [0, 50, 100, 150, 200, 250, 300, float('inf')],
    'Thursday': [0, 300, 600, 900, 1200, 1500, 1800, float('inf')],
    'Friday': [0, 50, 100, 150, 200, 250, 300, float('inf')],
    'Saturday': [0, 25, 50, 75, 100, 125, 150, float('inf')],
    'Sunday': [0, 10, 20, 30, 40, 50, 60, float('inf')],
}

day_labels = {
    'Monday': list(range(len(day_bins['Monday']) - 1)),
    'Tuesday': list(range(len(day_bins['Tuesday']) - 1)),
    'Wednesday': list(range(len(day_bins['Wednesday']) - 1)),
    'Thursday': list(range(len(day_bins['Thursday']) - 1)),
    'Friday': list(range(len(day_bins['Friday']) - 1)),
    'Saturday': list(range(len(day_bins['Saturday']) - 1)),
    'Sunday': list(range(len(day_bins['Sunday']) - 1)),
}

# Function to apply appropriate bins for each day
def apply_bins(row):
    day = row['Day']
    bins = day_bins.get(day, [0, float('inf')])  # Default if not found
    labels = day_labels.get(day, [0])
    return pd.cut([row['Attendance']], bins=bins, labels=labels, include_lowest=True)[0]

combined_data['Attendance_Bin'] = combined_data.apply(apply_bins, axis=1)

# Drop missing bins and convert to integers
combined_data.dropna(subset=['Attendance_Bin'], inplace=True)
combined_data['Attendance_Bin'] = combined_data['Attendance_Bin'].astype(int)

# Encode attendance bins
y = combined_data['Attendance_Bin']

# Standardize the 'Hour' feature
scaler = StandardScaler()
hour_scaled = scaler.fit_transform(combined_data['Hour'].values.reshape(-1, 1))
joblib.dump(scaler, 'hourly_scaler.pkl')

# Prepare features
X_scaled = np.hstack([combined_data['Day_Encoded'].values.reshape(-1, 1), hour_scaled])

# Reshape for CNN input
X_scaled = X_scaled.reshape(X_scaled.shape[0], X_scaled.shape[1], 1)

# Convert labels to categorical
y_categorical = keras.utils.to_categorical(y)
num_classes = y_categorical.shape[1]

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_categorical, test_size=0.2, random_state=42)

# Define CNN + LSTM model
model = keras.Sequential([
    keras.layers.Conv1D(input_shape=(X_train.shape[1], 1), filters=64, kernel_size=1, activation='relu', name='Conv1D'),
    keras.layers.MaxPooling1D(pool_size=1, name='MaxPool1D'),
    keras.layers.LSTM(50, return_sequences=False, name='LSTM'),
    keras.layers.Flatten(name='Flatten'),
    keras.layers.Dense(50, activation='relu', name='Dense_1'),
    keras.layers.Dropout(0.5, name='Dropout'),
    keras.layers.Dense(num_classes, activation='softmax', name='Output')
])

# Print the model summary
model.summary()

# Compile the model
model.compile(optimizer='adam', 
              loss=keras.losses.CategoricalCrossentropy(from_logits=False),  # From logits is False since output is softmax
              metrics=[keras.metrics.CategoricalAccuracy()])

# Define training parameters
epochs = 30
batch_size = 16
testing = False

# Train the model
model.fit(X_train, y_train, epochs=epochs, batch_size=batch_size, validation_split=0.2)

# Evaluate the model
test_loss, test_acc = model.evaluate(X_test, y_test)
print('\nTest accuracy: {}'.format(test_acc))

# Save the model
# model.export('python-code/models/hourly_predictions/1')

def predict_for_day_hour(model, day, hour, label_encoder, scaler):
    """
    Predict attendance for a specific day and hour.

    Parameters:
    model: Trained Keras model used for predictions.
    day: String representing the day of the week (e.g., 'Monday').
    hour: Integer representing the hour of the day (0-23).
    label_encoder: LabelEncoder instance used to encode day labels during training.
    scaler: StandardScaler instance used to scale hour feature during training.

    Returns:
    predicted_bin: Predicted attendance bin for the input day and hour.
    """
    # Encode the day using the label encoder (same as training)
    day_encoded = label_encoder.transform([day])[0]
    
    # Scale the hour using the same scaler as in training
    hour_scaled = scaler.transform(np.array([[hour]]))
    
    # Prepare the input (reshape to match model's input shape)
    input_data = np.array([[day_encoded, hour_scaled[0][0]]]).reshape(1, 2, 1)
    
    # Predict the attendance bin (returns a probability for each class)
    prediction = model.predict(input_data)
    print(prediction)
    
    # Convert the prediction from probabilities to class (attendance bin)
    predicted_bin = np.argmax(prediction, axis=1)[0]
    
    return predicted_bin

# Example usage
day_input = 'Monday'
hour_input = 10  # 10 AM
predicted_bin = predict_for_day_hour(model, day_input, hour_input, label_encoder_day, scaler)
print(f"Predicted attendance bin for {day_input} at {hour_input}:00 is {predicted_bin}")


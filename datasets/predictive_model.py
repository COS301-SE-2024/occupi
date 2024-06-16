import pandas as pd
import tensorflow as tf
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.model_selection import train_test_split
from tensorflow.keras import Sequential #type: ignore
from tensorflow.keras.layers import Dense, Dropout #type: ignore
from tensorflow.keras.callbacks import EarlyStopping #type: ignore
from tensorflow.keras.optimizers import Adam #type: ignore
import matplotlib.pyplot as plt
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import seaborn as sns
from keras_tuner import Hyperband

# Load the dataset
file_path = 'datasets/Attendance_data.csv'
attendance_data = pd.read_csv(file_path)

# Ensure 'Day_of_Week' is treated as a categorical variable
attendance_data['Day_of_Week'] = pd.Categorical(attendance_data['Day_of_Week'], 
                                                categories=["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                                                ordered=True)

# Create a scatter plot
plt.figure(figsize=(12, 6))
sns.scatterplot(x='Day_of_Week', y='Number_Attended', data=attendance_data)
plt.title('Number of Attendees Across Days of the Week (Scatter Plot)')
plt.xlabel('Day of the Week')
plt.ylabel('Number of Attendees')
plt.show()

# Encode 'Day_of_Week' using one-hot encoding
onehot_encoder = OneHotEncoder(sparse_output=False, drop='first')
day_of_week_encoded = onehot_encoder.fit_transform(attendance_data[['Day_of_Week']])
day_of_week_encoded_df = pd.DataFrame(day_of_week_encoded, columns=onehot_encoder.get_feature_names_out(['Day_of_Week']))

# Concatenate the encoded columns to the dataframe
attendance_data = pd.concat([attendance_data, day_of_week_encoded_df], axis=1)

# Define feature (Day_of_Week encoded columns) and target (Number_Attended)
X = day_of_week_encoded_df
y = attendance_data['Number_Attended']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# Standardize the feature variables (not strictly necessary for one-hot encoded data, but can be helpful for neural networks)
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Define the model-building function with number of layers as a tunable hyperparameter
def build_model(hp):
    model = Sequential()
    model.add(Dense(units=hp.Int('units_1', min_value=32, max_value=512, step=32), activation='relu', input_shape=(X_train_scaled.shape[1],)))
    model.add(Dropout(rate=hp.Float('dropout_1', min_value=0.0, max_value=0.7, step=0.1)))
    for i in range(hp.Int('num_layers', 2, 25)):
        model.add(Dense(units=hp.Int(f'units_{i}', min_value=32, max_value=512, step=32), activation='relu'))
        model.add(Dropout(rate=hp.Float(f'dropout_{i}', min_value=0.0, max_value=0.7, step=0.1)))
    
    model.add(Dense(1, activation='linear'))  # Single output for regression

    # Tune the learning rate and optimizer
    learning_rate = hp.Float('learning_rate', min_value=1e-4, max_value=1e-2, sampling='LOG')
    optimizer = Adam(learning_rate=learning_rate)

    model.compile(optimizer=optimizer, loss='mean_squared_error')
    return model

# Initialize the Hyperband Tuner
tuner = Hyperband(
    build_model,
    objective='val_loss',
    max_epochs=100,
    factor=3,
    directory='hyperband',
    project_name='attendance'
)

# Run the hyperparameter search
tuner.search(X_train_scaled, y_train, epochs=100, validation_split=0.2, callbacks=[EarlyStopping(monitor='val_loss', patience=10)])

# Get the best hyperparameters
best_hps = tuner.get_best_hyperparameters(num_trials=1)[0]

# Print the best hyperparameters
print(f"""
The optimal number of units in the first densely connected layer is {best_hps.get('units_1')}.
The optimal number of units in the second densely connected layer is {best_hps.get('units_2')}.
The optimal number of units in the third densely connected layer is {best_hps.get('units_3')}.
The optimal dropout rate for the first layer is {best_hps.get('dropout_1')}.
The optimal dropout rate for the second layer is {best_hps.get('dropout_2')}.
""")

# Use early stopping to avoid overfitting
early_stopping = EarlyStopping(monitor='val_loss', patience=60, restore_best_weights=True)

# Train the model
model = build_model(best_hps)
history = model.fit(X_train_scaled, y_train, epochs=250, batch_size=175, validation_split=0.25, callbacks=[early_stopping])

# Evaluate the model
test_loss = model.evaluate(X_test_scaled, y_test)
print(f"Test loss: {test_loss}")

# Make predictions
predictions = model.predict(X_test_scaled)

# Convert the predictions to a 1D array
predictions = predictions.flatten()

# Get the original day of the week for the test set
days_of_week_test = attendance_data.loc[y_test.index, 'Day_of_Week']

# Plot the true values vs predicted values
plt.figure(figsize=(10, 6))
plt.scatter(y_test, predictions, alpha=0.5)
plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'k--', lw=2)
plt.xlabel('True Values')
plt.ylabel('Predicted Values')
plt.title('True Values vs Predicted Values')
plt.show()

# Calculate the metrics
mse = mean_squared_error(y_test, predictions)
mae = mean_absolute_error(y_test, predictions)
r2 = r2_score(y_test, predictions)

print(f"Mean Squared Error (MSE): {mse}")
print(f"Mean Absolute Error (MAE): {mae}")
print(f"R-squared (R²): {r2}")

# Create a table of true and predicted values with the day of the week
results_df = pd.DataFrame({
    'Day of Week': days_of_week_test,
    'True Values': y_test,
    'Predicted Values': predictions
})

# Display the first few rows of the table
print(results_df.head())


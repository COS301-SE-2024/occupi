import pandas as pd
import numpy as np
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.model_selection import train_test_split, KFold
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import tensorflow as tf
from tensorflow.keras import Sequential #type: ignore
from tensorflow.keras.layers import Dense, Dropout #type: ignore
from tensorflow.keras.callbacks import EarlyStopping #type: ignore
from tensorflow.keras.optimizers import Adam #type: ignore
import xgboost as xgb
import matplotlib.pyplot as plt
import seaborn as sns
from keras_tuner import Hyperband

# Load the dataset
file_path = 'datasets/Attendance_data(1).csv'
attendance_data = pd.read_csv(file_path)

# Ensure 'Day_of_Week' is treated as a categorical variable
attendance_data['Day_of_Week'] = pd.Categorical(attendance_data['Day_of_Week'], 
                                                categories=["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
                                                ordered=True)

# Extract more date features
attendance_data['Date'] = pd.to_datetime(attendance_data['Date'])
attendance_data['Month'] = attendance_data['Date'].dt.month
attendance_data['Week'] = attendance_data['Date'].dt.isocalendar().week
attendance_data['Quarter'] = attendance_data['Date'].dt.quarter
attendance_data['Day_of_Month'] = attendance_data['Date'].dt.day
attendance_data['Is_Weekend'] = attendance_data['Day_of_Week'].isin(['Saturday', 'Sunday']).astype(int)

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

# Define features and target
features = ['Month', 'Week', 'Quarter', 'Day_of_Month', 'Is_Weekend'] + list(onehot_encoder.get_feature_names_out(['Day_of_Week']))
X = attendance_data[features]
y = attendance_data['Number_Attended']

# Initial train-test split
X_train_full, X_test, y_train_full, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Standardize the feature variables
scaler = StandardScaler()
X_train_full_scaled = scaler.fit_transform(X_train_full)
X_test_scaled = scaler.transform(X_test)

# Convert scaled data back to DataFrame to retain column names for XGBoost
X_train_full_scaled = pd.DataFrame(X_train_full_scaled, columns=features)
X_test_scaled = pd.DataFrame(X_test_scaled, columns=features)

# Define the model-building function with number of layers as a tunable hyperparameter
def build_model(hp):
    model = Sequential()
    model.add(Dense(units=hp.Int('units_1', min_value=32, max_value=512, step=32), activation='relu', input_shape=(X_train_full_scaled.shape[1],)))
    model.add(Dropout(rate=hp.Float('dropout_1', min_value=0.0, max_value=0.7, step=0.1)))
    for i in range(hp.Int('num_layers', 2, 10)):
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

# K-Fold Cross-Validation on the training set
kf = KFold(n_splits=5, shuffle=True, random_state=42)
fold = 1

mse_scores = []
mae_scores = []
r2_scores = []

for train_index, val_index in kf.split(X_train_full_scaled):
    print(f"Training fold {fold}...")
    
    X_train, X_val = X_train_full_scaled.iloc[train_index], X_train_full_scaled.iloc[val_index]
    y_train, y_val = y_train_full.iloc[train_index], y_train_full.iloc[val_index]
    
    # Run the hyperparameter search on the training data
    tuner.search(X_train, y_train, epochs=100, validation_split=0.2, callbacks=[EarlyStopping(monitor='val_loss', patience=10)])
    
    # Get the best hyperparameters
    best_hps = tuner.get_best_hyperparameters(num_trials=1)[0]
    
    # Build the model with the best hyperparameters
    model = build_model(best_hps)
    
    # Use early stopping to avoid overfitting
    early_stopping = EarlyStopping(monitor='val_loss', patience=72, restore_best_weights=True)
    
    # Train the model
    history = model.fit(X_train, y_train, epochs=100, batch_size=75, validation_split=0.25, callbacks=[early_stopping], verbose=0)
    
    # Evaluate the model
    predictions = model.predict(X_val).flatten()
    
    mse = mean_squared_error(y_val, predictions)
    mae = mean_absolute_error(y_val, predictions)
    r2 = r2_score(y_val, predictions)
    
    mse_scores.append(mse)
    mae_scores.append(mae)
    r2_scores.append(r2)
    
    print(f"Fold {fold} - MSE: {mse}, MAE: {mae}, R2: {r2}")
    fold += 1

# Calculate the average scores from cross-validation
average_mse = np.mean(mse_scores)
average_mae = np.mean(mae_scores)
average_r2 = np.mean(r2_scores)

print(f"Average MSE: {average_mse}")
print(f"Average MAE: {average_mae}")
print(f"Average R2: {average_r2}")

# Train the final model on the full training set with the best hyperparameters
model = build_model(best_hps)
early_stopping = EarlyStopping(monitor='val_loss', patience=72, restore_best_weights=True)
history = model.fit(X_train_full_scaled, y_train_full, epochs=350, batch_size=50, validation_split=0.25, callbacks=[early_stopping], verbose=0)

# Evaluate the model on the test set
test_predictions = model.predict(X_test_scaled).flatten()

# Calculate the metrics on the test set
test_mse = mean_squared_error(y_test, test_predictions)
test_mae = mean_absolute_error(y_test, test_predictions)
test_r2 = r2_score(y_test, test_predictions)

print(f"Test MSE: {test_mse}")
print(f"Test MAE: {test_mae}")
print(f"Test R2: {test_r2}")

# Plot the true values vs predicted values for the test set
plt.figure(figsize=(10, 6))
plt.scatter(y_test, test_predictions, alpha=0.5)
plt.plot([y_test.min(), y_test.max()], [y_test.min(), y_test.max()], 'k--', lw=2)
plt.xlabel('True Values')
plt.ylabel('Predicted Values')
plt.title('True Values vs Predicted Values')
plt.show()

# Create a table of true and predicted values with the day of the week
days_of_week_test = attendance_data.loc[y_test.index, 'Day_of_Week']
results_df = pd.DataFrame({
    'Day of Week': days_of_week_test,
    'True Values': y_test,
    'Predicted Values': test_predictions
})

# Display the first few rows of the table
print(results_df.head())

# Save the model
# model.save('attendance_model.keras')

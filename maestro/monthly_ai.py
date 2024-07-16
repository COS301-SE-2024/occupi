import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split, RandomizedSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from xgboost import XGBRegressor
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Dropout
from tensorflow.keras.callbacks import EarlyStopping
from sklearn.metrics import mean_squared_error, r2_score
from scipy.stats import randint, uniform

# Load the CSV file
file_path = '../datasets/Monthly_OfficeCapacity (1).csv'  # Update with the correct path

# Ensure the file path is correct
try:
    df = pd.read_csv(file_path)
except FileNotFoundError:
    print(f"File not found. Please check the path: {file_path}")
    exit(1)

# Calculate the monthly average for office capacity
monthly_avg = df.groupby('Month')['Occupancy'].mean().reset_index()
monthly_avg.columns = ['Month', 'Average_Occupancy']

# Display the result
print("Monthly Average Office Capacity")
print(monthly_avg)

# Feature Engineering
# Creating lagged features and encoding categorical variables
df['Lag1'] = df['Occupancy'].shift(1)
df['Lag2'] = df['Occupancy'].shift(2)
df = pd.get_dummies(df, columns=['Month', 'Season', 'Quarter', 'Is_Holiday'], drop_first=True)

# Drop NaN values created by shifting
df = df.dropna()

# Prepare feature matrix X and target vector y
X = df.drop(columns=['id', 'Occupancy'])
y = df['Occupancy']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Scale the features
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

# Define and train models with hyperparameter tuning

# Random Forest
rf = RandomForestRegressor()
rf_param_dist = {
    'n_estimators': randint(100, 300),
    'max_depth': randint(10, 30),
    'min_samples_split': randint(2, 10),
    'min_samples_leaf': randint(1, 4)
}
rf_random_search = RandomizedSearchCV(estimator=rf, param_distributions=rf_param_dist, n_iter=50, cv=5, n_jobs=-1, verbose=2, random_state=42)
rf_random_search.fit(X_train, y_train)
rf_best_model = rf_random_search.best_estimator_

# Gradient Boosting
gb = GradientBoostingRegressor()
gb_param_dist = {
    'n_estimators': randint(100, 300),
    'learning_rate': uniform(0.01, 0.1),
    'max_depth': randint(3, 7),
    'subsample': uniform(0.8, 0.2),
    'min_samples_split': randint(2, 10),
    'min_samples_leaf': randint(1, 4)
}
gb_random_search = RandomizedSearchCV(estimator=gb, param_distributions=gb_param_dist, n_iter=50, cv=5, n_jobs=-1, verbose=2, random_state=42)
gb_random_search.fit(X_train, y_train)
gb_best_model = gb_random_search.best_estimator_

# XGBoost
xgb = XGBRegressor()
xgb_param_dist = {
    'n_estimators': randint(100, 300),
    'learning_rate': uniform(0.01, 0.1),
    'max_depth': randint(3, 10),
    'subsample': uniform(0.7, 0.3),
    'colsample_bytree': uniform(0.7, 0.3),
    'min_child_weight': randint(1, 10)
}
xgb_random_search = RandomizedSearchCV(estimator=xgb, param_distributions=xgb_param_dist, n_iter=50, cv=5, n_jobs=-1, verbose=2, random_state=42)
xgb_random_search.fit(X_train, y_train)
xgb_best_model = xgb_random_search.best_estimator_

# Neural Network
def create_model():
    model = Sequential()
    model.add(Dense(128, input_dim=X_train_scaled.shape[1], activation='relu'))
    model.add(Dropout(0.2))
    model.add(Dense(64, activation='relu'))
    model.add(Dense(1, activation='linear'))
    model.compile(optimizer='adam', loss='mse', metrics=['mse'])
    return model

model = create_model()
early_stopping = EarlyStopping(monitor='val_loss', patience=10, restore_best_weights=True)
history = model.fit(X_train_scaled, y_train, validation_split=0.2, epochs=200, batch_size=32, callbacks=[early_stopping], verbose=1)

# Evaluate models
models = {
    "Random Forest": rf_best_model,
    "Gradient Boosting": gb_best_model,
    "XGBoost": xgb_best_model,
    "Neural Network": model
}

results = {}

for name, model in models.items():
    if name == "Neural Network":
        y_pred = model.predict(X_test_scaled)
    else:
        y_pred = model.predict(X_test)
    
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    accuracy = r2 * 100
    
    results[name] = {
        "Mean Squared Error": mse,
        "R^2": r2,
        "Accuracy (%)": accuracy
}

# Output the results
import json
results_json = json.dumps(results, indent=4)
print("Model Tuning Results")
print(results_json)

# Plot training history for Neural Network
plt.figure(figsize=(12, 6))
plt.plot(history.history['loss'], label='Train Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.xlabel('Epochs')
plt.ylabel('Mean Squared Error')
plt.title('Training History')
plt.legend()
plt.show()

# Visualization of predictions
plt.figure(figsize=(18, 6))

# Random Forest predictions
plt.subplot(1, 3, 1)
plt.scatter(y_test, models["Random Forest"].predict(X_test), alpha=0.3)
plt.plot([y.min(), y.max()], [y.min(), y.max()], '--r', linewidth=2)
plt.xlabel('Actual Occupancy')
plt.ylabel('Predicted Occupancy')
plt.title('Random Forest Predictions')

# Gradient Boosting predictions
plt.subplot(1, 3, 2)
plt.scatter(y_test, models["Gradient Boosting"].predict(X_test), alpha=0.3)
plt.plot([y.min(), y.max()], [y.min(), y.max()], '--r', linewidth=2)
plt.xlabel('Actual Occupancy')
plt.ylabel('Predicted Occupancy')
plt.title('Gradient Boosting Predictions')

# XGBoost predictions
plt.subplot(1, 3, 3)
plt.scatter(y_test, models["XGBoost"].predict(X_test), alpha=0.3)
plt.plot([y.min(), y.max()], [y.min(), y.max()], '--r', linewidth=2)
plt.xlabel('Actual Occupancy')
plt.ylabel('Predicted Occupancy')
plt.title('XGBoost Predictions')

plt.tight_layout()
plt.show()

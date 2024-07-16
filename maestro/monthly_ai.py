import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, TimeSeriesSplit
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.svm import SVR
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.feature_selection import RFE
import matplotlib.pyplot as plt
import xgboost as xgb
from sklearn.impute import SimpleImputer
from prophet import Prophet
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense
from tensorflow.keras.optimizers import Adam
from statsmodels.tsa.statespace.sarimax import SARIMAX

# Load the data
df = pd.read_csv('../datasets/Monthly_OfficeCapacity.csv')

# Convert Month to numerical
month_map = {'January': 1, 'February': 2, 'March': 3, 'April': 4, 'May': 5, 'June': 6,
             'July': 7, 'August': 8, 'September': 9, 'October': 10, 'November': 11, 'December': 12}
df['Month_Num'] = df['Month'].map(month_map)

# Sort the dataframe by date
df['Date'] = pd.to_datetime(df['Year'].astype(str) + '-' + df['Month_Num'].astype(str) + '-01')
df = df.sort_values('Date')

# Feature engineering
df['Rolling_Mean_3'] = df['Occupancy'].rolling(window=3).mean()
df['Rolling_Mean_6'] = df['Occupancy'].rolling(window=6).mean()
df['Rolling_Mean_12'] = df['Occupancy'].rolling(window=12).mean()
df['Day_of_Week'] = df['Date'].dt.dayofweek
df['Week_of_Year'] = df['Date'].dt.isocalendar().week
df['Is_Weekend'] = df['Day_of_Week'].isin([5, 6]).astype(int)

# Forward fill NaN values
df = df.ffill()

# Prepare features and target
target = 'Occupancy'
features = ['Month_Num', 'Year', 'Is_Holiday', 'Rolling_Mean_3', 'Rolling_Mean_6', 'Rolling_Mean_12',
            'Day_of_Week', 'Week_of_Year', 'Is_Weekend']
X = df[features]
y = df[target]

# Split the data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, shuffle=False)

# Define preprocessing steps
preprocessor = Pipeline([
    ('imputer', SimpleImputer(strategy='median')),
    ('scaler', StandardScaler()),
])

# Define models
models = {
    'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42),
    'Gradient Boosting': GradientBoostingRegressor(random_state=42),
    'SVR': SVR(kernel='rbf'),
    'XGBoost': xgb.XGBRegressor(random_state=42)
}

# Train and evaluate models
for name, model in models.items():
    pipeline = Pipeline([
        ('preprocessor', preprocessor),
        ('feature_selection', RFE(estimator=RandomForestRegressor(n_estimators=10, random_state=42), n_features_to_select=min(len(features), X.shape[1]))),
        ('regressor', model)
    ])
    
    # Cross-validation
    tscv = TimeSeriesSplit(n_splits=5)
    scores = cross_val_score(pipeline, X_train, y_train, cv=tscv, scoring='r2')
    print(f"\n{name} Cross-validation scores:", scores)
    print(f"{name} Average cross-validation score:", scores.mean())
    
    # Train the model and make predictions
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    
    # Evaluate the model
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    print(f"{name} Mean Squared Error:", mse)
    print(f"{name} R2 Score:", r2)

# Prophet model
# Prophet model
prophet_df = df[['Date', target, 'Is_Holiday']].rename(columns={'Date': 'ds', target: 'y'})
prophet_df['Quarter'] = df['Date'].dt.quarter  # Add Quarter information

model = Prophet(yearly_seasonality=True, weekly_seasonality=False, daily_seasonality=False)
model.add_regressor('Is_Holiday')
model.add_regressor('Quarter')
model.fit(prophet_df)

# Create future dataframe for the length of y_test
future = model.make_future_dataframe(periods=len(y_test), freq='MS')

# Ensure future dataframe doesn't exceed the original data length
future = future.iloc[:len(df)]

future['Is_Holiday'] = df['Is_Holiday'].values
future['Quarter'] = df['Date'].dt.quarter.values

forecast = model.predict(future)
prophet_pred = forecast.tail(len(y_test))['yhat']
prophet_mse = mean_squared_error(y_test, prophet_pred)
prophet_r2 = r2_score(y_test, prophet_pred)
print("\nProphet Mean Squared Error:", prophet_mse)
print("Prophet R2 Score:", prophet_r2)

# Print shapes for debugging
print("df shape:", df.shape)
print("prophet_df shape:", prophet_df.shape)
print("future shape:", future.shape)
print("y_test shape:", y_test.shape)

# LSTM model Adjust the data scaling:
scaler = StandardScaler()
scaled_occupancy = scaler.fit_transform(df[['Occupancy']])
scaled_features = StandardScaler().fit_transform(df[features])
scaled_data = np.hstack((scaled_occupancy, scaled_features))

# Remove any rows with NaN values
scaled_data = scaled_data[~np.isnan(scaled_data).any(axis=1)]

print("Scaled data shape after removing NaNs:", scaled_data.shape)

X_lstm, y_lstm = [], []
for i in range(12, len(scaled_data)):
    X_lstm.append(scaled_data[i-12:i, :])
    y_lstm.append(scaled_data[i, 0])
X_lstm, y_lstm = np.array(X_lstm), np.array(y_lstm)

# Print shapes to verify dimensions
print("X_lstm shape:", X_lstm.shape)
print("y_lstm shape:", y_lstm.shape)

# Modify the LSTM model architecture:
X_train_lstm, X_test_lstm, y_train_lstm, y_test_lstm = train_test_split(X_lstm, y_lstm, test_size=0.2, random_state=42, shuffle=False)

X_test_lstm = X_lstm[-len(y_test):]
y_test_lstm = y_lstm[-len(y_test):]

model = Sequential([
    LSTM(50, return_sequences=True, input_shape=(X_train_lstm.shape[1], X_train_lstm.shape[2])),
    LSTM(50),
    Dense(1)
])
model.compile(optimizer=Adam(learning_rate=0.001), loss='mean_squared_error')
model.fit(X_train_lstm, y_train_lstm, epochs=50, batch_size=32, validation_split=0.1, verbose=1)

lstm_pred = model.predict(X_test_lstm)
lstm_pred = lstm_pred.reshape(-1, 1)  # Reshape to 2D array

# Inverse transform only the occupancy column
lstm_pred_inverse = scaler.inverse_transform(np.hstack((lstm_pred, np.zeros((lstm_pred.shape[0], X.shape[1]-1)))))[:, 0]
y_test_lstm = y_test_lstm.reshape(-1, 1)
y_test_lstm_inverse = scaler.inverse_transform(np.hstack((y_test_lstm, np.zeros((y_test_lstm.shape[0], X.shape[1]-1)))))[:, 0]

# Calculate metrics
lstm_mse = mean_squared_error(y_test_lstm_inverse, lstm_pred_inverse)
lstm_r2 = r2_score(y_test_lstm_inverse, lstm_pred_inverse)
print("\nLSTM Mean Squared Error:", lstm_mse)
print("LSTM R2 Score:", lstm_r2)

# SARIMA model
sarima_model = SARIMAX(df['Occupancy'], order=(1, 1, 1), seasonal_order=(1, 1, 1, 12), enforce_stationarity=False, enforce_invertibility=False)
sarima_results = sarima_model.fit()
sarima_pred = sarima_results.forecast(steps=len(y_test))
sarima_mse = mean_squared_error(y_test, sarima_pred)
sarima_r2 = r2_score(y_test, sarima_pred)
print("\nSARIMA Mean Squared Error:", sarima_mse)
print("SARIMA R2 Score:", sarima_r2)

# Visualize results
plt.figure(figsize=(12, 6))
plt.plot(y_test.index, y_test.values, label='Actual')
plt.plot(y_test.index, y_pred, label='Best ML Model')
plt.plot(y_test.index, prophet_pred.values, label='Prophet')
plt.plot(y_test.index[-len(lstm_pred_inverse):], lstm_pred_inverse, label='LSTM')
plt.plot(y_test.index, sarima_pred, label='SARIMA')
plt.title('Model Comparisons')
plt.legend()
plt.show()

# Feature importance for the best model (assuming Gradient Boosting)
selected_features = pipeline.named_steps['feature_selection'].get_support()
selected_feature_names = np.array(features)[selected_features]
feature_importance = pipeline.named_steps['regressor'].feature_importances_
feature_importance = 100.0 * (feature_importance / feature_importance.max())
sorted_idx = np.argsort(feature_importance)
pos = np.arange(sorted_idx.shape[0]) + .5

plt.figure(figsize=(12, 6))
plt.barh(pos, feature_importance[sorted_idx], align='center')
plt.yticks(pos, selected_feature_names[sorted_idx])
plt.xlabel('Relative Importance')
plt.title('Feature Importance (Gradient Boosting)')
plt.show()

# Remove NaN values
mask = ~np.isnan(lstm_pred) & ~np.isnan(y_test_lstm)
lstm_pred = lstm_pred[mask]
y_test_lstm = y_test_lstm[mask]

if len(lstm_pred) > 0:
    lstm_mse = mean_squared_error(y_test_lstm, lstm_pred)
    lstm_r2 = r2_score(y_test_lstm, lstm_pred)
    print("\nLSTM Mean Squared Error:", lstm_mse)
    print("LSTM R2 Score:", lstm_r2)
else:
    print("\nWarning: All LSTM predictions are NaN. Unable to calculate metrics.")
    

# SARIMA model
sarima_model = SARIMAX(df['Occupancy'], order=(1, 1, 1), seasonal_order=(1, 1, 1, 12), enforce_stationarity=False, enforce_invertibility=False)
sarima_results = sarima_model.fit()
sarima_pred = sarima_results.forecast(steps=len(y_test))
sarima_mse = mean_squared_error(y_test, sarima_pred)
sarima_r2 = r2_score(y_test, sarima_pred)
print("\nSARIMA Mean Squared Error:", sarima_mse)
print("SARIMA R2 Score:", sarima_r2)

# Visualize results
plt.figure(figsize=(12, 6))
plt.plot(y_test.index, y_test.values, label='Actual')
plt.plot(y_test.index, y_pred, label='Best ML Model')
plt.plot(y_test.index, prophet_pred.values, label='Prophet')
plt.plot(y_test.index[-len(lstm_pred_inverse):], lstm_pred_inverse, label='LSTM')
plt.plot(y_test.index, sarima_pred, label='SARIMA')
plt.title('Model Comparisons')
plt.legend()
plt.show()

# Feature importance for the best model (assuming Gradient Boosting)
selected_features = pipeline.named_steps['feature_selection'].get_support()
selected_feature_names = np.array(features)[selected_features]
feature_importance = pipeline.named_steps['regressor'].feature_importances_
feature_importance = 100.0 * (feature_importance / feature_importance.max())
sorted_idx = np.argsort(feature_importance)
pos = np.arange(sorted_idx.shape[0]) + .5

plt.figure(figsize=(12, 6))
plt.barh(pos, feature_importance[sorted_idx], align='center')
plt.yticks(pos, selected_feature_names[sorted_idx])
plt.xlabel('Relative Importance')
plt.title('Feature Importance (Gradient Boosting)')
plt.show()

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, TimeSeriesSplit
from sklearn.metrics import r2_score, mean_absolute_error
from sklearn.preprocessing import LabelEncoder, StandardScaler
from xgboost import XGBRegressor
import holidays

# Load the CSV file
file_path = '../datasets/Monthly_OfficeCapacity (1).csv'
df = pd.read_csv(file_path)

# Data Preprocessing
df = df.drop('id', axis=1)
month_map = {month: index for index, month in enumerate(df['Month'].unique(), start=1)}
df['MonthNum'] = df['Month'].map(month_map)

# Calculate monthly average
df['MonthlyAverage'] = df.groupby('MonthNum')['Occupancy'].transform('mean')

# Ensure consistency between Month, Season, and Quarter
def get_season(month):
    if month in [12, 1, 2]:
        return 'Summer'
    elif month in [3, 4, 5]:
        return 'Autumn'
    elif month in [6, 7, 8]:
        return 'Winter'
    else:
        return 'Spring'

df['Season'] = df['MonthNum'].apply(get_season)
df['Quarter'] = df['MonthNum'].apply(lambda x: (x-1)//3 + 1)

# Create more features
df['Date'] = pd.to_datetime(df['Year'].astype(str) + '-' + df['Month'].astype(str) + '-01')
df['DayOfYear'] = df['Date'].dt.dayofyear
df['WeekOfYear'] = df['Date'].dt.isocalendar().week

# Create South African holidays
za_holidays = holidays.SouthAfrica()
df['IsZAHoliday'] = df['Date'].dt.strftime('%Y-%m-%d').isin(za_holidays)

# Lag features
df['PrevMonthOccupancy'] = df.groupby('Year')['Occupancy'].shift(1)

# Sort the dataframe by date to ensure proper time-based splitting
df = df.sort_values('Date')

# Prepare data for the predictive model
X = df.drop(['Month', 'Occupancy', 'MonthlyAverage', 'Date'], axis=1)
y = df['MonthlyAverage']

# Encode categorical variables
le = LabelEncoder()
X['Season'] = le.fit_transform(X['Season'])

# Fill missing values for numeric columns
numeric_cols = X.select_dtypes(include=[np.number]).columns
X[numeric_cols] = X[numeric_cols].fillna(X[numeric_cols].mean())
y = y.fillna(y.mean())

# Scale numerical features
scaler = StandardScaler()
X_scaled = pd.DataFrame(scaler.fit_transform(X), columns=X.columns)

# Add moderate random noise to features
X_scaled += np.random.normal(0, 0.18, X_scaled.shape)

# Add some randomness to the target variable
y += np.random.normal(0, y.std() * 0.07, y.shape)

# Use TimeSeriesSplit for time-based cross-validation
tscv = TimeSeriesSplit(n_splits=5)

# Initialize XGBoost model with balanced parameters
xgb_model = XGBRegressor(
    n_estimators=1000,
    learning_rate=0.01,
    max_depth=3,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42
)

# Perform time-series cross-validation
cv_scores = []
for train_index, test_index in tscv.split(X_scaled):
    X_train, X_test = X_scaled.iloc[train_index], X_scaled.iloc[test_index]
    y_train, y_test = y.iloc[train_index], y.iloc[test_index]
    
    xgb_model.fit(X_train, y_train)
    y_pred = xgb_model.predict(X_test)
    cv_scores.append(r2_score(y_test, y_pred))

print(f"Cross-validation scores: {cv_scores}")
print(f"Mean CV score: {np.mean(cv_scores):.2f}")

# Train on the entire dataset
xgb_model.fit(X_scaled, y)

# Feature importance
feature_importance = pd.DataFrame({'feature': X.columns, 'importance': xgb_model.feature_importances_})
feature_importance = feature_importance.sort_values('importance', ascending=False)
plt.figure(figsize=(10, 6))
sns.barplot(x='importance', y='feature', data=feature_importance.head(10))
plt.title('Top 10 Feature Importance')
plt.tight_layout()
plt.show()

# Visualize predictions vs actual values
y_pred = xgb_model.predict(X_scaled)
plt.figure(figsize=(12, 6))
plt.plot(df['Date'], y, label='Actual')
plt.plot(df['Date'], y_pred, label='Predicted')
plt.xlabel('Date')
plt.ylabel('Monthly Average Occupancy')
plt.title('Actual vs Predicted Monthly Average Occupancy Over Time')
plt.legend()
plt.tight_layout()
plt.show()
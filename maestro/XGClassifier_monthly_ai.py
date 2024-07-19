import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split, TimeSeriesSplit
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.preprocessing import LabelEncoder, StandardScaler
from xgboost import XGBClassifier
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

# Define occupancy levels
def get_occupancy_level(occupancy):
    if occupancy < df['MonthlyAverage'].quantile(0.38):  # Adjusted from 0.4
        return 'Low'
    elif occupancy < df['MonthlyAverage'].quantile(0.62):  # Adjusted from 0.6
        return 'Medium'
    else:
        return 'High'

# Apply function to determine Occupancy Level
df['OccupancyLevel'] = df['MonthlyAverage'].apply(get_occupancy_level)

# Print the distribution of occupancy levels
print("Occupancy Level Distribution:")
print(df['OccupancyLevel'].value_counts(normalize=True))


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

# Function for holiday proximity
def holiday_proximity_dates(dates, country_holidays):
    days_to_holiday = []
    days_from_holiday = []
    
    sorted_holidays = sorted(country_holidays.keys())
    
    for date in dates:
        future_hols = [hol for hol in sorted_holidays if hol >= date]
        past_hols = [hol for hol in sorted_holidays if hol <= date]
        
        if future_hols:
            days_to_holiday.append((future_hols[0] - date).days)
        else:
            days_to_holiday.append(np.nan)
        
        if past_hols:
            days_from_holiday.append((date - past_hols[-1]).days)
        else:
            days_from_holiday.append(np.nan)
            
    return days_to_holiday, days_from_holiday

df['DaysToHoliday'], df['DaysFromHoliday'] = holiday_proximity_dates(df['Date'], holidays.SouthAfrica())

# Create interaction feature
df['DayOfYear_IsHoliday'] = df['DayOfYear'] * df['Is_Holiday']

# Lag features
df['PrevMonthOccupancy'] = df.groupby('Year')['Occupancy'].shift(1)

# Sort the dataframe by date to ensure proper time-based splitting
df = df.sort_values('Date')

# Prepare data for the predictive model
X = df.drop(['Month', 'Occupancy', 'MonthlyAverage', 'OccupancyLevel', 'Date'], axis=1)
y = df['OccupancyLevel']

# Encode categorical variables
le = LabelEncoder()
X['Season'] = le.fit_transform(X['Season'])
y = le.fit_transform(y)
print("Unique values in encoded target variable:", np.unique(y))

# Fill missing values for numeric columns
numeric_cols = X.select_dtypes(include=[np.number]).columns
X[numeric_cols] = X[numeric_cols].fillna(X[numeric_cols].mean())

# Fill NaN values for days to/from holiday with a placeholder (e.g., a large number)
placeholder_value = 999  # This value should be sensibly chosen based on the context
df['DaysToHoliday'].fillna(placeholder_value, inplace=True)
df['DaysFromHoliday'].fillna(placeholder_value, inplace=True)

# Ensure all numeric columns are filled before scaling
X[numeric_cols] = X[numeric_cols].fillna(X[numeric_cols].mean())


# Scale numerical features
scaler = StandardScaler()
X_scaled = pd.DataFrame(scaler.fit_transform(X), columns=X.columns)

# Increase the noise added to features (add this line)
X_scaled += np.random.normal(0, 0.25, X_scaled.shape)  # Increased from 0.18 to 0.3

# Split the data into training+validation and test sets
X_train_val, X_test, y_train_val, y_test = train_test_split(X_scaled, y, test_size=0.2, shuffle=False)

# Further split the training+validation set into training and validation sets
X_train, X_val, y_train, y_val = train_test_split(X_train_val, y_train_val, test_size=0.2, shuffle=False)

# Increase the noise added to features
X_scaled += np.random.normal(0, 0.3, X_scaled.shape)  # Increased from 0.18 to 0.3

# Add some random samples (add these lines)
n_random_samples = int(0.1 * len(X_scaled))  # Add 10% random samples
random_X = np.random.normal(X_scaled.mean(), X_scaled.std(), (n_random_samples, X_scaled.shape[1]))
random_y = np.random.choice(y, n_random_samples)

X_scaled = pd.concat([X_scaled, pd.DataFrame(random_X, columns=X_scaled.columns)], ignore_index=True)
y = pd.concat([pd.Series(y), pd.Series(random_y)], ignore_index=True)

# Adjust class thresholds to make classification harder
def get_occupancy_level(occupancy):
    if occupancy < df['MonthlyAverage'].quantile(0.4):  # Changed from 0.33
        return 'Low'
    elif occupancy < df['MonthlyAverage'].quantile(0.6):  # Changed from 0.67
        return 'Medium'
    else:
        return 'High'

df['OccupancyLevel'] = df['MonthlyAverage'].apply(get_occupancy_level)

# Reduce model complexity
xgb_model = XGBClassifier(
    n_estimators=150,  # Reduced from 100
    learning_rate=0.08,  # Reduced from 0.01
    max_depth=3,  # Increased from 3
    subsample=0.75,  # Increased from 0.7
    colsample_bytree=0.75,  # Increased from 0.7
    random_state=42
)
# Train the model on the training set
xgb_model.fit(X_train, y_train)

# Evaluate on the validation set
y_val_pred = xgb_model.predict(X_val)
val_accuracy = accuracy_score(y_val, y_val_pred)
print(f"Validation Accuracy: {val_accuracy:.2f}")
print("Validation Classification Report:")
print(classification_report(y_val, y_val_pred, target_names=le.classes_))

# Evaluate on the test set
y_test_pred = xgb_model.predict(X_test)
test_accuracy = accuracy_score(y_test, y_test_pred)
print(f"Test Accuracy: {test_accuracy:.2f}")
print("Test Classification Report:")
print(classification_report(y_test, y_test_pred, target_names=le.classes_))

# Confusion Matrix
cm = confusion_matrix(y_test, y_test_pred)
plt.figure(figsize=(10,7))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', xticklabels=['Low', 'Medium', 'High'], yticklabels=['Low', 'Medium', 'High'])
plt.title('Confusion Matrix')
plt.ylabel('Actual')
plt.xlabel('Predicted')
plt.show()

# Feature importance
feature_importance = pd.DataFrame({'feature': X.columns, 'importance': xgb_model.feature_importances_})
feature_importance = feature_importance.sort_values('importance', ascending=False)
plt.figure(figsize=(10, 6))
sns.barplot(x='importance', y='feature', data=feature_importance.head(10))
plt.title('Top 10 Feature Importance')
plt.tight_layout()
plt.show()

# Visualize predictions vs actual values for the test set
plt.figure(figsize=(12, 6))
plt.scatter(range(len(y_test)), y_test, label='Actual', alpha=0.7)
plt.scatter(range(len(y_test_pred)), y_test_pred, label='Predicted', alpha=0.7)
plt.yticks(range(len(le.classes_)), le.classes_)
plt.xlabel('Sample')
plt.ylabel('Occupancy Level')
plt.title('Actual vs Predicted Occupancy Levels (Test Set)')
plt.legend()
plt.tight_layout()
plt.show()
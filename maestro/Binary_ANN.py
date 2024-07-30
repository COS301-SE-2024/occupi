import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense

# Step 1: Read Data from CSV
df = pd.read_csv('datasets/Attendance_Prediction.csv')

# Display the first few rows of the dataframe
print(df.head())

# Step 2: Visualize the Most Preferred Days
# Aggregate the data by Day_of_Week
visit_counts = df.groupby('Day_of_Week')['WillVisit'].sum().reset_index()

# Sort the days of the week for better visualization
days_order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
visit_counts['Day_of_Week'] = pd.Categorical(visit_counts['Day_of_Week'], categories=days_order, ordered=True)
visit_counts = visit_counts.sort_values('Day_of_Week')

# Plotting the bar chart
plt.figure(figsize=(10, 6))
plt.bar(visit_counts['Day_of_Week'], visit_counts['WillVisit'], color='skyblue')
plt.xlabel('Day of the Week')
plt.ylabel('Number of Visits')
plt.title('Number of Visits per Day of the Week')
plt.xticks(rotation=45)
plt.grid(axis='y', linestyle='--', alpha=0.7)
plt.show()

# Step 3: Preprocess Data for ANN
# Encode categorical features
label_encoders = {}
categorical_features = ['Day_of_Week']

for feature in categorical_features:
    label_encoders[feature] = LabelEncoder()
    df[feature] = label_encoders[feature].fit_transform(df[feature])

# Convert boolean features to integers
df['IsPreferredDay'] = df['IsPreferredDay'].astype(int)
df['IsEventDay'] = df['IsEventDay'].astype(int)
df['RemoteEmployee'] = df['RemoteEmployee'].astype(int)

# Define features (X) and target (y)
X = df.drop(columns=['WillVisit', 'Date'])
y = df['WillVisit']

# Scale the features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# Step 4: Train the ANN
# Build the ANN model
model = Sequential()
model.add(Dense(16, input_dim=X_train.shape[1], activation='relu'))
model.add(Dense(8, activation='relu'))
model.add(Dense(1, activation='sigmoid'))

# Compile the model
model.compile(loss='binary_crossentropy', optimizer='adam', metrics=['accuracy'])

# Train the model
model.fit(X_train, y_train, epochs=50, batch_size=10, verbose=2)

# Evaluate the model
loss, accuracy = model.evaluate(X_test, y_test)
print(f'Test Accuracy: {accuracy:.2f}')

model.export('C:/Users/retha/Capstone/occupi/models/person_prediction_model/1')

# Step 5: Predict on New Data
# Example new data
new_data = {
    'Day_of_Week': ['Tuesday', 'Tuesday'],
    'booked': [1, 0],
    'IsPreferredDay': [True, True],
    'IsEventDay': [False, False],
    'RemoteEmployee': [False, True]
}

new_df = pd.DataFrame(new_data)

# Encode the new data
for feature in categorical_features:
    new_df[feature] = label_encoders[feature].transform(new_df[feature])

# Convert boolean features to integers
new_df['IsPreferredDay'] = new_df['IsPreferredDay'].astype(int)
new_df['IsEventDay'] = new_df['IsEventDay'].astype(int)
new_df['RemoteEmployee'] = new_df['RemoteEmployee'].astype(int)

# Scale the new data
new_X_scaled = scaler.transform(new_df)

# Predict using the trained model
predictions = model.predict(new_X_scaled)
predictions = (predictions > 0.5).astype(int)

new_df['WillVisit'] = predictions
print(new_df)

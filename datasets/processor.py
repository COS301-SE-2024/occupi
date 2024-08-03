import pandas as pd

# Define the levels based on capacity
def get_level(capacity):
    if capacity >= 1600:
        return 7
    elif capacity >= 1400:
        return 6
    elif capacity >= 1200:
        return 5
    elif capacity >= 1000:
        return 4
    elif capacity >= 800:
        return 3
    elif capacity >= 600:
        return 2
    else:
        return 1

# Read the CSV data into a DataFrame
file_path = 'datasets/Attendance_data(1).csv'
data = pd.read_csv(file_path)

df = pd.DataFrame(data)

# Apply the get_level function to create the Level column
df['Level'] = df['Number_Attended'].apply(get_level)

# Save the modified DataFrame back to a CSV file
df.to_csv('output.csv', index=False)

print(df)

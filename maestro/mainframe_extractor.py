import pandas as pd
from datetime import datetime
from workalendar.africa import SouthAfrica

# Initialize the South African calendar
sa_calendar = SouthAfrica()

# Read the Gym_Crowd dataset
gym_crowd = pd.read_csv('../datasets/Gym_Crowd.csv')

# Convert 'date' and 'timestamp' to datetime
gym_crowd['datetime'] = pd.to_datetime(gym_crowd['date'] + ' ' + gym_crowd['timestamp'])

# Function to get South African season
def get_sa_season(month):
    if month in [12, 1, 2]:
        return 'Summer'
    elif month in [3, 4, 5]:
        return 'Autumn'
    elif month in [6, 7, 8]:
        return 'Winter'
    else:
        return 'Spring'

# Function to check if a date is a South African public holiday
def is_sa_holiday(date):
    return sa_calendar.is_holiday(date)

# Add season and holiday columns
gym_crowd['Season'] = gym_crowd['datetime'].dt.month.map(get_sa_season)
gym_crowd['Is_SA_Holiday'] = gym_crowd['datetime'].dt.date.map(is_sa_holiday)

# Extract Attendance_data
attendance_data = gym_crowd[['datetime', 'day_of_week', 'month', 'is_weekend', 'number_people', 'Is_SA_Holiday']].copy()
attendance_data['Date'] = attendance_data['datetime'].dt.date
attendance_data['Day_of_Week'] = attendance_data['day_of_week']
attendance_data['Month'] = attendance_data['month']
attendance_data['Week_of_the_year'] = attendance_data['datetime'].dt.isocalendar().week
attendance_data['Day_of_month'] = attendance_data['datetime'].dt.day
attendance_data['Is_Weekend'] = attendance_data['is_weekend']
attendance_data['Special_Event'] = attendance_data['Is_SA_Holiday']  # Considering SA holidays as special events
attendance_data['Number_Attended'] = attendance_data['number_people']
attendance_data = attendance_data[['Date', 'Day_of_Week', 'Month', 'Week_of_the_year', 'Day_of_month', 'Is_Weekend', 'Special_Event', 'Number_Attended']]
attendance_data.to_csv('Attendance_data_new.csv', index=False)

# Extract Attendance_Prediction
attendance_prediction = gym_crowd[['datetime', 'day_of_week', 'is_weekend', 'Is_SA_Holiday']].copy()
attendance_prediction['Date'] = attendance_prediction['datetime'].dt.date
attendance_prediction['Day_of_Week'] = attendance_prediction['day_of_week']
attendance_prediction['booked'] = 'Unknown'  # You may need to define this based on your data
attendance_prediction['IsPreferredDay'] = 'Unknown'  # You may need to define this based on your data
attendance_prediction['IsEventDay'] = attendance_prediction['Is_SA_Holiday']  # Considering SA holidays as events
attendance_prediction['RemoteEmployee'] = 'Unknown'  # You may need to define this based on your data
attendance_prediction['WillVisit'] = 'Unknown'  # You may need to define this based on your data
attendance_prediction = attendance_prediction[['Date', 'Day_of_Week', 'booked', 'IsPreferredDay', 'IsEventDay', 'RemoteEmployee', 'WillVisit']]
attendance_prediction.to_csv('Attendance_Prediction_new.csv', index=False)

# Extract Attendance_records (same as Attendance_data)
attendance_records = attendance_data.copy()
attendance_records.to_csv('Attendance_records_new.csv', index=False)

# Extract Monthly_OfficeCapacity
monthly_office_capacity = gym_crowd.groupby(['month', 'Is_SA_Holiday', 'Season']).agg({
    'number_people': 'max',
    'datetime': lambda x: x.iloc[0]
}).reset_index()

monthly_office_capacity['id'] = monthly_office_capacity.index + 1
monthly_office_capacity['Month'] = monthly_office_capacity['month']
monthly_office_capacity['Year'] = monthly_office_capacity['datetime'].dt.year
monthly_office_capacity['Quarter'] = monthly_office_capacity['datetime'].dt.quarter
monthly_office_capacity['Is_Holiday'] = monthly_office_capacity['Is_SA_Holiday']
monthly_office_capacity['Occupancy'] = monthly_office_capacity['number_people']
monthly_office_capacity = monthly_office_capacity[['id', 'Month', 'Year', 'Season', 'Quarter', 'Is_Holiday', 'Occupancy']]
monthly_office_capacity.to_csv('Monthly_OfficeCapacity_new.csv', index=False)

print("All new CSV files have been created successfully with Southern African seasons and South African holidays.")
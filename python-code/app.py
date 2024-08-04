from flask import Flask, request, jsonify
import logging
from datetime import datetime, timedelta
from prediction import get_prediction
import joblib

# Initialize the Flask application
app = Flask(__name__)

# Load the scaler
scaler = joblib.load('attendance_scaler.pkl')

# Function to determine if a given date is a weekend
def is_weekend(date):
    return date.weekday() >= 5

# Function to determine if a given date is a special event (placeholder logic)
def is_special_event(date):
    special_events_dates = [(7, 4), (12, 25), (4, 23), (12, 9), (8, 5), (3, 6), (11, 27), (3, 10), (7, 26)]  # Example: 4th of July, Christmas
    return 1 if (date.month, date.day) in special_events_dates else 0

@app.route('/', methods=['GET'])
def ping():
    return jsonify({'response': 'Prediction API is up and running'})

@app.route('/predict', methods=['GET'])
def predict():
    try:
        # Get current date
        current_date = datetime.now()
        
        # Extract day of the week, month, and day of the month
        day_of_week = current_date.weekday()  # Monday is 0 and Sunday is 6
        month = current_date.month
        day_of_month = current_date.day
        weekend = is_weekend(current_date)
        special_event = is_special_event(current_date)
        # Set factor based on special event
        # factor = 1.5 if special_event else 1.0

        predicted_class, predicted_attendance_level = get_prediction(day_of_week, month, day_of_month, weekend, special_event, scaler)
        
        return jsonify({
            'Day_of_Week': day_of_week,
            'Month': month,
            'Day_of_month': day_of_month,
            'Is_Weekend': weekend,
            'Special_Event': special_event,
            'Predicted_Class': predicted_class,
            'Predicted_Attendance_Level': predicted_attendance_level
        })
    except Exception as e:
        logging.error(f"Error in predict endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/predict_week', methods=['GET'])
def predict_week():
    try:
        # Get the current date
        current_date = datetime.now()
        
        # Find the upcoming Monday
        start_date = current_date + timedelta(days=(0 - current_date.weekday()))
        
        predictions = []
        for i in range(7):
            # Calculate the date for each day of the week
            date = start_date + timedelta(days=i)
            
            # Extract day of the week, month, and day of the month
            day_of_week = date.weekday()
            month = date.month
            day_of_month = date.day
            weekend = is_weekend(date)
            special_event = is_special_event(date)
            
            # Set factor based on special event
            # factor = 1.5 if special_event else 1.0
            
            # Get prediction
            predicted_class, predicted_attendance_level = get_prediction(day_of_week, month, day_of_month, weekend, special_event, scaler)
            
            # Append the results
            predictions.append({
                'Date': date.strftime('%Y-%m-%d'),
                'Day_of_Week': day_of_week,
                'Month': month,
                'Day_of_month': day_of_month,
                'Is_Weekend': weekend,
                'Special_Event': special_event,
                'Predicted_Class': predicted_class,
                'Predicted_Attendance_Level': predicted_attendance_level
            })
        
        return jsonify(predictions)
    except Exception as e:
        logging.error(f"Error in predict_week endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=9000)

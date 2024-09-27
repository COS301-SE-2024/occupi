from flask import Flask, request, jsonify
import logging
from flask_cors import CORS
from datetime import datetime, timedelta
from prediction import get_prediction, get_hourly_predictions
import joblib
import numpy as np

# Initialize the Flask application
app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": ["https://dev.occupi.tech, https://occupi.tech, https://localhost"]}})

# Load the scaler
scaler = joblib.load('attendance_scaler.pkl')
hourly_scaler = joblib.load('hourly_scaler.pkl')

# Define the attendance levels for each day of the week
attendance_levels_by_day = {
    'Monday': ["0-50", "50-100", "100-150", "150-200", "200-250", "250-300", "300+"],
    'Tuesday': ["0-300", "300-600", "600-900", "900-1200", "1200-1500", "1500-1800", "1800+"],
    'Wednesday': ["0-50", "50-100", "100-150", "150-200", "200-250", "250-300", "300+"],
    'Thursday': ["0-300", "300-600", "600-900", "900-1200", "1200-1500", "1500-1800", "1800+"],
    'Friday': ["0-50", "50-100", "100-150", "150-200", "200-250", "250-300", "300+"],
    'Saturday': ["0-25", "25-50", "50-75", "75-100", "100-125", "125-150", "150+"],
    'Sunday': ["0-10", "10-20", "20-30", "30-40", "40-50", "50-60", "60+"]
}

# Function to determine if a given date is a weekend
def is_weekend(date):
    return date.weekday() >= 5

# Function to determine if a given date is a special event (placeholder logic)
def is_special_event(date):
    special_events_dates = [(7, 4), (12, 25), (4, 23), (12, 9), (8, 5), (3, 6), (11, 27), (3, 10), (7, 26)]  # Example: 4th of July, Christmas
    return 1 if (date.month, date.day) in special_events_dates else 0

@app.route('/', methods=['GET'])
def ping():
    try:
        return jsonify({'response': 'Prediction API is up and running'}), 200
    except Exception as e:
        logging.error(f"Error in ping endpoint: {str(e)}")
        return jsonify({"error": "Models unavailable"}), 500

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
        return jsonify({"error": "An error occured"}), 500

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
        return jsonify({"error": "An error occured"}), 500

@app.route('/predict_date', methods=['GET'])
def predict_date():
    try:
        # Get the date from query parameters
        date_str = request.args.get('date')
        if not date_str:
            return jsonify({"error": "Date parameter is required"}), 400

        # Parse the date
        date = datetime.strptime(date_str, '%Y-%m-%d')
        
        # Extract day of the week, month, and day of the month
        day_of_week = date.weekday()
        month = date.month
        day_of_month = date.day
        weekend = is_weekend(date)
        special_event = is_special_event(date)
        
        # Get prediction
        predicted_class, predicted_attendance_level = get_prediction(day_of_week, month, day_of_month, weekend, special_event, scaler)
        
        return jsonify({
            'Date': date_str,
            'Day_of_Week': day_of_week,
            'Month': month,
            'Day_of_month': day_of_month,
            'Is_Weekend': weekend,
            'Special_Event': special_event,
            'Predicted_Class': predicted_class,
            'Predicted_Attendance_Level': predicted_attendance_level
        })
    except Exception as e:
        logging.error(f"Error in predict_date endpoint: {str(e)}")
        return jsonify({"error":"An error occured"}), 500
    
@app.route('/predict_week_from_date', methods=['GET'])
def predict_week_from_date():
    try:
        # Get the date from query parameters
        date_str = request.args.get('date')
        if not date_str:
            return jsonify({"error": "Date parameter is required"}), 400

        # Parse the date
        start_date = datetime.strptime(date_str, '%Y-%m-%d')
        
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
        logging.error(f"Error in predict_week_from_date endpoint: {str(e)}")
        return jsonify({"error":"An error occured"}), 500
    
@app.route('/predict_hourly', methods=['GET'])
def predict_hourly():
    try:
        # Get the date and hour from query parameters
        date_str = request.args.get('date')
        hour = request.args.get('hour', type=int)

        # Check if both date and hour are provided
        if not date_str or hour is None:
            return jsonify({"error": "Both 'date' and 'hour' parameters are required"}), 400

        # Parse the date
        date = datetime.strptime(date_str, '%Y-%m-%d')
        
        # Extract day of the week, month, and day of the month
        day_of_week = date.weekday()  # Monday is 0 and Sunday is 6
        month = date.month
        day_of_month = date.day
        weekend = is_weekend(date)
        special_event = is_special_event(date)
        day_name = date.strftime('%A')  # Get day name for hourly interpretation
        # Get hourly prediction from TensorFlow Serving
        predicted_class, predicted_attendance_level = get_hourly_predictions(
            day_of_week, hour, hourly_scaler, day_name  # Pass the day, hour, scaler, and day_name to your function
        )
        print(predicted_class)
        print(predicted_attendance_level)
        if predicted_class is None or predicted_attendance_level is None:
            return jsonify({"error": "Failed to get predictions from the model"}), 500
        

        # Return the prediction as a JSON response
        return jsonify({
            'Date': date_str,
            'Hour': hour,
            'Day_of_Week': int(day_of_week),  # Convert to int
            'Month': int(month),  # Convert to int
            'Day_of_month': int(day_of_month),  # Convert to int
            'Is_Weekend': bool(weekend),  # Ensure boolean is handled correctly
            'Special_Event': bool(special_event),  # Ensure boolean is handled correctly
            'Predicted_Class': int(predicted_class),  # Convert to int
            'Predicted_Attendance_Level': predicted_attendance_level
        })
    except Exception as e:
        logging.error(f"Error in predict_hourly endpoint: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500


@app.route('/predict_day', methods=['GET'])
def predict_range():
    try:
        # Set defaults for date, start_hour, and end_hour
        today = datetime.today().strftime('%Y-%m-%d')  # Default to today's date
        default_start_hour = 6  # Default start time
        default_end_hour = 17  # Default end time

        # Get the date, start_hour, and end_hour from query parameters (use defaults if not provided)
        date_str = request.args.get('date', default=today)  # Default to today's date
        start_hour = request.args.get('start_hour', default=default_start_hour, type=int)  # Default start hour
        end_hour = request.args.get('end_hour', default=default_end_hour, type=int)  # Default end hour

        # Validate the hours (must be between 0 and 23)
        if not (0 <= start_hour <= 23) or not (0 <= end_hour <= 23):
            return jsonify({"error": "'start_hour' and 'end_hour' must be between 0 and 23"}), 400

        # Ensure start_hour is less than or equal to end_hour
        if start_hour > end_hour:
            return jsonify({"error": "'start_hour' cannot be greater than 'end_hour'"}), 400

        # Parse the date
        date = datetime.strptime(date_str, '%Y-%m-%d')

        # Extract day of the week, month, and day of the month
        day_of_week = date.weekday()  # Monday is 0 and Sunday is 6
        month = date.month
        day_of_month = date.day
        weekend = is_weekend(date)
        special_event = is_special_event(date)
        day_name = date.strftime('%A')  # Get day name for hourly interpretation

        # Store predictions for each hour in the specified range
        hourly_predictions = []

        # Loop through the hours and get predictions for each hour
        for hour in range(start_hour, end_hour + 1):
            predicted_class, predicted_attendance_level = get_hourly_predictions(
                day_of_week, hour, hourly_scaler, day_name  # Pass the day, hour, scaler, and day_name to your function
            )

            if predicted_class is None or predicted_attendance_level is None:
                return jsonify({"error": f"Failed to get predictions for hour {hour}"}), 500

            # Add the prediction for this hour to the list
            hourly_predictions.append({
                'Hour': hour,
                'Predicted_Class': int(predicted_class),  # Convert to int
                'Predicted_Attendance_Level': predicted_attendance_level
            })

        # Return the predictions for the specified range as a JSON response
        return jsonify({
            'Date': date_str,
            'Day_of_Week': int(day_of_week),  # Convert to int
            'Month': int(month),  # Convert to int
            'Day_of_month': int(day_of_month),  # Convert to int
            'Is_Weekend': bool(weekend),  # Ensure boolean is handled correctly
            'Special_Event': bool(special_event),  # Ensure boolean is handled correctly
            'Hourly_Predictions': hourly_predictions  # Include all hourly predictions
        })

    except Exception as e:
        logging.error(f"Error in predict_range endpoint: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
    
@app.route('/recommend', methods=['GET'])
def recommend():
    try:
        # Get the current date
        current_date = datetime.now()
        
        # Initialize the list to hold predictions
        predictions = []
        
        # Loop through the next 7 days including today
        for i in range(7):
            # Calculate the date for each day
            date = current_date + timedelta(days=i)
            
            # Extract day of the week, month, and day of the month
            day_of_week = date.weekday()
            month = date.month
            day_of_month = date.day
            weekend = is_weekend(date)
            special_event = is_special_event(date)
            
            # Get prediction
            predicted_class, predicted_attendance_level = get_prediction(day_of_week, month, day_of_month, weekend, special_event, scaler)
            
            # Append the results only if it's not a weekend
            if not weekend:
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
        
        # Check if there are any non-weekend days to recommend
        if not predictions:
            return jsonify({
                'Recommendation': 'No suitable weekdays available for recommendation.',
                'Message': 'All days within the next week are weekends.'
            }), 200

        # Find the minimum predicted class value
        min_predicted_class = min(predictions, key=lambda x: x['Predicted_Class'])['Predicted_Class']
        
        # Filter the days with the minimum predicted class value
        recommended_days = [prediction for prediction in predictions if prediction['Predicted_Class'] == min_predicted_class]
        
        # Sort the recommendations by date for better readability
        recommended_days = sorted(recommended_days, key=lambda x: x['Date'])
        
        return jsonify({
            'Recommendation': 'Best day(s) to go to the office based on predicted attendance levels for the next seven days, excluding weekends.',
            'Recommended_Days': recommended_days
        })
    except Exception as e:
        logging.error(f"Error in recommend endpoint: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500
    
@app.route('/recommend_office_times', methods=['GET'])
def recommend_office_times():
    try:
        # Get the date from the query parameter, if provided, otherwise default to today's date
        date_str = request.args.get('date')
        if date_str:
            # Parse the date from the query parameter
            selected_date = datetime.strptime(date_str, '%Y-%m-%d')
        else:
            # Default to today's date
            selected_date = datetime.today()
        
        # Extract day of the week and day name for hourly interpretation
        day_of_week = selected_date.weekday()  # Monday is 0 and Sunday is 6
        day_name = selected_date.strftime('%A')  # Get day name for hourly interpretation

        # Get the start and end hour from query parameters, or default to 06h00 - 18h00
        start_hour = request.args.get('start_hour', default=6, type=int)
        end_hour = request.args.get('end_hour', default=18, type=int)

        # Validate the start_hour and end_hour (must be between 0 and 23)
        if not (0 <= start_hour <= 23) or not (0 <= end_hour <= 23):
            return jsonify({"error": "'start_hour' and 'end_hour' must be between 0 and 23"}), 400

        # Ensure start_hour is less than or equal to end_hour
        if start_hour > end_hour:
            return jsonify({"error": "'start_hour' cannot be greater than 'end_hour'"}), 400

        # Store predictions for each hour in the selected time range
        hourly_predictions = []

        # Loop through the hours and get predictions for each hour
        for hour in range(start_hour, end_hour + 1):  # Includes end_hour
            predicted_class, predicted_attendance_level = get_hourly_predictions(
                day_of_week, hour, hourly_scaler, day_name  # Pass the day, hour, scaler, and day_name to your function
            )

            if predicted_class is None or predicted_attendance_level is None:
                return jsonify({"error": f"Failed to get predictions for hour {hour}"}), 500

            # Add the prediction for this hour to the list
            hourly_predictions.append({
                'Hour': hour,
                'Predicted_Class': int(predicted_class),  # Convert to int
                'Predicted_Attendance_Level': predicted_attendance_level
            })

        # Filter out the best times to go to the office based on low/moderate occupancy
        best_times = get_best_times_to_go(hourly_predictions)

        # Return the recommendations for the best times as a JSON response
        return jsonify({
            'Date': selected_date.strftime('%Y-%m-%d'),
            'Day_of_Week': int(day_of_week),  # Convert to int
            'Best_Times': best_times  # Include the best times to go to the office
        })

    except Exception as e:
        logging.error(f"Error in recommend_office_times endpoint: {str(e)}")
        return jsonify({"error": "An error occurred"}), 500

    
def get_best_times_to_go(hourly_predictions):
    """
    Filters the best times to go to the office based on the predicted attendance levels.

    Parameters:
    hourly_predictions: List of hourly predictions containing predicted_class and predicted_attendance_level.

    Returns:
    A list of recommended hours (best times) to go to the office.
    """
    best_times = []

    for prediction in hourly_predictions:
        predicted_class = prediction['Predicted_Class']

        # Define criteria for best times (low or moderate occupancy levels)
        if predicted_class in [0, 1, 2, 3]:  # Low to moderate occupancy
            best_times.append({
                'Hour': prediction['Hour'],
                'Predicted_Class': prediction['Predicted_Class'],
                'Predicted_Attendance_Level': prediction['Predicted_Attendance_Level'],
                'Recommendation': 'Best time to go'
            })

    return best_times

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=9000)

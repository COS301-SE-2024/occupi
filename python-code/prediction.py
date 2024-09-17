import numpy as np
import requests
import json
from sklearn.preprocessing import StandardScaler
import logging

# Define the URL for the TensorFlow Serving API for both daily and hourly models
daily_model_url = 'http://model:8501/v1/models/attendance_model:predict'
hourly_model_url = 'http://model:8502/v1/models/hourly_attendance_model:predict'  # Adjust the URL as needed

# Define the attendance levels based on the bin ranges
attendance_levels = ["0-300", "300-600", "600-900", "900-1200", "1200-1500", "1500-1800", "1800+"]

# Define the attendance levels for each day
attendance_levels_by_day = {
    "Monday": ["0-50", "50-100", "100-150", "150-200", "200-250", "250-300", "300+"],
    "Tuesday": ["0-300", "300-600", "600-900", "900-1200", "1200-1500", "1500-1800", "1800+"],
    "Wednesday": ["0-50", "50-100", "100-150", "150-200", "200-250", "250-300", "300+"],
    "Thursday": ["0-300", "300-600", "600-900", "900-1200", "1200-1500", "1500-1800", "1800+"],
    "Friday": ["0-50", "50-100", "100-150", "150-200", "200-250", "250-300", "300+"],
    "Saturday": ["0-25", "25-50", "50-75", "75-100", "100-125", "125-150", "150+"],
    "Sunday": ["0-10", "10-20", "20-30", "30-40", "40-50", "50-60", "60+"]
}

# Function to interpret the predictions
def interpret_predictions(predictions):
    # Get the predicted class index (the one with the highest probability)
    predicted_class = int(np.argmax(predictions[0]))  # Convert to native Python int
    
    # Map the predicted class index to the attendance level
    predicted_attendance_level = attendance_levels[predicted_class]
    
    return predicted_class, predicted_attendance_level

# Function to interpret hourly predictions based on the day of the week
def hourly_interpret_predictions(predictions, day_name):
    # Get the predicted class index (the one with the highest probability)
    predicted_class = int(np.argmax(predictions[0]))  # Convert to native Python int

    # Map the predicted class index to the attendance level for the specific day
    attendance_levels = attendance_levels_by_day.get(day_name, attendance_levels_by_day["Monday"])  # Default to Monday if day not found
    predicted_attendance_level = attendance_levels[predicted_class]
    
    return predicted_class, predicted_attendance_level

# Function to send a daily prediction request
def get_prediction(day_of_week, month, day_of_month, is_weekend, special_event, scaler, factor=1.0):
    try:
        # Create sample input data based on your model's input shape
        sample_input = np.array([[day_of_week, month, day_of_month, is_weekend, special_event]])  # Example input
        
        # Normalize the input data using the same scaler used during training
        sample_input = scaler.transform(sample_input)
        
        # Reshape the input data to match the model's expected input shape
        sample_input = sample_input.reshape((1, sample_input.shape[1], 1))
        
        # Convert the numpy array to a JSON-serializable list
        input_data = sample_input.tolist()
        
        # Prepare the data payload for the request
        data = json.dumps({
            "signature_name": "serving_default",  # Use the default signature
            "instances": input_data
        })
        
        # Send the POST request to the TensorFlow Serving API
        headers = {"content-type": "application/json"}
        response = requests.post(daily_model_url, data=data, headers=headers)
        
        # Check if the response status code is not 200
        if response.status_code != 200:
            raise ValueError(f"Received response code {response.status_code}: {response.text}")
        
        # Parse the JSON response
        predictions = json.loads(response.text)['predictions']
        
        # Interpret the predictions
        predicted_class, predicted_attendance_level = interpret_predictions(predictions)

        # Apply factor if it's a special event
        if special_event:
            factor_index = min(int(predicted_class * factor), len(attendance_levels) - 1)
            predicted_attendance_level = attendance_levels[factor_index]
        
        return predicted_class, predicted_attendance_level
    except Exception as e:
        logging.error(f"Error in get_prediction: {str(e)}")
        raise e

# Function to send an hourly prediction request
def get_hourly_prediction(day_of_week, month, day_of_month, is_weekend, special_event, hour, scaler, day_name, factor=1.0):
    try:
        # Create sample input data including the hour of the day
        sample_input = np.array([[day_of_week, month, day_of_month, is_weekend, special_event, hour]])  # Example input
        
        # Normalize the input data using the hourly scaler
        sample_input = scaler.transform(sample_input)
        
        # Reshape the input data to match the model's expected input shape
        sample_input = sample_input.reshape((1, sample_input.shape[1], 1))
        
        # Convert the numpy array to a JSON-serializable list
        input_data = sample_input.tolist()
        
        # Prepare the data payload for the request
        data = json.dumps({
            "signature_name": "serving_default",  # Use the default signature
            "instances": input_data
        })
        
        # Send the POST request to the TensorFlow Serving API for hourly predictions
        headers = {"content-type": "application/json"}
        response = requests.post(hourly_model_url, data=data, headers=headers)
        
        # Check if the response status code is not 200
        if response.status_code != 200:
            raise ValueError(f"Received response code {response.status_code}: {response.text}")
        
        # Parse the JSON response
        predictions = json.loads(response.text)['predictions']
        
        # Interpret the predictions based on the day of the week
        predicted_class, predicted_attendance_level = hourly_interpret_predictions(predictions, day_name)

        # Apply factor if it's a special event
        if special_event:
            factor_index = min(int(predicted_class * factor), len(attendance_levels_by_day[day_name]) - 1)
            predicted_attendance_level = attendance_levels_by_day[day_name][factor_index]
        
        return predicted_class, predicted_attendance_level
    except Exception as e:
        logging.error(f"Error in get_hourly_prediction: {str(e)}")
        raise e

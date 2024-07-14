import numpy as np
import requests
import json

# Define the URL for the TensorFlow Serving API
url = 'http://localhost:8501/v1/models/attendance_model:predict'

# Define the attendance levels based on the bin ranges
attendance_levels = ["0-300", "300-600", "600-900", "900-1200", "1200-1500", "1500-1800", "1800+"]

# Function to interpret the predictions
def interpret_predictions(predictions):
    # Get the predicted class index (the one with the highest probability)
    predicted_class = np.argmax(predictions[0])
    
    # Map the predicted class index to the attendance level
    predicted_attendance_level = attendance_levels[predicted_class]
    
    return predicted_class, predicted_attendance_level

# Function to send a prediction request
def get_prediction(day_of_week, month, day_of_month, is_weekend, special_event):
    # Create sample input data based on your model's input shape
    sample_input = np.array([[day_of_week, month, day_of_month, is_weekend, special_event]])  # Example input
    
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
    response = requests.post(url, data=data, headers=headers)
    
    # Parse the JSON response
    predictions = json.loads(response.text)['predictions']
    
    # Interpret the predictions
    predicted_class, predicted_attendance_level = interpret_predictions(predictions)
    
    return predicted_class, predicted_attendance_level

# Define the days of the week and other fixed parameters
days_of_week = list(range(7))  # 0=Monday, 1=Tuesday, ..., 6=Sunday
month = 3  # March
special_event = 1  # Example special event flag

# Loop over each day of the week and get predictions
for day_of_week in days_of_week:
    day_of_month = 15 + day_of_week  # Example day_of_month for testing
    is_weekend = 1 if day_of_week in [5, 6] else 0  # 1 if Saturday or Sunday, otherwise 0
    predicted_class, predicted_attendance_level = get_prediction(day_of_week, month, day_of_month, is_weekend, special_event)
    print(f"Day of Week: {day_of_week}, Day of Month: {day_of_month}, Predicted Class: {predicted_class}, Predicted Attendance Level: {predicted_attendance_level}")

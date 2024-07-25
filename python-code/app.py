from flask import Flask, request, jsonify
import numpy as np
import requests
import json
from sklearn.preprocessing import StandardScaler
import logging

# Define the URL for the TensorFlow Serving API
url = 'http://localhost:8501/v1/models/attendance_model:predict'

# Define the attendance levels based on the bin ranges
attendance_levels = ["0-300", "300-600", "600-900", "900-1200", "1200-1500", "1500-1800", "1800+"]

# Function to interpret the predictions
def interpret_predictions(predictions):
    # Get the predicted class index (the one with the highest probability)
    predicted_class = int(np.argmax(predictions[0]))  # Convert to native Python int
    
    # Map the predicted class index to the attendance level
    predicted_attendance_level = attendance_levels[predicted_class]
    
    return predicted_class, predicted_attendance_level

# Function to send a prediction request
def get_prediction(day_of_week, month, day_of_month, is_weekend, special_event, scaler):
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
        response = requests.post(url, data=data, headers=headers)
        
        # Check if the response status code is not 200
        if response.status_code != 200:
            raise ValueError(f"Received response code {response.status_code}: {response.text}")
        
        # Parse the JSON response
        predictions = json.loads(response.text)['predictions']
        
        # Interpret the predictions
        predicted_class, predicted_attendance_level = interpret_predictions(predictions)
        
        return predicted_class, predicted_attendance_level
    except Exception as e:
        logging.error(f"Error in get_prediction: {str(e)}")
        raise e

# Initialize the Flask application
app = Flask(__name__)

# Initialize the scaler (use the same scaler used during training)
# Assume you have access to the original training data for initializing the scaler
X_train = np.array([[0, 3, 15, 0, 1], [1, 3, 16, 0, 1], [2, 3, 17, 0, 1], [3, 3, 18, 0, 1], [4, 3, 19, 0, 1], [5, 3, 20, 1, 1], [6, 3, 21, 1, 1]])
scaler = StandardScaler().fit(X_train)

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json(force=True)
        day_of_week = int(data['Day_of_Week'])
        month = int(data['Month'])
        day_of_month = int(data['Day_of_month'])
        is_weekend = int(data['Is_Weekend'])
        special_event = int(data['Special_Event'])

        predicted_class, predicted_attendance_level = get_prediction(day_of_week, month, day_of_month, is_weekend, special_event, scaler)
        
        return jsonify({
            'Day_of_Week': day_of_week,
            'Month': month,
            'Day_of_month': day_of_month,
            'Is_Weekend': is_weekend,
            'Special_Event': special_event,
            'Predicted_Class': predicted_class,
            'Predicted_Attendance_Level': predicted_attendance_level
        })
    except Exception as e:
        logging.error(f"Error in predict endpoint: {str(e)}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
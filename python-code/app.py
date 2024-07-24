from flask import Flask, request, jsonify
import numpy as np
import joblib
import requests

# Load the scaler
scaler = joblib.load('scaler.pkl')

# Initialize the Flask application
app = Flask(__name__)

@app.route('/predict', methods=['POST'])
def predict():
    # Get the data from the request
    data = request.get_json(force=True)
    
    # Convert data into a numpy array and reshape for the model
    input_features = np.array([[
        data['Day_of_Week'], data['Month'], data['Day_of_month'], 
        data['Is_Weekend'], data['Special_Event']
    ]])
    
    # Standardize the input features
    input_features = scaler.transform(input_features)
    
    # Reshape the input features to match the model's input shape
    input_features = input_features.reshape((input_features.shape[0], input_features.shape[1], 1))
    
    # Create the payload for TensorFlow Serving
    payload = {
        "instances": input_features.tolist()
    }
    
    # Make a POST request to TensorFlow Serving
    response = requests.post('http://localhost:8501/v1/models/attendance_model:predict', json=payload)
    
    # Parse the response
    predictions = response.json()['predictions']
    predicted_label = np.argmax(predictions, axis=1)[0]
    
    return jsonify({'prediction': int(predicted_label)})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')

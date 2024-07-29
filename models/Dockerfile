# Use the official TensorFlow Serving image as the base image
FROM tensorflow/serving:latest

# Set environment variables
ENV MODEL_NAME=attendance_model

# Create the model directory
RUN mkdir -p /models/${MODEL_NAME}

# Copy the model from your local directory to the Docker image
COPY attendance_model /models/${MODEL_NAME}

# Expose the TensorFlow Serving default port
EXPOSE 8501

# Set the entrypoint to start TensorFlow Serving with the model
ENTRYPOINT ["sh", "-c", "tensorflow_model_server --port=8501 --model_name=${MODEL_NAME} --model_base_path=/models/${MODEL_NAME}"]

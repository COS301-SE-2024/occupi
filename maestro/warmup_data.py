import tensorflow as tf
import numpy as np
import os

# Function to create representative input data
def create_warmup_data(input_shape):
    # Generate random data with the given input shape
    example_input = np.random.rand(*input_shape).astype(np.float32)
    return example_input

# Save the warmup data to a TFRecord file
def save_warmup_data(file_path, warmup_data):
    with tf.io.TFRecordWriter(file_path) as writer:
        feature = {
            'inputs': tf.train.Feature(float_list=tf.train.FloatList(value=warmup_data.flatten()))
        }
        example = tf.train.Example(features=tf.train.Features(feature=feature))
        writer.write(example.SerializeToString())

# Model's input shape (batch size is None, so replace it with 1)
input_shape = (1, 5, 1)  # Replace with your model's input shape without the batch size

# Generate warmup data
warmup_data = create_warmup_data(input_shape)

# Define the file path for the warmup file
warmup_file_path = 'C:/Users/retha/Capstone/occupi/models/attendance_model/1/assets.extra/tf_serving_warmup_requests'

# Create the necessary directory
os.makedirs(os.path.dirname(warmup_file_path), exist_ok=True)

# Save the warmup data
save_warmup_data(warmup_file_path, warmup_data)

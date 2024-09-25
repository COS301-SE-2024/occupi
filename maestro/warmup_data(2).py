# import tensorflow as tf
# import numpy as np
# import os
# from tensorflow_serving.apis import predict_pb2, prediction_log_pb2

# # Function to create representative input data
# def create_warmup_data(input_shape):
#     # Generate random data with the given input shape
#     example_input = np.random.rand(*input_shape).astype(np.float32)
#     return example_input

# # Save the warmup data as a TFRecord in a format compatible with TensorFlow Serving
# def save_warmup_data(file_path, warmup_data):
#     # Create the PredictRequest for TensorFlow Serving
#     warmup_request = predict_pb2.PredictRequest()
#     warmup_request.model_spec.name = 'hourly_model'  # Replace with your model name
#     warmup_request.model_spec.signature_name = 'serving_default'

#     # Fill in the input data - ensure that 'input_data' matches your model's input signature name
#     warmup_request.inputs['input_data'].CopyFrom(
#         tf.make_tensor_proto(warmup_data, dtype=tf.float32)
#     )

#     # Create a PredictionLog containing the request
#     warmup_log = prediction_log_pb2.PredictionLog(
#         predict_log=prediction_log_pb2.PredictLog(request=warmup_request)
#     )

#     # Write to the TFRecord file
#     with tf.io.TFRecordWriter(file_path) as writer:
#         writer.write(warmup_log.SerializeToString())

# # Model's input shape (batch size is None, so replace it with 1)
# input_shape = (1, 2, 1)  # Replace with your model's input shape without the batch size

# # Generate warmup data
# warmup_data = create_warmup_data(input_shape)

# # Define the file path for the warmup file
# warmup_file_path = 'C:/Users/retha/Capstone/occupi/models/hourly_predictions/1/assets.extra/tf_serving_warmup_requests'

# # Create the necessary directory if it doesn't exist
# os.makedirs(os.path.dirname(warmup_file_path), exist_ok=True)

# # Save the warmup data in TensorFlow Serving format
# save_warmup_data(warmup_file_path, warmup_data)

# print(f"Warm-up request saved to {warmup_file_path}")

import tensorflow as tf
print(tf.__version__)

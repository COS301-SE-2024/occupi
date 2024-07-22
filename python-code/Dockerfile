FROM tensorflow/serving

# Copy the models to the Docker image
COPY models/ /models/

# COPY the configuration file to the Docker image
COPY models.config /models.config

# Set the environment variable
ENV MODEL_CONFIG_FILE=/models.config

ENTRYPOINT ["/usr/bin/tensorflow_model_server", "--model_config_file=/models.config"]

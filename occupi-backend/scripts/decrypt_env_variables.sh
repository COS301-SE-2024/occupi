#!/bin/bash

# Define the files to be decrypted
files=("config.yaml.gpg" "dev.deployed.yaml.gpg" "dev.localhost.yaml.gpg" "prod.yaml.gpg" "test.yaml.gpg" "config.json.gpg")

# cd to configs directory
cd ../configs

# Prompt the user for the passphrase
read -sp "Enter the passphrase: " passphrase
echo

# Decrypt each file using the provided passphrase
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    gpg --batch --yes --passphrase "$passphrase" --decrypt --output "${file%.gpg}" --yes "$file"
    if [ $? -eq 0 ]; then
      echo "File $file has been successfully decrypted."
    else
      echo "Failed to decrypt $file."
      exit 1
    fi
  else
    echo "File $file does not exist."
    exit 1
  fi
done

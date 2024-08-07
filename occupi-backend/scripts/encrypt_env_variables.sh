#!/bin/bash

# Define the files to be encrypted
files=("config.yaml" "dev.deployed.yaml" "dev.localhost.yaml" "prod.yaml" "test.yaml" "config.json")

# cd to configs directory
cd ../configs

# Prompt the user for the passphrase
read -sp "Enter the passphrase: " passphrase
echo

# Encrypt each file using the provided passphrase
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    gpg --batch --yes --passphrase "$passphrase" --symmetric --cipher-algo AES256 --yes "$file"
    if [ $? -eq 0 ]; then
      echo "File $file has been successfully encrypted."
    else
      echo "Failed to encrypt $file."
      exit 1
    fi
  else
    echo "File $file does not exist."
    exit 1
  fi
done
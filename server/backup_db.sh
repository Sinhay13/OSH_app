#!/bin/bash

# Define the source and destination paths
SOURCE_PATH="/Users/oltar/Documents/CodeLocal /Perso/Oltar/OSH_app/server/oltar.db"
DEST_BASE_PATH="/Users/oltar/Library/CloudStorage/OneDrive-Personal/侍Oltar/1.Will/侍OSH/db"

# Get the current date and time in YYYY-MM-DD_HH-MM-SS format
DATE_TIME=$(date +"%Y-%m-%d_%H-%M-%S")

# Create a new directory with the current date and time
DEST_PATH="${DEST_BASE_PATH}/${DATE_TIME}"
mkdir -p "${DEST_PATH}"

# Copy the database file to the new directory
cp "${SOURCE_PATH}" "${DEST_PATH}/oltar.db"

# Print a confirmation message
echo "Backup completed: ${DEST_PATH}/oltar.db"


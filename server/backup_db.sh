#!/bin/bash

# Define the source and destination paths
SOURCE_PATH="/Users/oltar/Documents/CodeLocal /Perso/Oltar/OSH_app/server/oltar.db"
DEST_BASE_PATH="/Users/oltar/Library/CloudStorage/OneDrive-Personal/Oltar/1.Will/OSH/db"

# Get the current date in YYYY-MM-DD format
DATE=$(date +"%Y-%m-%d")

# Create a new directory with the current date
DEST_PATH="${DEST_BASE_PATH}/${DATE}"
mkdir -p "${DEST_PATH}"

# Copy the database file to the new directory
cp "${SOURCE_PATH}" "${DEST_PATH}/oltar.db"

echo "Backup completed: ${DEST_PATH}/oltar.db"
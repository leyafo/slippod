#!/bin/bash

# Define the path to the file containing the database path
DB_PATH_FILE="$HOME/.slippod/slippod.config"

# Check if the file exists
if [[ ! -f "$DB_PATH_FILE" ]]; then
    echo "Error: Database path file not found!"
    exit 1
fi

# Read the database path from the file
DB_PATH=$(cat "$DB_PATH_FILE")

# Define the path to the SQLite extension you want to load
EXTENSION_PATH="./libsimple/libsimple.so"

# Check if the database exists
if [[ ! -f "$DB_PATH" ]]; then
    echo "Error: Database not found at $DB_PATH!"
    exit 1
fi

# Start sqlite3 with the extension loaded
echo sqlite3 "$DB_PATH" -cmd ".load $EXTENSION_PATH"
sqlite3 "$DB_PATH" -cmd ".load $EXTENSION_PATH"


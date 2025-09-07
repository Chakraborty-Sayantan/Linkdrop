#!/bin/bash

# Navigate into the backend directory first
cd linkdrop_backend

# Install Python dependencies
pip install -r requirements.txt

# Run database migrations
python manage.py migrate --no-input

# Collect static files
python manage.py collectstatic --no-input --clear
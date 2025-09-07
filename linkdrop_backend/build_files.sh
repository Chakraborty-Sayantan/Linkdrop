#!/bin/bash
pip install -r linkdrop_backend/requirements.txt
python linkdrop_backend/manage.py migrate --no-input
python linkdrop_backend/manage.py collectstatic --no-input --clear
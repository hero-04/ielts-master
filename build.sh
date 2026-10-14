#!/usr/bin/env bash
# Render build command: `./build.sh`
# Installs dependencies, collects static files and applies migrations on every deploy.
set -o errexit

pip install -r requirements.txt
python manage.py collectstatic --no-input
python manage.py migrate --no-input

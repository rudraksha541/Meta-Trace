# app/utils.py

import os

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'pdf', 'mp4'}

def allowed_file(filename):
    """Check if the file has an allowed extension."""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

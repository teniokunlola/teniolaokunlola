"""
WSGI config for Teniola Site production deployment.
"""

import os
import sys
from pathlib import Path

# Add the project directory to Python path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR))

# Set production environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'teniola_site.settings_production')

# Import Django WSGI application
from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()

# For production servers like Gunicorn
app = application

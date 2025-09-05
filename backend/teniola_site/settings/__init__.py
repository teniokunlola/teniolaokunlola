"""
Settings package for teniola_site project.
"""

import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables first
BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_file = BASE_DIR / ".env"
if env_file.exists():
    load_dotenv(env_file)

# Determine environment and import appropriate settings
DJANGO_ENV = os.getenv("DJANGO_ENV", "development")  # Default to development

if DJANGO_ENV == "development":
    from .development import *
else:
    from .production import *

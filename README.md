# Teniola Okunlola - Portfolio Site

A dynamic full-stack portfolio web application built with Python Django REST Framework backend and React + Vite frontend utilising modern web technologies and languages; TailwindCSS, Typescript, and newer UI components (Shadcn, Lucide React, among others).

## 🚀 Quick Start

### Prerequisites
- Python 3.13+ (installed via Homebrew)
- Node.js 24.5.0+ (installed via Homebrew)
- npm 11.5.1+

### Setup (macOS)

1. **Clone and setup the project:**
   ```bash
   cd teniolaokunlola
   git clone https://github.com/teniokunlola/teniolaokunlola
   cd teniolaokunlola
   make setup
   ```

2. **Start development servers:**
   ```bash
   make dev
   ```

   This will start:
   - Backend: http://localhost:8000
   - Frontend: http://localhost:3000

## 📁 Project Structure

```
teniola-site/
├── backend/                 # Django REST Framework API
│   ├── api/                # Main API app
│   ├── core/               # Core configuration
│   ├── teniola_site/       # Django project settings
│   ├── venv/               # Python virtual environment
│   ├── requirements.txt    # Python dependencies
│   └── manage.py          # Django management script
├── frontend/               # React + Vite frontend
│   ├── src/               # Source code
│   ├── public/            # Static assets
│   ├── package.json       # Node dependencies
│   └── vite.config.ts     # Vite configuration
├── Makefile               # Development commands
└── README.md              # This file
```

## 🛠️ Development Commands

| Command | Description |
|---------|-------------|
| `make help` | Show all available commands |
| `make install` | Install all dependencies |
| `make dev` | Start both servers |
| `make dev-backend` | Start backend only |
| `make dev-frontend` | Start frontend only |
| `make build` | Build for production |
| `make clean` | Clean build artifacts |
| `make test` | Run all tests |
| `make lint` | Run linters |
| `make check-ports` | Check port availability |

## 🔧 Manual Setup (Alternative)

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 📱 Features

- **Backend (Django REST Framework):**
  - Firebase Authentication
  - Admin panel with custom roles
  - Portfolio management API
  - Contact form handling

- **Frontend (React + Vite):**
  - Modern React with TypeScript
  - Tailwind CSS for styling
  - Responsive design
  - Admin dashboard
  - Portfolio showcase
  - Contact forms

## 🔐 Environment Configuration

### Backend (.env)
Configure `backend/.env.development` or `backend/.env.production` and configure. For example:
```bash
SECRET_KEY=your-django-secret-key
DEBUG=True
FIREBASE_SERVICE_ACCOUNT_KEY_PATH=core/firebase_service_account.json
```

### Frontend (.env)
Copy `frontend/.env.development` to `frontend/.env.production` and configure:
```bash
VITE_API_BASE_URL=http://localhost:8000/api
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_PROJECT_ID=your-project-id
```

## 🐛 Troubleshooting

### Common Issues on macOS

1. **Rollup Darwin x64 Error:**
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Virtual Environment Issues:**
   ```bash
   cd backend
   rm -rf venv
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Port Already in Use:**
   ```bash
   make check-ports
   # Kill processes using ports 3000 or 8000 if needed
   lsof -ti:3000 | xargs kill
   lsof -ti:8000 | xargs kill
   ```

4. **Permission Issues:**
   ```bash
   # Ensure proper ownership
   sudo chown -R $(whoami) /path/to/teniola-site
   ```

## 🏗️ macOS-Specific Optimizations

This project is optimised for macOS development with:
- Proper `.gitignore` files for macOS-specific files (`.DS_Store`, etc.)
- Virtual environment with correct Unix structure
- Homebrew-compatible Python and Node.js versions
- EditorConfig for consistent formatting
- Makefile for easy command execution

## 📦 Dependencies

### Backend
- Django 5.2.5
- Django REST Framework 3.16.1
- Firebase Admin SDK 4.5.3
- Django CORS Headers 4.7.0

### Frontend
- React 19.1.1
- Vite 7.1.0
- TypeScript 5.8.3
- Tailwind CSS 4.1.11
- Firebase 12.1.0

## 🤝 Contributing

1. Ensure you're using the correct Python and Node.js versions
2. Run `make lint` before committing
3. Test your changes with `make test`
4. Use the Makefile commands for consistency

## 📄 License

Private project for Teniola Okunlola's portfolio.

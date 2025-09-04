# mp3
## pip install lyricsge# MP3 Audio Quality Analyzer

A modern web application for analyzing MP3 audio quality with React frontend and Flask backend.

## Features

- 🎵 Upload and analyze MP3 files
- 📊 Quality metrics: bitrate, sample rate, loudness (LUFS)
- 🏆 Color-coded quality ratings (Golden, Green, Yellow, Red)
- ⚛️ Modern React frontend with responsive design
- 🐍 Flask API backend with audio analysis capabilities
- 🎤 Lyrics integration with Genius API

## Tech Stack

- **Frontend**: React.js with modern CSS
- **Backend**: Flask (Python) with CORS support
- **Audio Analysis**: librosa, pyloudnorm, mutagen
- **Environment**: python-dotenv for secure configuration

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn

### 1. Clone and Setup Environment

```bash
git clone <your-repo-url>
cd mp3
```

### 2. Backend Setup

```bash
# Activate virtual environment
source .venv/bin/activate

# Install Python dependencies (if not already installed)
pip install flask flask-cors librosa pyloudnorm mutagen lyricsgenius python-dotenv
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cd ..
```

### 4. Environment Variables

Copy `.env.example` to `.env` and add your API keys:

```bash
cp .env.example .env
# Edit .env and add your GENIUS_ACCESS_TOKEN
```

## Running the Application

### Option 1: Start Both Servers (Recommended)

```bash
./start-dev.sh
```

This will start both the Flask backend (port 8080) and React frontend (port 3000).

### Option 2: Start Servers Separately

**Backend only:**
```bash
./start-backend.sh
# Or manually:
# source .venv/bin/activate
# cd backend && python app.py
```

**Frontend only:**
```bash
./start-frontend.sh
# Or manually:
# cd frontend && npm start
```

## Usage

1. Open your browser to `http://localhost:3000`
2. Upload an MP3 file using the file picker
3. Click "Analyze Audio" to process the file
4. View the detailed quality analysis results

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/lyrics` - Get lyrics (test endpoint)
- `POST /api/analyse` - Analyze uploaded MP3 file

## Quality Metrics

- **Bitrate**: Higher is better (320+ kbps = Golden)
- **Sample Rate**: Higher is better (48+ kHz = Golden)  
- **Loudness**: Optimal around -14 LUFS (streaming standard)

## Development

The application runs in development mode with:
- Hot reloading for React frontend
- Flask debug mode for backend
- CORS enabled for cross-origin requests

## Environment Variables

Required in `.env`:
- `GENIUS_ACCESS_TOKEN` - Your Genius API token for lyrics

## Project Structure

```
mp3/
├── backend/
│   ├── app.py              # Flask API server
│   └── audio_utils.py      # Audio analysis utilities
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   ├── UploadForm.js   # File upload component
│   │   └── Results.js      # Results display component
│   └── public/
├── .env                    # Environment variables (do not commit)
├── .env.example           # Environment template
├── start-dev.sh           # Start both servers
├── start-backend.sh       # Start backend only
└── start-frontend.sh      # Start frontend only
```us
##
## source /Users/ashwinsaravanapavan/Document/personal_project/mp3/.venv/bin/activate
## python app.py

To address all issues (including breaking changes), run:
  npm audit fix --force

Run `npm audit` for details.

Success! Created frontend at /Users/ashwinsaravanapavan/Document/personal_project/mp3/frontend
Inside that directory, you can run several commands:

  npm start
    Starts the development server.

  npm run build
    Bundles the app into static files for production.

  npm test
    Starts the test runner.

  npm run eject
    Removes this tool and copies build dependencies, configuration files
    and scripts into the app directory. If you do this, you can’t go back!

We suggest that you begin by typing:

  cd /Users/ashwinsaravanapavan/Document/personal_project/mp3/frontend
  npm start

Happy hacking!
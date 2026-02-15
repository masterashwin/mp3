# MP3 Audio Quality Analyzer

A small full-stack app that analyzes MP3 files, reports quality metrics, and (optionally) fetches lyrics.

This README is updated to reflect recent changes: an optional lyrics feature, frontend routing (`/info`), CSS utilities, and small backend improvements.

## Features

- Upload and analyze MP3 files from the browser
- Quality metrics: bitrate, sample rate, loudness (LUFS)
- Heuristic "true quality" estimation using spectral cutoff detection
- Optional lyrics lookup using the Genius API (song + artist required)
- React frontend (client-side routing)
- Flask backend with audio processing (librosa + pyloudnorm)
- BEM + utility-based CSS structure for reusable styles

## Quick Links

- Frontend routes:
	- `/` - Upload page
	- `/results` - Results page (only accessible after an analysis)
	- `/info` - Audio education / metrics documentation 

- Backend API:
	- `GET /api/health` - health check
	- `GET /api/lyrics` - legacy/test endpoint (may call older helper)
	- `POST /api/analyse` - upload and analyze an MP3 file

## API: `POST /api/analyse`

This is the main endpoint used by the frontend. It expects a multipart/form-data request with the following fields:

- `file` (required): the MP3 file to analyze
- `songName` (optional): song title for lyrics lookup
- `artistName` (optional): artist name for lyrics lookup

Important: lyrics lookup is only attempted when *both* `songName` and `artistName` are provided. If only one is provided the backend will ignore the lyrics request to avoid API errors.

Response (JSON) includes:
- `metrics`: object with `file`, `duration_sec`, `loudness_LUFS`, `bitrate_kbps`, `sample_rate_kHz`, plus `true_quality_estimation` (cutoff Hz) and `cutoff_idx`/`summaryCutOff`
- `quality`: color-coded quality mapping for metrics (golden/green/yellow/red)
- `lyrics` (nullable): lyrics text when fetched
- `song_info`: the `song_name` and `artist_name` values returned

## Environment / Secrets

Create a `.env` file (or copy `.env.example`) and add the following if you wish to enable lyrics fetching via the Genius API:

- `GENIUS_API_TOKEN` (recommended) — your Genius API token

Note: current code contains a legacy lyrics helper in `audio_utils.py`. The lyrics fetch will run only when both song + artist are provided. If you don't set a token, lyrics fetching will be skipped or may fail gracefully.

## Database Setup

This application uses **PostgreSQL** to store track information (artist name, song title, and lyrics). The database is automatically initialized on backend startup.

### PostgreSQL Installation

**Docker (Recommended for Quick Setup):**
If using Docker, PostgreSQL is included in `docker-compose.yml` and `docker-compose.dev.yml`. No additional setup needed—just run:
```bash
docker compose up --build
```
This starts PostgreSQL, pgAdmin, the Flask backend, and React frontend automatically.

**Virtual Environment (macOS with Homebrew):**
```bash
# Install PostgreSQL
brew install postgresql@15

# Start the PostgreSQL service
brew services start postgresql@15

# Create the audio_analyzer database
createdb audio_analyzer

# Verify connection
psql audio_analyzer
```

**Virtual Environment (Linux):**
```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Start the service
sudo systemctl start postgresql

# Create the database as the postgres user
sudo -u postgres createdb audio_analyzer
```

**Virtual Environment (Windows):**
Download and install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/). During installation, set a password for the `postgres` user. Then create the database:
```bash
psql -U postgres -c "CREATE DATABASE audio_analyzer;"
```

### Database Configuration

The backend reads database credentials from your `.env` file. Copy `.env.example` and update if needed:

```bash
cp .env.example .env
```

**Homebrew macOS users:** The default `.env` is pre-configured to use your macOS username. No changes needed if you ran `brew services start postgresql@15`.

**Docker users:** Update `.env` to match your chosen credentials (defaults: `audio_analyzer`/`postgres123`).

**Other environments:** Adjust `DB_HOST`, `DB_USER`, `DB_PASSWORD`, and `DB_PORT` in `.env` as needed.

### Viewing Data with pgAdmin (GUI)

**Docker:**
1. Start Docker Compose: `docker compose up`
2. Open [http://localhost:5050](http://localhost:5050) in your browser
3. Login with `admin@example.com` / `admin`
4. Click "Add New Server"
   - **Name:** `audio_analyser` (or any name)
   - **Host name:** `db` (Docker service name)
   - **Port:** `5432`
   - **Username:** `postgres`
   - **Password:** `postgres`
5. Navigate to `audio_analyzer` → `Schemas` → `public` → `Tables` → `track_info`

**Virtual Environment (macOS):**
```bash
# Install pgAdmin locally
brew install pgadmin4

# Start pgAdmin (or use the installed GUI app)
pgadmin4

# Then open http://localhost:5050 and follow Docker steps above
# Local connection: Host: localhost, Port: 5432, User: <your-macOS-username>, Password: (leave blank)
```

### Database Schema

The `track_info` table stores:
- `session_id` — Auto-incrementing primary key
- `artist_name` — Track artist
- `song_title` — Track title
- `lyrics_body` — Full lyrics text (nullable)
- `created_at` — Timestamp when record was created
- `updated_at` — Timestamp when record was last updated

**Smart Upsert Logic:** If you upload the same song/artist combination twice, the database updates the existing record (including lyrics) instead of creating duplicates.

---

## Development setup

### Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn
- ffmpeg installed (librosa may require it for certain file formats)
- PostgreSQL 12+ (or Docker)

### Backend

Create and activate a Python virtual environment and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
# OR install directly:
pip install flask flask-cors librosa pyloudnorm mutagen lyricsgenius python-dotenv numpy matplotlib
```

### Frontend

```bash
cd frontend
npm install
cd ..
```

### Start servers (recommended)

Run the helper script which starts backend and frontend in dev mode:

```bash
./start-dev.sh
```

If you prefer to run separately:

```bash
# Backend
source .venv/bin/activate
python backend/app.py

# Frontend
cd frontend
npm start
```

Frontend runs on `http://localhost:3000` by default and the backend on `http://localhost:8080`.

### Docker (alternative setup)

Prerequisite: Docker Desktop (macOS/Windows) or Docker Engine + Compose (Linux).

Production-style build:

```bash
docker compose up --build
```

Development mode (live code mounts):

```bash
docker compose -f docker-compose.dev.yml up --build
```

## Known Limitations: Docker vs. Local Environment

⚠️ Known Limitations: Docker vs. Local Environment
While the application is fully containerized, there is a known limitation regarding the Lyric Fetching feature:

Local Virtual Environment: Full support for lyric fetching via the Genius API.

Docker Environment: Lyric fetching is currently disabled/unavailable due to upstream anti-bot protections (Cloudflare) that flag containerized traffic.

For the full experience, including lyrics, it is recommended to run the backend in a standard Python virtual environment.

## Styling and structure notes

The project uses a hybrid CSS approach:

- BEM blocks live in `frontend/src/styles/blocks/` (component-specific rules)
- Small utility files live in `frontend/src/styles/utils/` (surfaces, typography, layout helpers)
- `frontend/src/styles/main.css` imports variables, base styles, blocks, and utilities in order

New/changed CSS helpers and modifiers you might want to use:

- `surface`, `surface--padding-lg`, `surface--elevated` — container primitives
- `text--sm`, `text--lg`, `text--primary`, `text--secondary` — typography utilities
- `grid--auto-fit-md`, `grid--auto-fit-lg` — grid helpers
- Button modifiers: `button--info` (small inline info button), `button--back` (small left-aligned back button)

## Notes & Troubleshooting

- If you move files around, restart VS Code to avoid it auto-creating empty files from stale imports.
- If lyrics lookup isn't working, confirm `GENIUS_API_TOKEN` is set and that both `songName` and `artistName` were provided on the upload form.
- The true-quality estimator uses spectral analysis heuristics and returns a cutoff frequency (Hz) and a small confidence value. You may want to tune `detect_cutoff_frequency()` parameters (e.g., `drop_db`, `consec_bins`, `smooth_bins`) and the `QUALITY_THRESHOLDS` in `evaluate_quality()` for your dataset.

## Project layout (high level)

```
mp3/
├─ backend/
│  ├─ app.py
│  └─ audio_utils.py
├─ frontend/
│  ├─ public/
│  └─ src/
│     ├─ components/
│     ├─ pages/
│     ├─ styles/
│     │  ├─ blocks/
│     │  └─ utils/
│     └─ App.js
├─ .env.example
├─ start-dev.sh
└─ README.md
```


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
	- `/info` - Audio education / metrics documentation (placeholder)

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

## Development setup

### Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn
- ffmpeg installed (librosa may require it for certain file formats)

### Backend

Create and activate a Python virtual environment and install dependencies:

```bash
python -m venv .venv
source .venv/bin/activate
#pip install -r backend/requirements.txt
# OR install directly:
pip install flask flask-cors librosa pyloudnorm mutagen lyricsgenius python-dotenv numpy matplotlib sqlalchemy sqlalchemy-utils flask_sqlalchemy
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
- The true-quality estimator uses spectral analysis heuristics and returns a cutoff frequency (Hz) and a small confidence value. You may want to tune thresholds in `audio_utils.classify_quality` for your dataset.

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


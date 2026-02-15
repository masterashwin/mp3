# Technical Design Document: MP3 Audio Quality Analyzer

## Overview

This document explains the architectural and technology decisions made for the MP3 Audio Quality Analyzer project, including rationale for key choices like database selection, audio analysis methods, and deployment strategy.

---

## 1. Audio Analysis Architecture

### Spectral Cutoff Detection (True Quality Estimation)

The core quality metric is **spectral cutoff frequency**, calculated using short-time Fourier transform (STFT):

1. **STFT Computation**: Convert audio time-domain samples to frequency domain using a Hann window
2. **Magnitude Extraction**: Get absolute values across the spectrum
3. **Smoothing**: Apply rolling median to reduce noise artifacts
4. **Threshold Detection**: Find the highest frequency where magnitude drops below -25dB relative to peak
5. **Interpolation**: Estimate exact cutoff frequency using neighboring bins

**Why this approach:**
- Real MP3s encode audio up to ~15–20 kHz due to codec bitrate limits
- Low bitrates apply aggressive high-frequency attenuation below 10 kHz
- Cutoff frequency strongly correlates with perceived quality for non-technical users
- More meaningful than raw bitrate (which can be misleading with VBR)

### Technical Design Details: The 25 dB Threshold

**Why 25 dB?** This value is a practical threshold that distinguishes between:
- **Natural high-frequency roll-off**: Musical audio typically has a gentle roll-off (~10–15 dB from 5 kHz to 20 kHz)
- **True low-pass filtering artifacts**: Low-bitrate MP3s apply aggressive filtering, creating a sharp drop of 25+ dB below the midband

Using 25 dB helps avoid false positives while still reliably detecting the artificial filtering typical of compressed audio.

**Why use the 1–5 kHz midband reference?** This band is:
- Dense with musical content (vocals, guitars, snare drums)
- Less prone to sparse or spiky artifacts
- Provides a stable reference for what "normal" energy looks like

Using this band avoids being overly sensitive to sparse high-frequency content (like hi-hats).

**Why require consecutive bins?** Requiring multiple frequency bins below threshold:
- Prevents a single spiky dip from being misinterpreted as a cutoff
- Makes detection robust and stable across different songs
- Reflects the fact that true filtering affects a range of frequencies, not just one

**Why smooth across frequency bins?** Smoothing with a rolling median:
- Reduces the impact of narrowband spikes (hi-hat transients)
- Ensures the detection reflects overall frequency response trends
- Improves consistency across different musical genres and production styles

### Complementary Metrics

- **Loudness (LUFS)**: Using `pyloudnorm` for ITU-R BS.1770-4 standard measurement (matches streaming platform normalization)
- **Bitrate & Sample Rate**: Extracted via `mutagen` metadata (practical indicators)

### Quality Classification

| True Quality (Cutoff) | Perceived Quality | Bitrate Indicator |
|---|---|---|
| > 19 kHz | Lossless/High Quality | 320 kbps |
| 17–19 kHz | Very Good | 224–256 kbps |
| 15–17 kHz | Good | 192–224 kbps |
| 12–15 kHz | Fair | 128–192 kbps |
| < 12 kHz | Poor | < 128 kbps |

---

## 2. Database Technology Choice: PostgreSQL

### Why PostgreSQL Over Alternatives?

#### **PostgreSQL vs. SQLite**

| Feature | SQLite | PostgreSQL |
|---|---|---|
| **Concurrency** | Single writer (WAL helps but limited) | True ACID with multiversion concurrency control |
| **Extensions** | No native extension system | Rich extension ecosystem (pgvector, PostGIS, UUID, JSON) |
| **Data Types** | Basic (TEXT, INT, REAL) | Advanced (JSONB, ARRAY, UUID, custom types) |
| **Scalability** | Single file (practical limit ~100GB) | Server-based, scales to terabytes |
| **Future Features** | Limited growth path | pgvector for ML-based similarity search |
| **Team Collaboration** | Poor (file locking conflicts) | Excellent (network-based, role management) |

**Decision Rationale:**
- While SQLite works for single-user prototypes, PostgreSQL provides a professional foundation
- JSONB support enables storing structured metadata (audio fingerprints, genre tags) without schema changes
- **pgvector extension** allows future implementation of:
  - Music similarity search ("find songs with similar acoustic profiles")
  - Personalized recommendations based on spectral fingerprints
  - Genre classification using embeddings

#### **PostgreSQL vs. MySQL**

| Feature | MySQL | PostgreSQL |
|---|---|---|
| **Data Type Flexibility** | Stricter type coercion | Advanced types (JSONB, ARRAY, RANGE) |
| **JSON Support** | JSON (read-only in many operations) | JSONB (binary, indexable, queryable) |
| **Window Functions** | Yes (8.0+) | Yes (more mature) |
| **Full Text Search** | Basic FTS | Advanced FTS with ranking |
| **Industry Trend** | Declining for new projects | Growing adoption (Django default, PostGIS standard) |

**Decision Rationale:**
- JSONB allows flexible metadata storage without constant schema migrations
- Better alignment with modern Python/Django ecosystem standards
- Stronger ecosystem for audio/ML extensions (pgvector becoming standard for ML pipelines)

### Implementation Details

**Schema (schema.sql):**
```sql
CREATE TABLE IF NOT EXISTS track_info (
  session_id SERIAL PRIMARY KEY,
  artist_name TEXT NOT NULL,
  song_title TEXT NOT NULL,
  lyrics_body TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(artist_name, song_title)
);
```

**Smart Upsert Logic (database.py):**
The `save_or_update_track_info()` function implements intelligent duplicate handling:
- If (artist_name, song_title) already exists: updates the record (allows lyrics fetching on retry)
- If new: inserts fresh record
- Prevents accumulation of duplicate uploads while supporting metadata enrichment

**Connection Management:**
- `wait_for_db()`: Implements exponential backoff retry (30 attempts) for startup timing issues
- `init_db()`: Loads schema.sql and creates tables on app startup (declarative initialization)
- psycopg2 with proper connection pooling for Flask production use

---

## 3. Backend Architecture

### Framework Choice: Flask

| Aspect | Flask | Django | FastAPI |
|---|---|---|---|
| **Complexity** | Minimal (lightweight) | Full-featured framework | Modern async-first |
| **Learning Curve** | Shallow | Steep | Moderate |
| **Suitable For** | Single-endpoint APIs, prototypes | Large monoliths | Async APIs, microservices |
| **Deployment** | Simple (Gunicorn + WSGI) | Batteries-included | Emerging best practices |

**Decision Rationale:**
- Single `/api/analyse` endpoint doesn't justify Django's overhead
- Lightweight allows focus on audio processing logic
- Easy to upgrade to FastAPI if async processing becomes necessary
- Perfect for educational purposes (clear request → analysis → response flow)

### API Design

**Single `/api/analyse` Endpoint:**
- Accepts an MP3 file (multipart/form-data)
- Computes all metrics in one call
- Returns JSON with quality metrics and optional lyrics
- **Why single endpoint?** Keeps frontend integration simple, avoids extra round-trips, and makes the request/response contract clear

**File Management:**
- Uploads are stored in a dedicated `uploads/` folder
- Files are deleted after processing to keep storage clean and limit risk from untrusted uploads
- This prevents disk exhaustion and keeps the server stateless

### Security Considerations

1. **File Validation**
   - MIME type checking (only `audio/mpeg`)
   - Size limits (50 MB max) to prevent disk exhaustion
   - `werkzeug.utils.secure_filename()` to prevent path traversal attacks

2. **API Protection**
   - CORS configured for localhost development
   - Genius API token stored in `.env` (never in code)
   - External calls (lyrics fetching) are optional and only happen when both song and artist are provided
   - Missing lyrics handled gracefully (API failures don't crash the analysis)

3. **Docker Security**
   - Non-root container user (prevents privilege escalation)
   - Volume permissions restricted to necessary paths
   - Environment variables for secrets (no hardcoded credentials)

---

## 4. Frontend Architecture

### Framework Choice: React with Client-Side Routing

**Why React:**
- Component-based structure reduces repetition (MetricCard, Section, LyricsBlock)
- State management simple for single-page app (upload form → results display)
- Large ecosystem for future features (visualization, audio waveform display)

**Why Client-Side Routing:**
- Uses React Router for `/` (upload), `/results` (analysis), `/info` (education)
- Eliminates page reloads, improving UX
- Single webpack bundle (fast after initial load)
- Works seamlessly in Docker or served from any static host

### Component Structure

The UI is split into small, focused components:
- **Reusable Components**: `InfoButton`, `MetricCard`, `LegendItem`, `LyricsBlock`, `Section`
- **Page Orchestration**: `UploadForm`, `Results`, `AudioEducation` compose reusable components
- **Benefits**: Reduces repetition, makes layout changes easier without rewriting large pages, improves maintainability

**Upload Flow:**
- File validation happens early (only `audio/mpeg` accepted)
- Lyrics input is optional but enforced as a pair (both song and artist required)
- Clear processing states prevent duplicate uploads and improve UX

### CSS Architecture: BEM + Utilities

**Organization by concern:**
- **Base** (`base/`): Global reset and default styles
- **Blocks** (`blocks/`): Component-level styling (e.g., `card.css`, `button.css`, `upload-form.css`)
- **Utils** (`utils/`): Layout helpers, spacing, typography (e.g., `layout.css`, `surface.css`, `text.css`)

This structure matches a scalable design system approach and makes CSS predictable.

**Block-Element-Modifier (BEM) Pattern:**
```css
/* Block: card */
.card { /* base styles */ }

/* Element: card__title */
.card__title { /* styles for title inside card */ }

/* Modifier: card--elevated */
.card--elevated { /* shadow and depth */ }

/* Utility: text--primary */
.text--primary { color: var(--color-primary); }
```

**Class Naming Strategy:**
- Descriptive and grouped by component purpose (e.g., `upload-form__field`, `title--primary`)
- Modifier classes (e.g., `--disabled`, `--primary`) provide clean styling variations without deeply nested selectors
- Prevents CSS specificity wars and reduces conflicts between components

**Benefits:**
- Clear naming structure improves predictability (specificity war)
- Utilities (text--sm, surface--padding-lg) prevent style repetition
- Maintenance: changes are isolated to specific components
- Scalability: easy to add themes or dark mode later

---

## 4.5 Design Principles

### Simplicity Over Complexity
- The project favors straightforward implementation over heavy abstractions
- The analysis happens in one backend call, minimizing UI complexity
- Reduces cognitive load for future maintainers

### Human-Readable Outputs
- The backend returns raw metric values plus classification labels
- The frontend maps values directly to color-coded quality tiers
- Non-technical users can understand results without audio engineering background

### Extensibility
- The current structure allows easy extension with new metrics or UI cards
- Adding new features requires:
  - A new metric function in `audio_utils.py`
  - A new frontend component (e.g., `MetricCard` instance)
  - No fundamental architectural changes
- The lyrics feature is built as an optional extension without complicating core audio flow

---

## 5. Deployment: Docker & Docker Compose

### Architecture Decision

**Why Docker Compose for Development:**
1. **Environment Parity**: Dev environment mirrors production exactly
2. **Database Included**: PostgreSQL + pgAdmin run in containers (no manual installation)
3. **Service Isolation**: Each service (DB, backend, frontend, GUI) has separate resource limits
4. **Networking**: Docker's internal DNS (e.g., `db` hostname) eliminates hardcoded IPs

### Services

| Service | Image | Port | Purpose |
|---|---|---|---|
| `db` | postgres:15-alpine | 5432 | PostgreSQL database server |
| `pgadmin` | dpage/pgadmin4 | 5050 | Web-based database GUI |
| `backend` | python:3.11-slim (custom) | 8080 | Flask API server |
| `frontend` | node:18-alpine (custom) | 3000 (→ Nginx :80) | React SPA with Nginx reverse proxy |

### Development vs. Production Modes

**Development (`docker-compose.dev.yml`):**
- Bind mounts for source code (live reloading)
- Uses Node `build` stage for npm dependencies
- Exposed ports for debugging

**Production (`docker-compose.yml`):**
- Multi-stage builds (smaller final images)
- No bind mounts (immutable containers)
- Optimized for performance and security

### Known Limitation: Docker & Lyric Fetching (Anti-Bot Detection)

**The Issue:** The `lyricsgenius` library retrieves lyrics by scraping the Genius website (their JSON API does not provide full lyric text). When running inside a `python:slim` Docker container, requests are consistently met with a **403 Forbidden error**.

**Root Cause Analysis:**
- **TLS Fingerprinting**: Cloudflare (used by Genius) detects SSL handshakes and network headers typical of minimal Linux containers and flags them as automated traffic
- **Network Isolation**: Attempts to use `network_mode: host` to mitigate this caused local DNS resolution conflicts between frontend and backend services
- **Container Detection**: The containerized environment triggers anti-bot mechanisms even with spoofed headers

**Attempted Fixes:**
- **Header Spoofing**: Injected browser-like User-Agent strings into Genius request headers (unsuccessful)
- **Image Optimization**: Tested images with updated `ca-certificates` for more modern TLS handshakes (unsuccessful)
- **Network Configuration**: Verified behavior under bridge vs. host networking (no improvement)

**Conclusion & Workaround:**
To keep the core audio analysis stable and lightweight in Docker, lyric fetching is treated as an environment-specific feature:
- ✅ **Works in virtual environment**: Direct access to system network, full TLS handshake
- ❌ **Blocked in Docker**: Cloudflare fingerprinting detects containerized traffic
- Avoiding heavy headless browser dependencies (Selenium/Playwright) prevents large image bloat and operational complexity

**Future Solution:** Implement rate-limiting, rotating proxies, batch lyrics fetching service, or migrate to an API with proper bot access (if available).

---

## 6. Dependency Management

### Python (Backend)

| Package | Version | Purpose |
|---|---|---|
| Flask | 3.x | Web framework |
| librosa | 0.10.x | STFT, audio processing |
| pyloudnorm | 0.1.x | LUFS loudness measurement (ITU standard) |
| mutagen | 1.46.x | MP3 metadata extraction |
| lyricsgenius | 4.x | Genius API lyrics fetching |
| psycopg2 | 2.9.x | PostgreSQL adapter |
| python-dotenv | latest | Environment variable loading |

### Frontend (React)

| Package | Purpose |
|---|---|
| react-router-dom | Client-side routing |
| axios | HTTP client for API calls |
| (No UI framework) | Custom CSS (BEM) keeps bundle small |

**Rationale:** Minimal dependencies reduce bundle size and security surface.

---

## 7. Future Enhancements

### Short-term
- [ ] Batch upload (analyze multiple files)
- [ ] Audio visualization (waveform + spectrogram display)
- [ ] Export results (CSV, JSON, PDF)
- [ ] Search/filter track history in database

### Medium-term
- [ ] User authentication (saved playlists, personal history)
- [ ] Advanced metrics (dynamic range, peak detection)
- [ ] Genre classification using spectral features

### Long-term
- [ ] pgvector integration for similarity search ("similar songs")
- [ ] Machine learning model for quality prediction
- [ ] API commercialization (rate limiting, tiering)

---

## 8. Development Workflow

### Local Setup (Recommended for Development)

```bash
# Backend
source .venv/bin/activate
python backend/app.py

# Frontend (separate terminal)
cd frontend
npm start
```

**Advantages:** Fast iteration, full lyric support, clear error messages.

### Docker Setup (Recommended for Testing Production Behavior)

```bash
docker compose up --build
```

**Advantages:** Tests actual deployment, includes database, isolated from system packages.

---

## 9. Performance Considerations

### Audio Analysis Bottlenecks
- **STFT Computation**: O(N log N) where N = sample count. 3-minute MP3 ≈ 500ms on modern CPU
- **LUFS Measurement**: Multiple STFT passes with filtering; ~200ms additional
- **Lyrics Fetching**: Network I/O dominant; 1-3 second API latency

### Optimizations Implemented
- NumPy/SciPy vectorization (avoid Python loops)
- Streaming audio chunks to disk (handles large files)
- Lazy LUFS computation (only if loudness metric requested)

### Future Opportunities
- Cache spectral analysis results (duplicate uploads)
- Parallelize STFT + LUFS computation with async/threading
- Redis caching for frequently-analyzed songs

---

## 10. Trade-offs & Design Decisions

### Pros
- **Clear structure**: BEM CSS, component-based React, single Flask endpoint
- **Readable code**: Minimal abstractions, straightforward data flow
- **User-friendly outputs**: Quality metrics mapped to intuitive color tiers
- **Extensible architecture**: Easy to add new metrics without major refactoring
- **Lightweight deployment**: Minimal dependencies, small Docker images

### Cons
- **Single-endpoint design**: As feature count grows, `/api/analyse` may accumulate complexity
- **Limited audio format support**: Currently MP3-only; adding WAV, FLAC, etc. requires additional validation and parsing logic
- **Docker lyric limitations**: Anti-bot protections prevent lyric fetching in containerized environments
- **Manual testing**: No automated test suite yet (reliant on manual validation)

### Why These Trade-offs Are Acceptable
- The project prioritizes **clarity and maintainability** over premature generalization
- MP3 is the target use case; other formats can be added when needed
- The audio analysis core is stable; complexity arises only if adding unrelated features

---

## 11. Testing Strategy

**Currently Manual:**
- Upload test MP3s (known bitrates) and verify spectral cutoff matches expectations
- Test lyrics with multi-word artist/song names
- Verify database upsert prevents duplicates
- Validate UI rendering and state transitions

**Quality Assurance Process:**
- Tune `detect_cutoff_frequency()` parameters (e.g., `drop_db`, `consec_bins`, `smooth_bins`) against known samples
- Adjust `QUALITY_THRESHOLDS` in `evaluate_quality()` based on dataset feedback
- Spot-check loudness values against professional metering tools

**Future:**
- Unit tests for audio processing functions (pytest)
- Integration tests for Flask API with fixture MP3 files
- E2E tests for React frontend (Cypress/Playwright)
- Container testing (Docker image size, vulnerability scanning)
- Performance benchmarks for STFT computation on large files

---

## Conclusion

This architecture prioritizes **clarity and maintainability** over premature optimization. PostgreSQL provides a professional data layer with clear upgrade paths (pgvector, advanced metrics). Flask keeps the backend focused on audio processing without framework overhead. React + BEM CSS ensures the frontend scales gracefully while staying lightweight.

Key architectural decisions are driven by:
- **Simplicity**: Single endpoint, straightforward audio pipeline
- **Extensibility**: Component-based UI, pluggable metrics
- **Reliability**: Graceful failure modes (missing lyrics don't crash analysis)
- **Professionalism**: Industry-standard loudness measurement, modern database choice

The design anticipates future growth: from hobby project → SaaS analytics service → ML-powered music intelligence platform, with clear upgrade paths for each phase.

# Technical Design Document

## Project Overview
This project is an MP3 Audio Quality Analyzer with a Flask backend and a React frontend. The backend ingests an MP3, computes audio quality metrics (loudness, bitrate, sample rate, and a spectral cutoff estimate), and optionally fetches lyrics. The frontend collects user inputs, uploads the file, and presents results with a structured, reusable UI.

## Backend Design Choices

### 1. Audio analysis pipeline (librosa + pyloudnorm + mutagen)
- **librosa** is used for the spectral analysis because it provides stable STFT utilities and flexible frequency-domain processing.
- **pyloudnorm** is used for LUFS because it follows the EBU R128 standard, which is a widely accepted loudness measurement used in audio engineering.
- **mutagen** is used to read MP3 metadata (bitrate and sample rate) from the file header, which is faster and more reliable than estimating from decoded audio.

### 2. Spectral cutoff detection (25 dB drop)
- The cutoff detection looks for a sustained energy drop of **25 dB below the midband reference**.
- **Why 25 dB?** This value is a practical threshold that distinguishes between natural high‑frequency roll‑off (which may drop ~10–15 dB) and true low‑pass filtering artifacts common in low‑bitrate encodings. It helps avoid false positives while still detecting aggressive filtering.
- **Why use the 1–5 kHz midband?** This band is typically dense with musical content (vocals, guitars, snare), so it provides a stable reference for what “normal” energy looks like. Using this band avoids being overly sensitive to sparse or spiky high‑frequency content.
- **Why require consecutive bins?** Requiring multiple bins below threshold prevents a single spiky dip from being interpreted as a cutoff. This makes the detection more robust and stable across different songs.
- **Why smooth across frequency bins?** Smoothing reduces the impact of narrowband spikes (like hi‑hat hits) so the decision reflects the overall trend instead of a short burst.

### 3. Quality evaluation logic
- **Bitrate, sample rate, and LUFS** are mapped to graded categories (golden/green/yellow/red) to provide a user‑friendly quality summary.
- Loudness uses inverted logic because a very loud file can indicate aggressive limiting or distortion. The thresholds reflect common streaming loudness targets (around −14 LUFS).

### 4. API design
- **`/api/analyse`** is a single endpoint that accepts an MP3, computes metrics, and returns JSON.
- This keeps the frontend integration simple and avoids extra round‑trips.
- The backend deletes the file after processing to keep storage clean and limit risk from untrusted uploads.

### 5. Security and safety measures
- Only MP3 uploads are accepted at the API layer.
- Uploads are stored in a dedicated `uploads/` folder and removed after processing.
- External calls (lyrics fetching) are optional and only happen when both song and artist are provided.

## Frontend Design Choices

### 1. Component structure
- The UI is split into small, focused components (e.g., `InfoButton`, `MetricCard`, `LegendItem`, `Section`).
- This reduces repetition and makes layout changes easier without rewriting large pages.
- Pages (e.g., `UploadForm`, `Results`, `AudioEducation`) are treated as orchestration layers that compose these reusable components.

### 2. Upload flow
- File validation happens early in the UI to provide immediate feedback (only `audio/mpeg` accepted).
- Lyrics input is optional but enforced as a pair, reducing incomplete API requests.
- The UI shows clear processing states, preventing duplicate uploads and improving UX.

### 3. CSS architecture
- Styles are organized by **blocks** (component‑level styling), **utils** (layout helpers), and **base** (reset and global rules).
- This structure matches a scalable design system approach:
  - **Base:** consistent defaults and resets.
  - **Blocks:** self‑contained styles for specific UI elements.
  - **Utils:** reusable helpers for layout, spacing, and typography.
- This makes the CSS predictable and reduces conflicts between components.

### 4. Class naming strategy
- Classes are descriptive and grouped by component purpose (e.g., `upload-form__field`, `title--primary`).
- Modifier classes (e.g., `--disabled`, `--primary`) provide clean, consistent styling variations without deeply nested selectors.

## Operational Choices

### 1. Simplicity over complexity
- The project favors straightforward implementation over heavy abstractions.
- The analysis happens in one backend call, minimizing UI complexity.

### 2. Human‑readable outputs
- The backend returns raw metric values plus classification labels.
- The frontend can display values directly and map color or explanation to the quality tiers.

### 3. Extensibility
- The current structure allows easy extension with new metrics or UI cards by adding a backend metric and a frontend component.
- The lyrics feature is built as a optional extension without complicating the core audio flow.

## Technical Challenges

### Scraping & Anti-Bot Mitigations (Lyrics in Docker)
One of the primary hurdles in this project was the transition of the lyric-fetching module to Docker.

**The Issue:** The `lyricsgenius` library retrieves lyrics by scraping the Genius website (their JSON API does not provide full lyric text). When running inside a `python:slim` Docker container, requests are consistently met with a 403 Forbidden error.

**Root Cause Analysis:**
- **TLS Fingerprinting:** Cloudflare (used by Genius) detects SSL handshakes and network headers typical of minimal Linux containers and flags them as automated traffic.
- **Network Isolation:** Attempts to use `network_mode: host` to mitigate this caused local DNS resolution conflicts between frontend and backend services.

**Attempted Fixes:**
- **Header Spoofing:** Injected browser-like User-Agent strings into Genius request headers.
- **Image Optimization:** Tested images with updated `ca-certificates` for more modern TLS handshakes.
- **Network Configuration:** Verified behavior under bridge vs. host networking.

**Conclusion:** To keep the core audio analysis stable and lightweight in Docker, lyric fetching is treated as an environment-specific feature. Avoiding heavy headless browser dependencies (e.g., Selenium/Playwright) prevents a large increase in image size and operational complexity.

## Trade‑offs
- **Pros:** Clear structure, readable code, user‑friendly outputs, extensible architecture.
- **Cons:** Single‑endpoint design may grow large if many features are added; additional audio formats would require further validation and parsing logic.

## Summary
The project prioritizes clarity, reliability, and user‑friendly output. The 25 dB cutoff rule provides a practical detection threshold, the component and CSS structure keep the UI maintainable, and the backend pipeline focuses on stable and widely accepted audio measurements.

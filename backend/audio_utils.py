import librosa
import pyloudnorm as pyln
from mutagen.mp3 import MP3
import lyricsgenius
import os
from dotenv import load_dotenv
import numpy as np
import matplotlib.pyplot as plt

# Load environment variables from .env file
load_dotenv()

def detect_cutoff_frequency(y, sr,
                            n_fft=8192, hop_length=2048,
                            midband=(1000, 5000),
                            ignore_below=1000,
                            drop_db=25.0,
                            consec_bins=8,
                            smooth_bins=9):

    # STFT magnitude (how much energy lives at each frequency)
    S = np.abs(librosa.stft(y, n_fft=n_fft, hop_length=hop_length, window='hann'))
    freqs = librosa.fft_frequencies(sr=sr, n_fft=n_fft)

    # Average (median) across time (one curve: energy vs frequency)
    mag = np.median(S, axis=1)

    # Convert to dB relative to the max in the spectrum
    mag_db = librosa.amplitude_to_db(mag, ref=np.max)

    # Find midband reference level (median dB between 1–5 kHz by default)
    mb_lo = np.searchsorted(freqs, midband[0])
    mb_hi = np.searchsorted(freqs, midband[1])
    mid_ref_db = np.median(mag_db[mb_lo:mb_hi])

    # Smooth across frequency to avoid spiky decisions (1-5kHz = resilient to hi-hat spikes)
    if smooth_bins > 1:
        kernel = np.ones(smooth_bins) / smooth_bins
        mag_db_smooth = np.convolve(mag_db, kernel, mode='same')
    else:
        mag_db_smooth = mag_db

    # Start searching above ignore_below
    start_idx = np.searchsorted(freqs, ignore_below)

    # Threshold (relative to midband)
    thr_db = mid_ref_db - drop_db

    below = mag_db_smooth[start_idx:] < thr_db

    # Require 'consec_bins' consecutive bins below threshold
    if consec_bins > 1:
        # rolling sum over boolean array
        win = np.ones(consec_bins, dtype=int)
        consec = np.convolve(below.astype(int), win, mode='same')
        first_idx_rel = np.argmax(consec >= consec_bins)
        if consec[first_idx_rel] >= consec_bins:
            cutoff_idx = start_idx + first_idx_rel
        else:
            cutoff_idx = len(freqs) - 1
    else:
        # first below-threshold bin
        idxs = np.where(below)[0]
        cutoff_idx = start_idx + (idxs[0] if len(idxs) else (len(freqs) - 1))

    try:
        summary = summarize_cutoff(freqs, mag_db_smooth, cutoff_idx, window_bins=consec_bins)
    except Exception:
        # Fallback: return a conservative empty summary and confidence 0
        summary = ((float(freqs[max(0, cutoff_idx)]), float(freqs[min(len(freqs)-1, cutoff_idx)])), 0.0)

    # Also return the cutoff frequency in Hz (useful for quality heuristics)
    cutoff_hz = float(freqs[min(cutoff_idx, len(freqs)-1)])

    return {"true_quality_estimation": cutoff_hz, "summaryCutOff": summary}

def summarize_cutoff(freqs, mag_db_smooth, cutoff_idx, window_bins=12):
    """Return a cutoff range (Hz) and a simple confidence score."""

    lo = max(0, cutoff_idx - window_bins)
    hi = min(len(mag_db_smooth)-1, cutoff_idx + window_bins)
    local = mag_db_smooth[lo:hi]
    # confidence: how far below the midband we are, on average, after cutoff
    post = mag_db_smooth[cutoff_idx:hi]
    pre  = mag_db_smooth[max(0, lo):cutoff_idx]
    drop_after = np.median(pre) - np.median(post)  # bigger = clearer cutoff
    conf = np.clip((drop_after - 15) / 15, 0.0, 1.0)  # 0–1 scale

    bin_hz = freqs[1] - freqs[0]
    lo_hz = max(0.0, freqs[cutoff_idx] - 0.5 * bin_hz)
    hi_hz = freqs[cutoff_idx] + 0.5 * bin_hz
    return {"cutoff_range": (lo_hz, hi_hz), "confidence": float(conf)}
    
def analyze_mp3(file_path):
    # --- Audio loading ---
    y, sr = librosa.load(file_path, sr=None, mono=True)

    # --- Loudness in LUFS ---
    meter = pyln.Meter(sr)  # EBU R128 compliant
    loudness = meter.integrated_loudness(y)
    loudness_LUFS = float(loudness)

    # --- Duration ---
    duration = librosa.get_duration(y=y, sr=sr)

    # --- MP3 metadata (bitrate, sample rate) ---
    audio = MP3(file_path)
    # bitrate and sample_rate are extracted from the MP3 file metadata not computed from audio data
    bitrate = audio.info.bitrate // 1000  # kbps
    sample_rate = audio.info.sample_rate / 1000  # kHz

    # --- TRUE QUALITY ESTIMATION ---
    cutoff_info = detect_cutoff_frequency(y, sr)
    cutoff_hz_value = cutoff_info.get("true_quality_estimation", None)

    return {
        "file": file_path,
        "duration_sec": round(duration, 2),
        "loudness_LUFS": round(loudness_LUFS, 2),
        "bitrate_kbps": bitrate,
        "sample_rate_kHz": sample_rate,
        "true_quality_estimation": cutoff_hz_value,
        "summaryCutOff": cutoff_info.get("summaryCutOff")
    }

def evaluate_quality(metrics: dict) -> dict:
    # Anything worse than yellow = red
    QUALITY_THRESHOLDS = {
        "bitrate_kbps": {"golden": 320, "green": 256, "yellow": 128},  
        "sample_rate_kHz": {"golden": 48, "green": 44.1, "yellow": 32},  
        "loudness_LUFS": {"golden": -14, "green": -12, "yellow": -9},  
    }

    def get_color(value, metric):
        t = QUALITY_THRESHOLDS[metric]

        # Loudness is reversed logic: closer to -14 is better, louder than -9 is bad
        if metric == "loudness_LUFS":
            if value <= t["golden"]: return "golden"
            elif value <= t["green"]: return "green"
            elif value <= t["yellow"]: return "yellow"
            else: return "red"

        # For bitrate, sample rate, higher is better
        if value >= t["golden"]: return "golden"
        elif value >= t["green"]: return "green"
        elif value >= t["yellow"]: return "yellow"
        else: return "red"

    quality = {}
    for metric, value in metrics.items():
        if metric in QUALITY_THRESHOLDS:
            quality[metric] = get_color(value, metric)

    return quality

def get_lyrics(song_name, artist_name):
    try:
            
        genius = lyricsgenius.Genius()
        #genius.remove_section_headers = True # Remove section headers (e.g. [Chorus]) from lyrics when searching
        #genius.skip_non_songs = True
        
        song = genius.search_song(song_name, artist_name)
        if song and song.lyrics:
            return song.lyrics.strip()
        return None
        
    except Exception as e:
        print(f"Error fetching lyrics: {str(e)}")
        return None
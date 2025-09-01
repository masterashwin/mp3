import librosa
import pyloudnorm as pyln
from mutagen.mp3 import MP3

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
    bitrate = audio.info.bitrate // 1000  # kbps
    sample_rate = audio.info.sample_rate / 1000  # kHz

    return {
        "file": file_path,
        "duration_sec": round(duration, 2),
        "loudness_LUFS": round(loudness_LUFS, 2),
        "bitrate_kbps": bitrate,
        "sample_rate_kHz": sample_rate
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

#if __name__ == "__main__":
 #   file_path = "./Soweto.mp3"
  #  result = analyze_mp3(file_path)
   # print(result)
    #quality = evaluate_quality(result)
    #print(quality)
    #print(result["file"])
from pydub import AudioSegment
import numpy as np
import librosa
import soundfile as sf

# Load Audio File
mp3_path = "./Soweto.mp3"
print (f"File path: {mp3_path}")
audio = AudioSegment.from_mp3(mp3_path)

y, sr = librosa.load(mp3_path, sr=None)

print(f"---------- Loudness (RMS, dBFS) ----------")
# Average loudness
loudness_dbfs = audio.dBFS
print(f"Average Loudness: {loudness_dbfs:.2f} dBFS")

# True Peak level
peak_dbfs = audio.max_dBFS
print(f"Peak Loudness: {peak_dbfs:.2f} dBFS")

# RMS per frame
rms = audio.rms
print(f"RMS: {rms}")

rms2 = librosa.feature.rms(y=y)
print(f"RMS Energy Mean: {np.mean(rms2):.5f}")

print(f"---------- Sample Rate ----------")
print(f"Sample Rate: {sr} Hz ({sr/1000:.1f} kHz)")

print(f"---------- Bit Rate ----------")
bit_rate = audio.frame_rate * audio.frame_width * 8
print(f"Bit Rate: {bit_rate} bps")

print(f"---------- Duration ----------")
print(f"Duration: {audio.duration_seconds:.2f} seconds")
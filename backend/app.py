from flask import Flask, request, jsonify
from werkzeug.utils import secure_filename
from mutagen.mp3 import MP3
from flask_cors import CORS
import os
import audio_utils

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

ALLOWED_EXTENSIONS = {'mp3'}
MAX_FILE_SIZE = 50 * 1024 * 1024  # 50 MB limit

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def is_valid_mp3(file_path):
    """Verify it's actually an MP3 file by reading the header."""
    try:
        audio = MP3(file_path)
        return True
    except Exception:
        return False
    
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Backend API is running"})

#This is old and can be used for testing and future features
@app.route('/api/lyrics', methods=['GET'])
def get_lyrics():
    try:
        lyrics = audio_utils.lyricsUSTL()
        return jsonify({"lyrics": lyrics, "success": True})
    except Exception as e:
        return jsonify({"error": str(e), "success": False}), 500

@app.route('/api/analyse', methods=['POST'])
def analyse():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file part", "success": False}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No selected file", "success": False}), 400
        
        # Sanitize filename
        filename = secure_filename(file.filename)
        # Check extension after sanitizing
        if not filename or '.' not in filename:
            return jsonify({"error": "Invalid filename", "success": False}), 400
            
        ext = filename.rsplit('.', 1)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            return jsonify({"error": "Only MP3 files are allowed", "success": False}), 400  
        
        #Check file size before saving
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        if file_size > MAX_FILE_SIZE:
            return jsonify({"error": "File too large (max 100 MB)", "success": False}), 400
        
        file_path = os.path.join(UPLOAD_FOLDER, filename)
        file.save(file_path)
        
        #Verify it's a valid MP3
        if not is_valid_mp3(file_path):
            os.remove(file_path)
            return jsonify({"error": "File is not a valid MP3", "success": False}), 400
        
        metrics = audio_utils.analyze_mp3(file_path)
        quality = audio_utils.evaluate_quality(metrics)
        
        # Optional lyrics request
        lyrics = None
        song_name = request.form.get('songName', '').strip()
        artist_name = request.form.get('artistName', '').strip()
        
        if song_name and artist_name:
            lyrics = audio_utils.get_lyrics(song_name, artist_name)
        
        os.remove(file_path)
        
        return jsonify({
            "metrics": metrics,
            "quality": quality,
            "lyrics": lyrics,
            "song_info": {
                "song_name": song_name if song_name else None,
                "artist_name": artist_name if artist_name else None
            },
            "success": True
        })
        
    except Exception as e:
        return jsonify({"error": str(e), "success": False}), 500

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8080)
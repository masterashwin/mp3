from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import audio_utils

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "message": "Backend API is running"})

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
        
        if not file.filename.lower().endswith('.mp3'):
            return jsonify({"error": "Only MP3 files are allowed", "success": False}), 400
            
        file_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(file_path)
        
        metrics = audio_utils.analyze_mp3(file_path)
        quality = audio_utils.evaluate_quality(metrics)
        
        # Clean up the uploaded file after analysis
        os.remove(file_path)
        
        return jsonify({
            "metrics": metrics,
            "quality": quality,
            "success": True
        })
        
    except Exception as e:
        return jsonify({"error": str(e), "success": False}), 500

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8080)
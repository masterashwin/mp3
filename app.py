from flask import Flask, request, render_template
import os
from audio_utils import analyze_mp3, evaluate_quality

#By default it looks for templates in a folder named 'templates'
app = Flask(__name__, template_folder='frontend')
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template("index.html")

@app.route('/analyse', methods=['POST'])
def analyse():
    if 'file' not in request.files:
        return "No file part", 400
    file = request.files['file']
    if file.filename == '':
        return "No selected file", 400
    if not file.filename.lower().endswith('.mp3'):
        return "Only MP3 files are allowed", 400
        
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)
    metrics = analyze_mp3(file_path)
    quality = evaluate_quality(metrics)
    print(metrics)
    print(quality)
    return render_template('results.html', metrics=metrics, quality=quality)

if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=8080)
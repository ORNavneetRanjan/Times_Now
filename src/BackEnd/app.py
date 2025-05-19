from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from utils import is_low_value_image

app = Flask(__name__)
CORS(app)  # allow cross-origin requests (Netlify → Flask)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def hello():
    return "Flask server is running!"

@app.route('/upload', methods=['POST'])
def upload_images():
    if 'images' not in request.files:
        return jsonify({"error": "No image files provided"}), 400

    files = request.files.getlist("images")
    results = []

    for file in files:
        filepath = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(filepath)

        label = is_low_value_image(filepath)
        results.append({"filename": file.filename, "label": label})

    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True)

from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
from werkzeug.utils import secure_filename
import os
from flask_cors import CORS
app = Flask(__name__)
CORS(app)  # This allows all origins


UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def measure_haziness(img, threshold=100.0):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    variance = cv2.Laplacian(gray, cv2.CV_64F).var()
    return variance, ("Hazy" if variance < threshold else "Sharp")

def enhance_image(img):
    """Remove haze/blur by histogram-equalization, sharpening, and CLAHE."""
    # 1) Simple global histogram equalization in LAB color space
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    l_eq = cv2.equalizeHist(l)
    lab_eq = cv2.merge((l_eq, a, b))
    img_eq = cv2.cvtColor(lab_eq, cv2.COLOR_LAB2BGR)

    # 2) Sharpen
    kernel = np.array([[0, -1,  0],
                       [-1, 5, -1],
                       [0, -1,  0]])
    img_sharp = cv2.filter2D(img_eq, -1, kernel)

    # 3) CLAHE on L-channel for local contrast
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    lab2 = cv2.cvtColor(img_sharp, cv2.COLOR_BGR2LAB)
    l2, a2, b2 = cv2.split(lab2)
    l2 = clahe.apply(l2)
    final = cv2.cvtColor(cv2.merge((l2, a2, b2)), cv2.COLOR_LAB2BGR)

    return final

def encode_image_to_base64(img):
    """Encode CV2 image (BGR) to Base64 PNG."""
    _, buffer = cv2.imencode('.png', img)
    b64 = base64.b64encode(buffer).decode('utf-8')
    return f"data:image/png;base64,{b64}"

@app.route('/api/check-haziness', methods=['POST'])
def check_haziness():
    if 'image' not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    image_file = request.files['image']
    if image_file.filename == '':
        return jsonify({"error": "Empty filename"}), 400

    filename = secure_filename(image_file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    image_file.save(filepath)

    # Read and measure haziness
    img = cv2.imread(filepath)
    variance, status = measure_haziness(img)

    if status == "Hazy":
        enhanced = enhance_image(img)
    else:
        enhanced = img

    img_b64 = encode_image_to_base64(enhanced)

    return jsonify({
        "status": status,
        "blurriness_score": variance,
        "enhanced_image": img_b64
    })

if __name__ == '__main__':
    app.run(debug=True)

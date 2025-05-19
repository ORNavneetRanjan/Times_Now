import cv2

def is_low_value_image(image_path, blur_threshold=100.0):
    image = cv2.imread(image_path)

    if image is None:
        return "low-value"

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    variance_of_laplacian = cv2.Laplacian(gray, cv2.CV_64F).var()

    if variance_of_laplacian < blur_threshold:
        return "low-value"
    return "useful"

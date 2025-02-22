import pytesseract
from PIL import Image
import sys

# ✅ Explicitly define Tesseract path for Render
pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"

def ocr_image(image_path):
    try:
        image = Image.open(image_path)
        extracted_text = pytesseract.image_to_string(image)
        return extracted_text
    except Exception as e:
        return str(e)

if __name__ == '__main__':
    image_path = sys.argv[1]
    text = ocr_image(image_path)
    print(text)

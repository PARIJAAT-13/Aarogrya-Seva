import os
import re
from typing import Tuple, Dict, Any, Optional
import fitz # PyMuPDF
import pytesseract
from PIL import Image
from langdetect import detect, DetectorFactory

# Set seed for deterministic language detection
DetectorFactory.seed = 0

# Configure Tesseract path if available on Windows
TESSERACT_PATHS = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
    os.path.expandvars(r"%LOCALAPPDATA%\Programs\Tesseract-OCR\tesseract.exe"),
]

for path in TESSERACT_PATHS:
    if os.path.exists(path):
        pytesseract.pytesseract.tesseract_cmd = path
        break

def detect_language_robust(text: str) -> Tuple[str, float]:
    """
    Detects language with script heuristics and fallback to langdetect.
    Returns (language_name, confidence).
    """
    if not text or len(text.strip()) < 3:
        return "English", 0.90

    # Script-based heuristics for Indian languages
    devanagari_chars = len(re.findall(r'[\u0900-\u097F]', text))
    telugu_chars = len(re.findall(r'[\u0C00-\u0C7F]', text))
    latin_chars = len(re.findall(r'[A-Za-z]', text))
    total_letters = devanagari_chars + telugu_chars + latin_chars

    if total_letters > 0:
        if devanagari_chars / total_letters > 0.3:
            return "Hindi", 0.98
        if telugu_chars / total_letters > 0.3:
            return "Telugu", 0.98
        if latin_chars / total_letters > 0.6:
            return "English", 0.96

    try:
        lang_code = detect(text)
        if lang_code == "hi":
            return "Hindi", 0.95
        elif lang_code == "te":
            return "Telugu", 0.95
        elif lang_code in ["en", "es", "fr", "de"]:
            return "English", 0.92
        else:
            return "English", 0.85
    except Exception:
        return "English", 0.80

def clean_extracted_text(raw_text: str) -> str:
    """Cleans OCR artifacts and normalizes linebreaks."""
    if not raw_text:
        return ""
    # Normalize unicode whitespace
    text = raw_text.replace('\r\n', '\n').replace('\r', '\n')
    # Collapse multiple consecutive newlines beyond 2
    text = re.sub(r'\n{3,}', '\n\n', text)
    # Strip trailing whitespace on lines
    lines = [l.strip() for l in text.split('\n')]
    return '\n'.join(lines).strip()

def extract_text_from_file(file_path: str, mime_type: str = "") -> Dict[str, Any]:
    """
    Extracts text from PDF or Image file.
    Supports scanned documents via Tesseract OCR fallback.
    """
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")

    ext = os.path.splitext(file_path)[1].lower().replace('.', '')
    extracted_text = ""
    method = "PyMuPDF Text Stream"
    page_count = 1

    if ext == "pdf" or "pdf" in mime_type:
        doc = fitz.open(file_path)
        page_count = len(doc)
        text_parts = []
        needs_ocr = False

        for page_idx in range(page_count):
            page = doc[page_idx]
            page_text = page.get_text("text").strip()
            if len(page_text) < 20: # Very little or no embedded text -> scanned page
                needs_ocr = True
                try:
                    pix = page.get_pixmap(dpi=200)
                    img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
                    ocr_text = pytesseract.image_to_string(img)
                    text_parts.append(ocr_text.strip())
                except Exception as e:
                    text_parts.append(page_text)
            else:
                text_parts.append(page_text)

        doc.close()
        extracted_text = "\n\n".join([t for t in text_parts if t])
        if needs_ocr:
            method = "PyMuPDF + Tesseract OCR (Hybrid Scanned)"

    elif ext in ["jpg", "jpeg", "png", "bmp", "webp"] or "image" in mime_type:
        method = "Tesseract Optical Character Recognition (OCR)"
        page_count = 1
        try:
            with Image.open(file_path) as img:
                extracted_text = pytesseract.image_to_string(img)
        except Exception as e:
            raise RuntimeError(f"OCR processing failed: {str(e)}")
    else:
        # Fallback raw read for text-based formats
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                extracted_text = f.read()
            method = "Plaintext Reader"
        except Exception as e:
            raise ValueError(f"Unsupported file format: {ext}")

    cleaned = clean_extracted_text(extracted_text)
    detected_lang, conf = detect_language_robust(cleaned)

    return {
        "text": cleaned,
        "page_count": page_count,
        "method": method,
        "detected_language": detected_lang,
        "confidence": conf,
    }

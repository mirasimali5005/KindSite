import os
from flask import Flask, request, render_template, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from PIL import Image
import io
import mimetypes
from dotenv import load_dotenv

# Load .env variables at the very beginning of app.py
load_dotenv()

from config import Config
from utils.gemini_client import GeminiClient
from utils.pdf_utils import create_accessible_pdf, extract_text_from_pdf
from prompts import ACCESSIBILITY_PROMPTS # Import the new prompts dictionary

# Ensure upload and output directories exist
os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)
os.makedirs(Config.OUTPUT_FOLDER, exist_ok=True)

app = Flask(__name__)
app.config.from_object(Config)

print(f"Attempting to initialize GeminiClient with API Key: {'*' * (len(Config.GEMINI_API_KEY) - 5) + Config.GEMINI_API_KEY[-5:] if Config.GEMINI_API_KEY else 'None'}")
gemini_client = GeminiClient(api_key=Config.GEMINI_API_KEY)

@app.route('/')
def index():
    # Pass prompts to the template for the dropdown
    return render_template('index.html', accessibility_prompts=ACCESSIBILITY_PROMPTS)

@app.route('/process', methods=['POST'])
def process_request():
    text_input = request.form.get('text_input', '').strip()
    # Get the selected prompt key from the form
    selected_prompt_key = request.form.get('accessibility_preset', 'default')
    file = request.files.get('file_input')

    if not (text_input or file):
        return jsonify({"error": "Please provide either text input or upload a file."}), 400

    # Retrieve the full prompt template based on the selected key
    # Use .get() with a fallback to 'default' to prevent KeyError
    selected_prompt_info = ACCESSIBILITY_PROMPTS.get(selected_prompt_key, ACCESSIBILITY_PROMPTS['default'])
    accessibility_prompt_template = selected_prompt_info["prompt_template"]

    # The actual prompt for Gemini will incorporate the text content
    # We will format this inside the GeminiClient calls, or here before passing.
    # For now, we'll keep the text_content formatting inside gemini_client as it's flexible.
    # But for a fully customized prompt, we can format it here.

    processed_content = None
    pdf_output_path = None
    original_title = "Accessibility Document"
    accessibility_notes_for_pdf = selected_prompt_info["display_name"] # Use the display name for PDF notes

    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        mime_type, _ = mimetypes.guess_type(file_path)

        if mime_type and mime_type.startswith('image'):
            try:
                img = Image.open(file_path)
                # For images, we instruct Gemini to first describe the image,
                # then apply the selected accessibility transformation to that description.
                # The prompt combines the accessibility_prompt_template with instructions for image description.
                combined_image_prompt = f"First, describe the content of this image in detail. Then, apply the following accessibility transformation to your description:\n\n{accessibility_prompt_template.format(text_content='[Image Description]')}"
                processed_content = gemini_client.generate_image_description(combined_image_prompt, img)
                original_title = f"Accessible Image Content: {filename}"
            except Exception as e:
                print(f"Error processing image file: {e}")
                os.remove(file_path)
                return jsonify({"error": f"Failed to process image: {e}"}), 500
        elif mime_type == 'application/pdf':
            try:
                pdf_text = extract_text_from_pdf(file_path)
                if pdf_text:
                    # Format the prompt template with the extracted PDF text
                    formatted_prompt = accessibility_prompt_template.format(text_content=pdf_text)
                    processed_content = gemini_client.summarize_pdf_content(formatted_prompt, pdf_text)
                    original_title = f"Accessible PDF Content: {filename}"
                else:
                    os.remove(file_path)
                    return jsonify({"error": "Could not extract text from the provided PDF."}), 400
            except Exception as e:
                print(f"Error processing PDF file: {e}")
                os.remove(file_path)
                return jsonify({"error": f"Failed to process PDF: {e}"}), 500
        elif mime_type and mime_type.startswith('text'):
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    text_content_from_file = f.read()
                # Format the prompt template with the extracted text content
                formatted_prompt = accessibility_prompt_template.format(text_content=text_content_from_file)
                processed_content = gemini_client.generate_text_response(formatted_prompt, text_content_from_file)
                original_title = f"Accessible Text File Content: {filename}"
            except Exception as e:
                print(f"Error processing text file: {e}")
                os.remove(file_path)
                return jsonify({"error": f"Failed to process text file: {e}"}), 500
        else:
            os.remove(file_path)
            return jsonify({"error": "Unsupported file type. Please upload an image (jpg, png) or a PDF."}), 400
        
        if os.path.exists(file_path):
            os.remove(file_path)

    elif text_input:
        # Format the prompt template with the direct text input
        formatted_prompt = accessibility_prompt_template.format(text_content=text_input)
        processed_content = gemini_client.generate_text_response(formatted_prompt, text_input)
        original_title = "Accessible Text Input"

    if processed_content is None:
        return jsonify({"error": "Failed to generate accessible content from Gemini. Please check server logs for details, verify your API key, or refine your prompt."}), 500

    try:
        pdf_filename = f"accessible_{original_title.replace(' ', '_').lower()}.pdf"
        pdf_output_path = os.path.join(app.config['OUTPUT_FOLDER'], pdf_filename)
        # Pass the display name of the selected accessibility type to the PDF
        create_accessible_pdf(pdf_output_path, original_title, processed_content, accessibility_notes=f"Processed for: {accessibility_notes_for_pdf}")
        pdf_url = f"/downloads/{pdf_filename}"
    except Exception as e:
        print(f"Error creating PDF: {e}")
        pdf_url = None

    return jsonify({
        "modified_content": processed_content,
        "pdf_url": pdf_url
    })

@app.route('/downloads/<filename>')
def download_file(filename):
    return send_from_directory(app.config['OUTPUT_FOLDER'], filename, as_attachment=True)

if __name__ == '__main__':
    if not Config.GEMINI_API_KEY:
        print("CRITICAL ERROR: GEMINI_API_KEY is not set. Please ensure you have a .env file with GEMINI_API_KEY='YOUR_KEY'.")
    app.run(debug=True)
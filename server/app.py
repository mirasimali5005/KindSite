# # import os
# # import uuid
# # from flask import Flask, request, jsonify
# # from flask_cors import CORS
# # from dotenv import load_dotenv
# # from pydantic import BaseModel, ValidationError, field_validator
# # from typing import List, Optional
# # from playwright.sync_api import sync_playwright, Error as PlaywrightError
# # from utils import clamp_text, clamp_images, sanitize_html, extract_pdf_text

# # # --- Import project modules ---
# # # Ensure these files exist and are correctly structured
# # from utils import clamp_text, clamp_images, sanitize_html
# # from prompts import build_multimodal_prompt, build_cu_prompt # Added build_cu_prompt
# # # Added call_gemini_cu and potentially a specific model ID constant
# # from gemini_client import call_gemini_multimodal, call_gemini_cu, GeminiError

# # load_dotenv() # Load variables from .env file

# # app = Flask(__name__)
# # # Allow all origins for the hackathon for simplicity
# # CORS(app, resources={r"/*": {"origins": "*"}})

# # # --- Pydantic Models for Input/Output Validation ---

# # class AdaptPageIn(BaseModel):
# #     profile: str = "ADHD"
# #     page_text: str = ""
# #     image_urls: List[str] = []
# #     origin: Optional[str] = None
# #     dom_hints: Optional[list] = None # reserved for future use

# #     @field_validator("profile")
# #     @classmethod
# #     def check_profile(cls, v: str) -> str:
# #         v = (v or "ADHD").upper()
# #         if v not in {"ADHD", "DYSLEXIA"}:
# #             v = "ADHD"
# #         return v

# # class AdaptPageOut(BaseModel):
# #     final_html: str

# # class GetActionsIn(BaseModel):
# #     page_url: str

# # # --- API Endpoints ---

# # @app.post("/adapt-page")
# # def adapt_page_endpoint():
# #     """
# #     Receives text/images from the frontend.
# #     Uses Gemini 1.5 Pro to generate accessible HTML.
# #     """
# #     print("LOG: /adapt-page endpoint called.")
# #     try:
# #         # Validate incoming JSON against the Pydantic model
# #         data = AdaptPageIn(**(request.get_json(force=True) or {}))
# #     except ValidationError as e:
# #         print(f"ERROR: Invalid input for /adapt-page: {e.errors()}")
# #         return jsonify({"error": "invalid_input", "detail": e.errors()}), 400
# #     except Exception as e:
# #          print(f"ERROR: Could not parse input JSON for /adapt-page: {e}")
# #          return jsonify({"error": "invalid_input", "detail": "Malformed JSON"}), 400

# #     # Trim input data for latency and safety
# #     text = clamp_text(data.page_text or "")
# #     images = clamp_images(data.image_urls)
# #     print(f"LOG: Processing {len(text)} chars, {len(images)} images for profile {data.profile}")

# #     # Build the prompt payload for the multimodal model
# #     payload = build_multimodal_prompt(
# #         origin=data.origin or "",
# #         profile=data.profile,
# #         page_text=text,
# #         image_urls=images
# #     )

# #     try:
# #         # Call the Gemini 1.5 Pro model via the client function
# #         raw_html = call_gemini_multimodal(payload)
# #         print("LOG: Successfully received HTML from G1.5 Pro.")
# #     except GeminiError as e:
# #         print(f"ERROR: Gemini 1.5 Pro call failed: {e}")
# #         # Provide a user-friendly error message in HTML format
# #         raw_html = (
# #             "<div><h2>Error</h2>"
# #             "<p>Could not generate adapted content due to an AI backend issue.</p>"
# #             f"<p><small>Details: {e}</small></p></div>"
# #         )
# #     except Exception as e:
# #         # Catch unexpected errors during the AI call
# #         print(f"ERROR: Unexpected error during G1.5 Pro call: {e}")
# #         return jsonify({"error": "internal_server_error", "detail": str(e)}), 500

# #     # Sanitize the HTML received from the AI before sending it back
# #     safe_html = sanitize_html(raw_html)
# #     # Return the validated output
# #     return jsonify(AdaptPageOut(final_html=safe_html).model_dump())


# # @app.post("/get-actions")
# # def get_actions_endpoint():
# #     """
# #     Receives a URL from the frontend.
# #     Takes a screenshot using Playwright.
# #     Uses Gemini 2.5 CU to find actions (e.g., clicks).
# #     Returns a list of actions for the frontend to execute.
# #     """
# #     print("LOG: /get-actions endpoint called.")
# #     try:
# #         # Validate input using Pydantic model
# #         data = GetActionsIn(**(request.get_json(force=True) or {}))
# #         url = data.page_url
# #     except ValidationError as e:
# #         print(f"ERROR: Invalid input for /get-actions: {e.errors()}")
# #         return jsonify({"error": "invalid_input", "detail": e.errors()}), 400
# #     except Exception as e:
# #          print(f"ERROR: Could not parse input JSON for /get-actions: {e}")
# #          return jsonify({"error": "invalid_input", "detail": "Malformed JSON"}), 400

# #     if not url:
# #         # This check is technically redundant due to Pydantic, but good practice
# #         print("ERROR: No page_url provided in request.")
# #         return jsonify({"error": "invalid_input", "detail": "page_url is required"}), 400

# #     # --- Screenshot Logic ---
# #     # Generate a unique filename for the screenshot
# #     screenshot_filename = f"screenshot_{uuid.uuid4()}.png"
# #     # Save screenshot in the same directory as app.py for simplicity
# #     screenshot_path = os.path.join(os.getcwd(), screenshot_filename)

# #     print(f"LOG: Attempting to screenshot URL: {url}")
# #     try:
# #         with sync_playwright() as p:
# #             browser = p.chromium.launch()
# #             page = browser.new_page()
# #             # Set a common viewport size; G2.5CU might perform better
# #             page.set_viewport_size({"width": 1440, "height": 900})
# #              # Increased timeout for potentially slow pages
# #             page.goto(url, wait_until="networkidle", timeout=25000)
# #             page.screenshot(path=screenshot_path, full_page=True)
# #             browser.close()
# #         print(f"LOG: Screenshot successful for {url}, saved to {screenshot_path}")

# #         # --- Call Gemini 2.5 Computer Use ---
# #         prompt = build_cu_prompt() # Get the standard CU prompt from prompts.py

# #         try:
# #             # Call the G2.5CU model via the client function
# #             actions_list = call_gemini_cu(prompt, screenshot_path)
# #             print(f"LOG: Received actions from call_gemini_cu: {actions_list}")
# #             # Ensure the result is always a list
# #             if not isinstance(actions_list, list):
# #                  print(f"WARN: call_gemini_cu did not return a list. Received: {type(actions_list)}. Returning empty list.")
# #                  actions_list = []

# #         except GeminiError as e:
# #             print(f"ERROR: Gemini 2.5 CU call failed: {e}")
# #             actions_list = [] # Return empty list on AI failure
# #         except Exception as e:
# #             # Catch unexpected errors during the AI call
# #             print(f"ERROR: Unexpected error during call_gemini_cu: {e}")
# #             return jsonify({"error": "internal_server_error", "detail": str(e)}), 500

# #         # Return the list of actions (even if empty)
# #         return jsonify(actions_list)

# #     except PlaywrightError as e:
# #         # Handle errors during browser automation/screenshot
# #         print(f"ERROR: Playwright failed for URL {url}: {e}")
# #         return jsonify({"error": "screenshot_failed", "detail": str(e)}), 500
# #     except Exception as e:
# #         # Catch any other unexpected errors during screenshotting
# #         print(f"ERROR: Unexpected error during screenshot process: {e}")
# #         return jsonify({"error": "internal_server_error", "detail": str(e)}), 500
# #     finally:
# #         # --- Cleanup Screenshot File ---
# #         if os.path.exists(screenshot_path):
# #             try:
# #                 os.remove(screenshot_path)
# #                 print(f"LOG: Cleaned up screenshot: {screenshot_path}")
# #             except OSError as e:
# #                 # Log warning but don't fail the request if cleanup fails
# #                 print(f"WARN: Could not remove screenshot file {screenshot_path}: {e}")


# # @app.get("/healthz")
# # def healthz():
# #     """Basic health check endpoint."""
# #     return jsonify({"ok": True})


# # if __name__ == "__main__":
# #     # Load server config from environment variables using defaults from your .env
# #     host = os.getenv("HOST", "0.0.0.0")
# #     port = int(os.getenv("PORT", 5001))
# #     debug = os.getenv("DEBUG", "True").lower() == "true" # Default to True based on .env
# #     print(f" * Starting Flask server on {host}:{port} (Debug: {debug})")
# #     # Use debug=debug variable
# #     app.run(host=host, port=port, debug=debug)



# import os
# import uuid
# from typing import List, Optional

# from flask import Flask, request, jsonify
# from flask_cors import CORS
# from dotenv import load_dotenv
# from pydantic import BaseModel, ValidationError, field_validator
# from playwright.sync_api import sync_playwright, Error as PlaywrightError

# from utils import clamp_text, clamp_images, sanitize_html, extract_pdf_text
# from prompts import build_multimodal_prompt, build_cu_prompt  # CU prompt kept but not used now
# from gemini_client import call_gemini_multimodal, GeminiError

# load_dotenv()

# app = Flask(__name__)
# CORS(app, resources={r"/*": {"origins": "*"}})

# class AdaptPageIn(BaseModel):
#     profile: str = "ADHD"
#     page_text: str = ""
#     image_urls: List[str] = []
#     origin: Optional[str] = None
#     pdf_url: Optional[str] = None
#     dom_hints: Optional[list] = None

#     @field_validator("profile")
#     @classmethod
#     def check_profile(cls, v: str) -> str:
#         v = (v or "ADHD").upper()
#         if v not in {"ADHD", "DYSLEXIA"}:
#             v = "ADHD"
#         return v

# class AdaptPageOut(BaseModel):
#     final_html: str

# class GetActionsIn(BaseModel):
#     page_url: str

# # @app.post("/adapt-page")
# # def adapt_page_endpoint():
# #     print("LOG: /adapt-page endpoint called.")
# #     try:
# #         data = AdaptPageIn(**(request.get_json(force=True) or {}))
# #     except ValidationError as e:
# #         return jsonify({"error": "invalid_input", "detail": e.errors()}), 400
# #     except Exception:
# #         return jsonify({"error": "invalid_input", "detail": "Malformed JSON"}), 400

# #     # Choose source: PDF wins if present
# #     if data.pdf_url:
# #         text = extract_pdf_text(data.pdf_url)
# #         images = []
# #         origin = data.pdf_url
# #     else:
# #         text = clamp_text(data.page_text or "")
# #         images = clamp_images(data.image_urls)
# #         origin = data.origin or ""

# #     print(f"LOG: Processing {len(text)} chars, {len(images)} images for profile {data.profile}")

# #     payload = build_multimodal_prompt(
# #         origin=origin,
# #         profile=data.profile,
# #         page_text=text,
# #         image_urls=images
# #     )

# #     try:
# #         raw_html = call_gemini_multimodal(payload)
# #     except GeminiError as e:
# #         raw_html = (
# #             "<div><h2>Error</h2>"
# #             "<p>Could not generate adapted content due to an AI backend issue.</p>"
# #             f"<p><small>Details: {e}</small></p></div>"
# #         )
# #     except Exception as e:
# #         return jsonify({"error": "internal_server_error", "detail": str(e)}), 500

# #     safe_html = sanitize_html(raw_html)
# #     return jsonify(AdaptPageOut(final_html=safe_html).model_dump())

# @app.post("/adapt-page")
# def adapt_page_endpoint():
#     """
#     Simplified endpoint: takes a prompt and returns Gemini 1.5 answer HTML.
#     """
#     data = request.get_json(force=True)
#     prompt = data.get("prompt", "")
#     if not prompt:
#         return jsonify({"error": "missing_prompt"}), 400

#     from gemini_client import call_gemini_multimodal, GeminiError
#     payload = {
#         "system": "You are a helpful AI assistant that answers user questions clearly.",
#         "user": prompt,
#         "images": []
#     }

#     try:
#         answer = call_gemini_multimodal(payload)
#     except GeminiError as e:
#         answer = f"<p>Error calling Gemini: {e}</p>"

#     return jsonify({"final_html": answer})


# @app.get("/healthz")
# def healthz():
#     return jsonify({"ok": True})

# if __name__ == "__main__":
#     host = os.getenv("HOST", "0.0.0.0")
#     port = int(os.getenv("PORT", 5001))
#     debug = os.getenv("DEBUG", "True").lower() == "true"
#     print(f" * Starting Flask server on {host}:{port} (Debug: {debug})")
#     app.run(host=host, port=port, debug=debug)


import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import requests

load_dotenv(override=True)

API_KEY = os.getenv("GEMINI_API_KEY")
MODEL   = os.getenv("MODEL_MULTIMODAL", "gemini-2.0-flash")
ENDPOINT = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent"

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

def call_gemini_rest(prompt: str) -> str:
    if not API_KEY:
        return "<p>Error: GEMINI_API_KEY not set</p>"

    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    headers = {"Content-Type": "application/json", "X-goog-api-key": API_KEY}

    r = requests.post(ENDPOINT, headers=headers, json=payload, timeout=45)
    if r.status_code != 200:
        return f"<p>Gemini error {r.status_code}: {r.text}</p>"

    data = r.json()
    try:
        return data["candidates"][0]["content"]["parts"][0]["text"]
    except Exception:
        return f"<p>Unexpected response: {data}</p>"

@app.post("/adapt-page")
def adapt_page():
    body = request.get_json(force=True) or {}
    prompt = (body.get("prompt") or "").strip()
    if not prompt:
        return jsonify({"error": "missing_prompt", "detail": "Provide 'prompt'"}), 400
    html = call_gemini_rest(prompt)
    return jsonify({"final_html": html})

@app.get("/healthz")
def healthz():
    return jsonify({"ok": True, "model": MODEL})

if __name__ == "__main__":
    app.run(
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 5001)),
        debug=os.getenv("DEBUG", "True").lower() == "true",
    )

import os
import json
import requests

API_KEY = os.getenv("GEMINI_API_KEY", "")
MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-pro")
TIMEOUT = int(os.getenv("REQUEST_TIMEOUT_SEC", "30"))

# NOTE:
# Replace the endpoint/format below with the official Gemini SDK or REST format you're using.
# This is a stub showing how you'd structure the call and return.

class GeminiError(Exception): pass

def call_gemini_multimodal(prompt_payload: dict) -> str:
    """
    Stub call: Replace with actual Gemini 1.5 Pro multimodal request.
    Expected return: raw HTML string (the adapted fragment).
    """
    if not API_KEY:
        # For local dev without keys, return a placeholder
        return (
            "<div>"
            "<h2>Summary</h2>"
            "<ul><li>Placeholder output (no GEMINI_API_KEY set)</li></ul>"
            "<h3>Main Points</h3>"
            "<ul><li>Bullet 1</li><li>Bullet 2</li></ul>"
            "</div>"
        )

    try:
        resp = requests.post(
            f"https://generativeai.googleapis.com/v1beta/models/{MODEL}:generateContent",
            headers={"Content-Type": "application/json", "x-goog-api-key": API_KEY},
            data=json.dumps({
                "contents": [
                    {"role":"system","parts":[{"text": prompt_payload["system"]}]},
                    {"role":"user","parts":[
                        {"text": prompt_payload["user"]}
                        # If using images via URLs, adapt to the correct API format here.
                    ]}
                ]
            }),
            timeout=TIMEOUT
        )
        resp.raise_for_status()
        data = resp.json()
        html = (
            data.get("candidates",[{}])[0]
                .get("content",{})
                .get("parts",[{}])[0]
                .get("text","")
        )
        return html or "<div><p>(Empty model response)</p></div>"
    except Exception as e:
        raise GeminiError(str(e))

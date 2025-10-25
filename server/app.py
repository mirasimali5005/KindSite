import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from pydantic import BaseModel, ValidationError, field_validator
from typing import List, Optional

from utils import clamp_text, clamp_images, sanitize_html
from prompts import build_multimodal_prompt
from gemini_client import call_gemini_multimodal, GeminiError

load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

class AdaptPageIn(BaseModel):
    profile: str = "ADHD"
    page_text: str
    image_urls: List[str] = []
    origin: Optional[str] = None
    dom_hints: Optional[list] = None  # reserved for future use

    @field_validator("profile")
    @classmethod
    def check_profile(cls, v: str) -> str:
        v = (v or "ADHD").upper()
        if v not in {"ADHD", "DYSLEXIA"}:
            v = "ADHD"
        return v

class AdaptPageOut(BaseModel):
    final_html: str

@app.post("/adapt-page")
def adapt_page():
    try:
        data = AdaptPageIn(**(request.get_json(force=True) or {}))
    except ValidationError as e:
        return jsonify({"error": "invalid_input", "detail": e.errors()}), 400

    # Trim for latency
    text = clamp_text(data.page_text or "")
    images = clamp_images(data.image_urls)

    # Build prompt and call model
    payload = build_multimodal_prompt(
        origin=data.origin or "",
        profile=data.profile,
        page_text=text,
        image_urls=images
    )

    try:
        raw_html = call_gemini_multimodal(payload)
    except GeminiError:
        raw_html = (
            "<div><h2>Summary</h2>"
            "<p>We adapted available text, but the AI backend had an issue.</p></div>"
        )

    safe_html = sanitize_html(raw_html)
    return jsonify(AdaptPageOut(final_html=safe_html).model_dump())

@app.post("/cu-expand")
def cu_expand():
    """
    Person C (Computer Use) will replace this stub to call Gemini 2.5 CU
    and return a small list of safe actions for the front-end to execute.
    """
    return jsonify([
        {"type": "CLICK", "textContains": "Read more"},
        {"type": "WAIT", "ms": 400},
        {"type": "CLICK", "textContains": "Accept all"}
    ])

@app.get("/healthz")
def healthz():
    return jsonify({"ok": True})


@app.get("get-actions", methods=["GET"])
def get_actions():
    pass

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "5000"))
    debug = os.getenv("DEBUG", "false").lower() == "true"
    app.run(host=host, port=port, debug=debug)

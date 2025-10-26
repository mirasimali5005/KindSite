from flask import Flask, request, jsonify
from dotenv import load_dotenv
import os
import google.generativeai as genai
from prompts import build_multimodal_prompt

print("=== Starting Flask App ===")

# Step 1: Load environment variables
load_dotenv()
print("Loaded .env file")

# Step 2: Get API key
api_key = os.getenv("GEMINI_API_KEY")
print(f"GEMINI_API_KEY found: {bool(api_key)}")

if not api_key:
    raise RuntimeError("GEMINI_API_KEY missing. Create a .env with GEMINI_API_KEY=...")

# Step 3: Configure Google Generative AI
try:
    genai.configure(api_key=api_key)
    print("Configured Google Generative AI client")
except Exception as e:
    print(f"ERROR configuring genai: {e}")
    raise

# Step 4: Load model (without system instruction - we'll pass it per request)
try:
    model = genai.GenerativeModel("gemini-2.0-flash")
    print("Model initialized successfully")
except Exception as e:
    print(f"ERROR initializing model: {e}")
    raise

app = Flask(__name__)

@app.route("/generate", methods=["POST"])
def generate():
    print("=== /generate endpoint called ===")
    try:
        data = request.get_json(silent=True) or {}
        print("Request JSON:", data)

        profile = data.get("profile", "ADHD")
        text = data.get("text", "")
        origin = data.get("origin", "")

        print(f"profile={profile}, origin={origin}")
        if not isinstance(text, str) or not text.strip():
            print("Error: invalid 'text'")
            return jsonify({"error": "Missing or invalid 'text'", "success": False}), 400

        # Build the multimodal prompt
        prompt_dict = build_multimodal_prompt(profile, text, origin)
        print("Prompt built successfully")

        # Create a model instance with system instruction for this request
        model_with_system = genai.GenerativeModel(
            "gemini-2.0-flash",
            system_instruction=prompt_dict["system"]
        )
        
        # Call the model with just the user prompt
        resp = model_with_system.generate_content(prompt_dict["user"])
        print("Gemini response received")

        return jsonify({"html": resp.text or "", "success": True}), 200
        
    except Exception as e:
        print("ERROR inside /generate:", e)
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e), "success": False}), 500

@app.route("/generate-simple", methods=["POST"])
def generate_simple():
    print("=== /generate-simple endpoint called ===")
    try:
        data = request.get_json(silent=True) or {}
        print("Request JSON:", data)

        p = data.get("prompt", "")
        if not isinstance(p, str) or not p.strip():
            print("Error: invalid 'prompt'")
            return jsonify({"error": "Missing or invalid 'prompt'", "success": False}), 400

        resp = model.generate_content(p)
        print("Gemini simple response received")

        return jsonify({"answer": resp.text or "", "success": True}), 200
        
    except Exception as e:
        print("ERROR inside /generate-simple:", e)
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e), "success": False}), 500

@app.route("/health", methods=["GET"])
def health():
    print("=== /health endpoint called ===")
    return jsonify({"status": "healthy", "model": "gemini-2.0-flash"}), 200

if __name__ == "__main__":
    print("=== Running app on port 5001 ===")
    app.run(debug=True, host="0.0.0.0", port=5001)
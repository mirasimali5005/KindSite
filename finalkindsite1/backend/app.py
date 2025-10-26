# from flask import Flask, request, jsonify, Response
# from flask_cors import CORS
# from supabase import create_client, Client
# import os
# from openai import OpenAI
# import json
# from datetime import datetime
# import uuid
# import requests
# from pathlib import Path

# app = Flask(__name__)
# CORS(app, origins=["http://localhost:3000", "http://localhost:5173"], supports_credentials=True)

# # ================== SUPABASE & OPENAI ==================

# # Global Supabase client (used only for auth.get_user)
# SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
# SUPABASE_ANON_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
# supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

# # ADDED: helper to build a per-request client authenticated with the user's JWT (RLS)
# def user_client(jwt: str) -> Client:
#     client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
#     client.postgrest.auth(jwt)
#     return client

# # Initialize OpenAI client
# openai_client = OpenAI()

# # ================== AUTH HELPERS ==================

# def get_user_from_token(auth_header):
#     """Extract and verify user from Authorization header using Supabase Auth."""
#     if not auth_header or not auth_header.startswith('Bearer '):
#         return None, None
#     token = auth_header.split(' ', 1)[1]
#     try:
#         user = supabase.auth.get_user(token)
#         return (user.user if user else None), token
#     except Exception as e:
#         print(f"Auth error: {e}")
#         return None, None

# @app.route('/api/health', methods=['GET'])
# def health_check():
#     return jsonify({"status": "healthy", "service": "accessibility-api"})

# # ================== AUTH ENDPOINTS (unchanged) ==================

# @app.route('/api/auth/signup', methods=['POST'])
# def signup():
#     data = request.json
#     email = data.get('email')
#     password = data.get('password')
#     redirect_url = data.get('redirect_url', 'http://localhost:3000/preferences')

#     try:
#         response = supabase.auth.sign_up({
#             "email": email,
#             "password": password,
#             "options": {
#                 "email_redirect_to": redirect_url
#             }
#         })

#         return jsonify({
#             "success": True,
#             "user": response.user.model_dump() if response.user else None,
#             "session": response.session.model_dump() if response.session else None
#         })
#     except Exception as e:
#         return jsonify({"success": False, "error": str(e)}), 400

# @app.route('/api/auth/login', methods=['POST'])
# def login():
#     data = request.json
#     email = data.get('email')
#     password = data.get('password')

#     try:
#         response = supabase.auth.sign_in_with_password({
#             "email": email,
#             "password": password
#         })

#         return jsonify({
#             "success": True,
#             "user": response.user.model_dump() if response.user else None,
#             "session": response.session.model_dump() if response.session else None
#         })
#     except Exception as e:
#         return jsonify({"success": False, "error": str(e)}), 400

# @app.route('/api/auth/logout', methods=['POST'])
# def logout():
#     auth_header = request.headers.get('Authorization')
#     user, _ = get_user_from_token(auth_header)
#     if not user:
#         return jsonify({"success": False, "error": "Unauthorized"}), 401
#     try:
#         supabase.auth.sign_out()
#         return jsonify({"success": True})
#     except Exception as e:
#         return jsonify({"success": False, "error": str(e)}), 400

# @app.route('/api/auth/user', methods=['GET'])
# def get_current_user():
#     auth_header = request.headers.get('Authorization')
#     user, _ = get_user_from_token(auth_header)
#     if not user:
#         return jsonify({"success": False, "error": "Unauthorized"}), 401
#     return jsonify({
#         "success": True,
#         "user": {
#             "id": user.id,
#             "email": user.email,
#             "created_at": user.created_at
#         }
#     })

# # ================== PREFERENCES ENDPOINTS (switched to user_client) ==================

# @app.route('/api/preferences', methods=['GET'])
# def get_preferences():
#     auth_header = request.headers.get('Authorization')
#     user, token = get_user_from_token(auth_header)
#     if not user:
#         return jsonify({"success": False, "error": "Unauthorized"}), 401

#     db = user_client(token)  # CHANGED: use per-user client so RLS works
#     try:
#         response = db.table('user_preferences').select('*').eq('id', user.id).single().execute()
#         return jsonify({"success": True, "preferences": response.data})
#     except Exception:
#         return jsonify({"success": True, "preferences": None})

# @app.route('/api/preferences', methods=['POST'])
# def save_preferences():
#     auth_header = request.headers.get('Authorization')
#     user, token = get_user_from_token(auth_header)
#     if not user:
#         return jsonify({"success": False, "error": "Unauthorized"}), 401

#     db = user_client(token)  # CHANGED
#     data = request.json
#     preferences = {
#         "id": user.id,
#         "dyslexia": data.get('dyslexia', False),
#         "cognitive_impairment": data.get('cognitive_impairment', False),
#         "visual_impairment": data.get('visual_impairment', False),
#         "adhd": data.get('adhd', False),
#         "esl_simple_english": data.get('esl_simple_english', False),
#     }

#     try:
#         response = db.table('user_preferences').upsert(preferences).execute()
#         return jsonify({"success": True, "preferences": response.data[0] if response.data else None})
#     except Exception as e:
#         return jsonify({"success": False, "error": str(e)}), 400

# # ================== CONVERSATION ENDPOINTS (NEW) ==================

# @app.get('/api/conversations')
# def list_conversations():
#     auth_header = request.headers.get('Authorization')
#     user, token = get_user_from_token(auth_header)
#     if not user:
#         return jsonify({"success": False, "error": "Unauthorized"}), 401

#     db = user_client(token)
#     resp = db.table('chat_conversations') \
#              .select('id,title,created_at,updated_at') \
#              .eq('user_id', user.id) \
#              .order('updated_at', desc=True) \
#              .execute()
#     return jsonify({"success": True, "conversations": resp.data})

# @app.post('/api/conversations')
# def create_conversation():
#     auth_header = request.headers.get('Authorization')
#     user, token = get_user_from_token(auth_header)
#     if not user:
#         return jsonify({"success": False, "error": "Unauthorized"}), 401

#     db = user_client(token)
#     title = (request.json or {}).get('title') or 'New conversation'
#     resp = db.table('chat_conversations') \
#              .insert({"user_id": user.id, "title": title}) \
#              .select('id,title,created_at,updated_at') \
#              .single() \
#              .execute()
#     return jsonify({"success": True, "conversation": resp.data}), 201

# @app.get('/api/conversations/<cid>/messages')
# def list_messages(cid):
#     auth_header = request.headers.get('Authorization')
#     user, token = get_user_from_token(auth_header)
#     if not user:
#         return jsonify({"success": False, "error": "Unauthorized"}), 401

#     db = user_client(token)
#     # ownership check
#     conv = db.table('chat_conversations').select('id').eq('id', cid).eq('user_id', user.id).single().execute()
#     if not conv.data:
#         return jsonify({"success": False, "error": "Not found"}), 404

#     msgs = db.table('chat_messages') \
#              .select('id,role,content,created_at') \
#              .eq('conversation_id', cid) \
#              .order('created_at', desc=False) \
#              .execute()
#     return jsonify({"success": True, "messages": msgs.data})

# # ================== CHAT ENDPOINT (CHANGED: conversationId support) ==================

# @app.route('/api/chat', methods=['POST'])
# def chat():
#     """Chat endpoint with streaming support, pinned to a conversation"""
#     auth_header = request.headers.get('Authorization')
#     user, token = get_user_from_token(auth_header)
#     if not user:
#         return jsonify({"success": False, "error": "Unauthorized"}), 401

#     db = user_client(token)  # CHANGED: RLS-aware client

#     data = request.json
#     messages = data.get('messages', [])
#     website_data = data.get('websiteData')
#     conversation_id = data.get('conversationId')           # NEW
#     session_id = data.get('sessionId', str(uuid.uuid4()))  # legacy / optional

#     # Get user preferences
#     try:
#         prefs_response = db.table('user_preferences').select('*').eq('id', user.id).single().execute()
#         preferences = prefs_response.data if prefs_response.data else {}
#     except Exception:
#         preferences = {}

#     # Build user instructions from preferences
#     user_instructions = "User's accessibility preferences:\n"
#     if preferences.get('dyslexia'):
#         user_instructions += "- Has dyslexia (e.g., dyslexia). Use clear, simple language with short sentences and paragraphs.\n"
#     if preferences.get('adhd'):
#         user_instructions += "- Prefers larger text. When providing formatted content, emphasize readability.\n"
#     if preferences.get('cognitive_impairment'):
#         user_instructions += "- Sensitive to motion. Avoid suggesting animated or moving content.\n"
#     if preferences.get('esl_simple_english'):
#         user_instructions += "- Prefers reduced motion in interfaces.\n"
#     if preferences.get('visual_impairment'):
#         user_instructions += "- Sensitive to bright colors. Suggest softer, more comfortable color palettes.\n"
#     # Build system prompt
#     system_prompt = f"""You are an accessibility assistant that helps convert inaccessible content (PDFs, images, documents, websites) into more accessible formats.

# {user_instructions}
# """
#     if website_data:
#         system_prompt += f"\nWebsite data to analyze:\nURL: {website_data.get('url', 'N/A')}\nTitle: {website_data.get('title', 'N/A')}\nContent: {website_data.get('content', 'N/A')}\n"

#     system_prompt += """\nWhen the user uploads a document, image, or website:
# 1. Analyze the content for accessibility issues
# 2. Provide a clear, accessible version of the content
# 3. Explain what changes you made and why
# 4. Offer suggestions for further improvements

# Be helpful, supportive, and focus on making content truly accessible for this user's specific needs."""

#     # Ensure conversation exists (create from first user message if not provided)
#     if not conversation_id:
#         last_user_text = ""
#         if messages and messages[-1].get('role') == 'user':
#             last_user_text = messages[-1].get('content', '') or ""
#         title = (" ".join(last_user_text.split()[:6]) or "New conversation")
#         conv = db.table('chat_conversations').insert({"user_id": user.id, "title": title}).select('id').single().execute()
#         conversation_id = conv.data['id']

#     # Save user message to database (under conversation)
#     if messages and messages[-1].get('role') == 'user':
#         last_message = messages[-1]
#         user_content = last_message.get('content', '')
#         attachments = last_message.get('experimental_attachments')
#         try:
#             db.table('chat_messages').insert({
#                 "user_id": user.id,
#                 "conversation_id": conversation_id,   # CHANGED
#                 "role": "user",
#                 "content": user_content,
#                 "user_instructions": user_instructions,
#                 "website_data": website_data,
#                 "session_id": session_id,
#                 "attachments": attachments
#             }).execute()
#             # bump conversation updated_at
#             db.table('chat_conversations').update({"updated_at": datetime.utcnow().isoformat()})\
#               .eq('id', conversation_id).execute()
#         except Exception as e:
#             print(f"Error saving user message: {e}")

#     # Convert messages to OpenAI format
#     openai_messages = [{"role": "system", "content": system_prompt}]
#     for msg in messages:
#         role = msg.get('role')
#         content = msg.get('content', '')
#         if role in ['user', 'assistant']:
#             openai_messages.append({"role": role, "content": content})

#     # Stream response from OpenAI
#     def generate():
#         try:
#             stream = openai_client.chat.completions.create(
#                 model="gpt-4o-mini",
#                 messages=openai_messages,
#                 stream=True,
#                 max_tokens=2000
#             )

#             full_response = ""

#             for chunk in stream:
#                 if chunk.choices[0].delta.content:
#                     content = chunk.choices[0].delta.content
#                     full_response += content
#                     yield f"data: {json.dumps({'type': 'text', 'content': content})}\n\n"

#             # Save assistant message to database (under conversation)
#             try:
#                 db.table('chat_messages').insert({
#                     "user_id": user.id,
#                     "conversation_id": conversation_id,  # CHANGED
#                     "role": "assistant",
#                     "content": full_response,
#                     "user_instructions": user_instructions,
#                     "website_data": website_data,
#                     "reasoning_output": None,
#                     "session_id": session_id
#                 }).execute()
#                 db.table('chat_conversations').update({"updated_at": datetime.utcnow().isoformat()})\
#                   .eq('id', conversation_id).execute()
#             except Exception as e:
#                 print(f"Error saving assistant message: {e}")

#             # Echo conversationId so the client can store it on first turn
#             yield f"data: {json.dumps({'type': 'done', 'conversationId': conversation_id})}\n\n"

#         except Exception as e:
#             yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"

#     return Response(generate(), mimetype='text/event-stream')

# # ================== (Legacy) Session-scoped history (kept, but conversations replace it) ==================

# @app.route('/api/chat/history', methods=['GET'])
# def get_chat_history():
#     auth_header = request.headers.get('Authorization')
#     user, token = get_user_from_token(auth_header)
#     if not user:
#         return jsonify({"success": False, "error": "Unauthorized"}), 401

#     db = user_client(token)
#     session_id = request.args.get('session_id')
#     try:
#         query = db.table('chat_messages').select('*').eq('user_id', user.id)
#         if session_id:
#             query = query.eq('session_id', session_id)
#         response = query.order('created_at', desc=False).execute()
#         return jsonify({"success": True, "messages": response.data})
#     except Exception as e:
#         return jsonify({"success": False, "error": str(e)}), 400

# if __name__ == '__main__':
#     app.run(debug=True, port=5000)

from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from supabase import create_client, Client
import os
import json
from datetime import datetime
import uuid
import requests
from pathlib import Path

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:5173"], supports_credentials=True)

# ================== SUPABASE ==================
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
SUPABASE_ANON_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

def user_client(jwt: str) -> Client:
    client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    client.postgrest.auth(jwt)
    return client

# ================== INTEGRATION JSON (Gemini proxy) ==================
INTEGRATION_PATH = Path(__file__).parent / "integrations" / "accessible_pdf_post.json"
try:
    with open(INTEGRATION_PATH, "r", encoding="utf-8") as f:
        ACCESSIBLE_CFG = json.load(f)
except FileNotFoundError:
    ACCESSIBLE_CFG = {
        "server": os.getenv("ACCESSIBLE_SERVER_URL", "https://kindsite-1.onrender.com"),
        "request": {"url": "/process"},
        "response": {"map": {"summary_markdown": "modified_content", "accessible_pdf_url": "pdf_url"}}
    }

UPSTREAM_BASE = os.getenv("ACCESSIBLE_SERVER_URL", ACCESSIBLE_CFG.get("server", "https://kindsite-1.onrender.com"))

def _map_response(payload: dict, mapping: dict) -> dict:
    out = {}
    for new_key, old_key in mapping.items():
        out[new_key] = payload.get(old_key)
    return out

# ================== AUTH HELPERS ==================
def get_user_from_token(auth_header):
    """Extract and verify user from Authorization header using Supabase Auth."""
    if not auth_header or not auth_header.startswith('Bearer '):
        return None, None
    token = auth_header.split(' ', 1)[1]
    try:
        user = supabase.auth.get_user(token)
        return (user.user if user else None), token
    except Exception as e:
        print(f"Auth error: {e}")
        return None, None

# ================== HEALTH ==================
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "service": "accessibility-api"})

# ================== AUTH ENDPOINTS ==================
@app.route('/api/auth/signup', methods=['POST'])
def signup():
    data = request.json or {}
    email = data.get('email')
    password = data.get('password')
    redirect_url = data.get('redirect_url', 'http://localhost:3000/preferences')

    try:
        response = supabase.auth.sign_up({
            "email": email,
            "password": password,
            "options": {
                "email_redirect_to": redirect_url
            }
        })
        return jsonify({
            "success": True,
            "user": response.user.model_dump() if response.user else None,
            "session": response.session.model_dump() if response.session else None
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json or {}
    email = data.get('email')
    password = data.get('password')

    try:
        response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        return jsonify({
            "success": True,
            "user": response.user.model_dump() if response.user else None,
            "session": response.session.model_dump() if response.session else None
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    auth_header = request.headers.get('Authorization')
    user, _ = get_user_from_token(auth_header)
    if not user:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
    try:
        supabase.auth.sign_out()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/auth/user', methods=['GET'])
def get_current_user():
    auth_header = request.headers.get('Authorization')
    user, _ = get_user_from_token(auth_header)
    if not user:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
    return jsonify({
        "success": True,
        "user": {
            "id": user.id,
            "email": user.email,
            "created_at": user.created_at
        }
    })

# ================== PREFERENCES (RLS via user_client) ==================
@app.route('/api/preferences', methods=['GET'])
def get_preferences():
    auth_header = request.headers.get('Authorization')
    user, token = get_user_from_token(auth_header)
    if not user:
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    db = user_client(token)
    try:
        response = db.table('user_preferences').select('*').eq('id', user.id).single().execute()
        return jsonify({"success": True, "preferences": response.data})
    except Exception:
        return jsonify({"success": True, "preferences": None})

@app.route('/api/preferences', methods=['POST'])
def save_preferences():
    auth_header = request.headers.get('Authorization')
    user, token = get_user_from_token(auth_header)
    if not user:
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    db = user_client(token)
    data = request.json or {}
    preferences = {
        "id": user.id,
        "dyslexia": data.get('dyslexia', False),
        "cognitive_impairment": data.get('cognitive_impairment', False),
        "visual_impairment": data.get('visual_impairment', False),
        "adhd": data.get('adhd', False),
        "esl_simple_english": data.get('esl_simple_english', False),
    }

    try:
        response = db.table('user_preferences').upsert(preferences).execute()
        return jsonify({"success": True, "preferences": response.data[0] if response.data else None})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

# ================== CONVERSATIONS ==================
@app.get('/api/conversations')
def list_conversations():
    auth_header = request.headers.get('Authorization')
    user, token = get_user_from_token(auth_header)
    if not user:
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    db = user_client(token)
    resp = db.table('chat_conversations') \
             .select('id,title,created_at,updated_at') \
             .eq('user_id', user.id) \
             .order('updated_at', desc=True) \
             .execute()
    return jsonify({"success": True, "conversations": resp.data})

@app.post('/api/conversations')
def create_conversation():
    auth_header = request.headers.get('Authorization')
    user, token = get_user_from_token(auth_header)
    if not user:
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    db = user_client(token)
    title = (request.json or {}).get('title') or 'New conversation'
    resp = db.table('chat_conversations') \
             .insert({"user_id": user.id, "title": title}) \
             .select('id,title,created_at,updated_at') \
             .single() \
             .execute()
    return jsonify({"success": True, "conversation": resp.data}), 201

@app.get('/api/conversations/<cid>/messages')
def list_messages(cid):
    auth_header = request.headers.get('Authorization')
    user, token = get_user_from_token(auth_header)
    if not user:
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    db = user_client(token)
    conv = db.table('chat_conversations').select('id').eq('id', cid).eq('user_id', user.id).single().execute()
    if not conv.data:
        return jsonify({"success": False, "error": "Not found"}), 404

    msgs = db.table('chat_messages') \
             .select('id,role,content,created_at') \
             .eq('conversation_id', cid) \
             .order('created_at', desc=False) \
             .execute()
    return jsonify({"success": True, "messages": msgs.data})

# ================== PDF ACCESSIBILITY PROXY (Gemini worker) ==================
@app.post("/api/accessible/from-chat")
def accessible_from_chat():
    """
    Accepts a PDF from the chatbox as multipart/form-data:
      - file (or file_input)
      - accessibility_preset (optional; defaults from JSON or 'cognitive_impairment')
    Proxies it to the Render API (Gemini worker) and returns:
      { success, summary_markdown, accessible_pdf_url }
    """
    # Optional auth (uncomment if you want to protect it):
    # auth_header = request.headers.get('Authorization')
    # user, _ = get_user_from_token(auth_header)
    # if not user: return jsonify({"success": False, "error": "Unauthorized"}), 401

    cfg = ACCESSIBLE_CFG
    req_cfg = cfg.get("request", {})
    resp_cfg = cfg.get("response", {"map": {"summary_markdown": "modified_content", "accessible_pdf_url": "pdf_url"}})
    mapping = resp_cfg.get("map", {"summary_markdown": "modified_content", "accessible_pdf_url": "pdf_url"})

    # support "file" OR "file_input"
    f = request.files.get("file") or request.files.get("file_input")
    if not f:
        return jsonify({"success": False, "error": "No file provided (expected 'file' or 'file_input')"}), 400

    # preset default from JSON
    preset_default = "cognitive_impairment"
    for fld in req_cfg.get("fields", []):
        if fld.get("name") == "accessibility_preset":
            preset_default = fld.get("value", preset_default)
            break
    preset = request.form.get("accessibility_preset", preset_default)

    upstream_url = f'{UPSTREAM_BASE}{req_cfg.get("url", "/process")}'
    files = {"file_input": (f.filename, f.stream, f.mimetype or "application/pdf")}
    data = {"accessibility_preset": preset}

    try:
        r = requests.post(upstream_url, files=files, data=data, timeout=120)
        r.raise_for_status()
        upstream = r.json()  # expects { modified_content, pdf_url }
    except Exception as e:
        return jsonify({"success": False, "error": f"Upstream error: {e}"}), 502

    mapped = _map_response(upstream, mapping)
    return jsonify({"success": True, **mapped})

# ================== CHAT (neutral stub; forward to Gemini chat if provided) ==================
@app.route('/api/chat', methods=['POST'])
def chat():
    """
    No OpenAI. If you have a Gemini chat endpoint, set GEMINI_CHAT_URL and we forward the JSON.
    Otherwise 501 so the frontend doesn't pretend to stream.
    """
    GEMINI_CHAT_URL = os.getenv("GEMINI_CHAT_URL")
    data = request.json or {}

    if not GEMINI_CHAT_URL:
        return jsonify({"success": False, "error": "Chat model not configured. Set GEMINI_CHAT_URL."}), 501

    # Optional: pass through Authorization
    headers = {}
    auth_header = request.headers.get('Authorization')
    if auth_header:
        headers['Authorization'] = auth_header

    try:
        r = requests.post(GEMINI_CHAT_URL, json=data, headers=headers, timeout=120)
        r.raise_for_status()
        return jsonify(r.json())
    except Exception as e:
        return jsonify({"success": False, "error": f"Upstream chat error: {e}"}), 502

# ================== (Legacy) Session-scoped history ==================
@app.route('/api/chat/history', methods=['GET'])
def get_chat_history():
    auth_header = request.headers.get('Authorization')
    user, token = get_user_from_token(auth_header)
    if not user:
        return jsonify({"success": False, "error": "Unauthorized"}), 401

    db = user_client(token)
    session_id = request.args.get('session_id')
    try:
        query = db.table('chat_messages').select('*').eq('user_id', user.id)
        if session_id:
            query = query.eq('session_id', session_id)
        response = query.order('created_at', desc=False).execute()
        return jsonify({"success": True, "messages": response.data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

# ================== MAIN ==================
if __name__ == '__main__':
    # Optional: override upstreams via env
    # ACCESSIBLE_SERVER_URL=https://kindsite-1.onrender.com
    # GEMINI_CHAT_URL=https://your-chat-worker.onrender.com/chat
    app.run(debug=True, port=5000)


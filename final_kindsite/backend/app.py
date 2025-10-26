from flask import Flask, request, jsonify, Response
from flask_cors import CORS
from supabase import create_client, Client
import os
from openai import OpenAI
import json
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000", "http://localhost:5173"], supports_credentials=True)

# Initialize Supabase client
supabase_url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
supabase_key = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

# Initialize OpenAI client
openai_client = OpenAI()

def get_user_from_token(auth_header):
    """Extract and verify user from Authorization header"""
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    token = auth_header.split(' ')[1]
    try:
        user = supabase.auth.get_user(token)
        return user.user if user else None
    except Exception as e:
        print(f"Auth error: {e}")
        return None

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "healthy", "service": "accessibility-api"})

# ============= AUTH ENDPOINTS =============

@app.route('/api/auth/signup', methods=['POST'])
def signup():
    """User registration endpoint"""
    data = request.json
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
    """User login endpoint"""
    data = request.json
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
    """User logout endpoint"""
    auth_header = request.headers.get('Authorization')
    user = get_user_from_token(auth_header)
    
    if not user:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
    
    try:
        supabase.auth.sign_out()
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

@app.route('/api/auth/user', methods=['GET'])
def get_current_user():
    """Get current authenticated user"""
    auth_header = request.headers.get('Authorization')
    user = get_user_from_token(auth_header)
    
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

# ============= PREFERENCES ENDPOINTS =============

@app.route('/api/preferences', methods=['GET'])
def get_preferences():
    """Get user preferences"""
    auth_header = request.headers.get('Authorization')
    user = get_user_from_token(auth_header)
    
    if not user:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
    
    try:
        response = supabase.table('user_preferences').select('*').eq('id', user.id).single().execute()
        return jsonify({"success": True, "preferences": response.data})
    except Exception as e:
        return jsonify({"success": True, "preferences": None})

@app.route('/api/preferences', methods=['POST'])
def save_preferences():
    """Save or update user preferences"""
    auth_header = request.headers.get('Authorization')
    user = get_user_from_token(auth_header)
    
    if not user:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
    
    data = request.json
    preferences = {
        "id": user.id,
        "dyslexia": data.get('dyslexia', False),
        "cognitive_impairment": data.get('cognitive_impairment', False),
        "visual_impairment": data.get('visual_impairment', False),
        "adhd": data.get('adhd', False),
        "esl_simple_english": data.get('esl_simple_english', False),
    }
    
    try:
        response = supabase.table('user_preferences').upsert(preferences).execute()
        return jsonify({"success": True, "preferences": response.data[0] if response.data else None})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

# ============= CHAT ENDPOINTS =============

@app.route('/api/chat', methods=['POST'])
def chat():
    """Chat endpoint with streaming support"""
    auth_header = request.headers.get('Authorization')
    user = get_user_from_token(auth_header)
    
    if not user:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
    
    data = request.json
    messages = data.get('messages', [])
    session_id = data.get('sessionId', str(uuid.uuid4()))
    website_data = data.get('websiteData')
    
    # Get user preferences
    try:
        prefs_response = supabase.table('user_preferences').select('*').eq('id', user.id).single().execute()
        preferences = prefs_response.data if prefs_response.data else {}
    except:
        preferences = {}
    
    # Build user instructions from preferences
    user_instructions = "User's accessibility preferences:\n"
    
    if preferences.get('dyslexia'):
        user_instructions += "- Has dyslexia (e.g., dyslexia). Use clear, simple language with short sentences and paragraphs.\n"
    
    if preferences.get('adhd'):
        user_instructions += "- Prefers larger text. When providing formatted content, emphasize readability.\n"
    
    if preferences.get('cognitive_impairment'):
        user_instructions += "- Sensitive to motion. Avoid suggesting animated or moving content.\n"
    
    if preferences.get('esl_simple_english'):
        user_instructions += "- Prefers reduced motion in interfaces.\n"
    
    if preferences.get('visual_impairment'):
        user_instructions += "- Sensitive to bright colors. Suggest softer, more comfortable color palettes.\n"
    
    # Build system prompt
    system_prompt = f"""You are an accessibility assistant that helps convert inaccessible content (PDFs, images, documents, websites) into more accessible formats.

{user_instructions}
"""
    
    if website_data:
        system_prompt += f"\nWebsite data to analyze:\nURL: {website_data.get('url', 'N/A')}\nTitle: {website_data.get('title', 'N/A')}\nContent: {website_data.get('content', 'N/A')}\n"
    
    system_prompt += """\nWhen the user uploads a document, image, or website:
1. Analyze the content for accessibility issues
2. Provide a clear, accessible version of the content
3. Explain what changes you made and why
4. Offer suggestions for further improvements

Be helpful, supportive, and focus on making content truly accessible for this user's specific needs."""
    
    # Save user message to database
    if messages and messages[-1].get('role') == 'user':
        last_message = messages[-1]
        user_content = last_message.get('content', '')
        attachments = last_message.get('experimental_attachments')
        
        try:
            supabase.table('chat_messages').insert({
                "user_id": user.id,
                "role": "user",
                "content": user_content,
                "user_instructions": user_instructions,
                "website_data": website_data,
                "session_id": session_id,
                "attachments": attachments
            }).execute()
        except Exception as e:
            print(f"Error saving user message: {e}")
    
    # Convert messages to OpenAI format
    openai_messages = [{"role": "system", "content": system_prompt}]
    
    for msg in messages:
        role = msg.get('role')
        content = msg.get('content', '')
        
        if role in ['user', 'assistant']:
            openai_messages.append({"role": role, "content": content})
    
    # Stream response from OpenAI
    def generate():
        try:
            stream = openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=openai_messages,
                stream=True,
                max_tokens=2000
            )
            
            full_response = ""
            
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    content = chunk.choices[0].delta.content
                    full_response += content
                    
                    # Send SSE format
                    yield f"data: {json.dumps({'type': 'text', 'content': content})}\n\n"
            
            # Save assistant message to database
            try:
                supabase.table('chat_messages').insert({
                    "user_id": user.id,
                    "role": "assistant",
                    "content": full_response,
                    "user_instructions": user_instructions,
                    "website_data": website_data,
                    "reasoning_output": None,
                    "session_id": session_id
                }).execute()
            except Exception as e:
                print(f"Error saving assistant message: {e}")
            
            yield f"data: {json.dumps({'type': 'done'})}\n\n"
            
        except Exception as e:
            yield f"data: {json.dumps({'type': 'error', 'error': str(e)})}\n\n"
    
    return Response(generate(), mimetype='text/event-stream')

@app.route('/api/chat/history', methods=['GET'])
def get_chat_history():
    """Get chat history for a user"""
    auth_header = request.headers.get('Authorization')
    user = get_user_from_token(auth_header)
    
    if not user:
        return jsonify({"success": False, "error": "Unauthorized"}), 401
    
    session_id = request.args.get('session_id')
    
    try:
        query = supabase.table('chat_messages').select('*').eq('user_id', user.id)
        
        if session_id:
            query = query.eq('session_id', session_id)
        
        response = query.order('created_at', desc=False).execute()
        return jsonify({"success": True, "messages": response.data})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)

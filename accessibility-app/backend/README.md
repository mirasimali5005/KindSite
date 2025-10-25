# Flask Backend for AccessibleNow

## Setup

1. Install dependencies:
\`\`\`bash
pip install -r requirements.txt
\`\`\`

2. Create a `.env` file with your credentials:
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
\`\`\`

3. Run the Flask server:
\`\`\`bash
python app.py
\`\`\`

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/user` - Get current user

### Preferences
- `GET /api/preferences` - Get user preferences
- `POST /api/preferences` - Save/update preferences

### Chat
- `POST /api/chat` - Send chat message (streaming)
- `GET /api/chat/history` - Get chat history

### Health
- `GET /api/health` - Health check

## Authentication

All protected endpoints require an `Authorization` header with a Bearer token:
\`\`\`
Authorization: Bearer <supabase_access_token>

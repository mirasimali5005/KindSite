# Accessibility Tool

A web application that helps convert inaccessible content (PDFs, images, etc.) into accessible versions for people with dyslexia, motion sickness, and other accessibility needs.

## Architecture

- **Backend**: Flask API (Python)
- **Frontend**: React with Vite
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI for content conversion

## Project Structure

\`\`\`
.
├── backend/           # Flask API server
│   ├── app.py        # Main Flask application
│   └── requirements.txt
├── frontend/         # React frontend
│   ├── src/
│   └── package.json
├── scripts/          # Database migration scripts
└── README.md
\`\`\`

## Setup Instructions

### 1. Install Dependencies

**Frontend:**
\`\`\`bash
cd frontend
npm install
\`\`\`

**Backend:**
\`\`\`bash
cd backend
pip install -r requirements.txt
\`\`\`

Or install both at once from the root:
\`\`\`bash
npm run install:all
\`\`\`

### 2. Environment Variables

The Supabase environment variables are already configured in your Vercel project.

For the backend, create a `backend/.env` file with:
\`\`\`
SUPABASE_URL=<from Vercel>
SUPABASE_ANON_KEY=<from Vercel>
SUPABASE_SERVICE_ROLE_KEY=<from Vercel>
OPENAI_API_KEY=<your OpenAI key>
\`\`\`

For the frontend, create a `frontend/.env` file with:
\`\`\`
VITE_SUPABASE_URL=<from Vercel>
VITE_SUPABASE_ANON_KEY=<from Vercel>
VITE_API_URL=http://localhost:5000
\`\`\`

### 3. Database Setup

Run the SQL scripts in the `scripts/` folder in order:
1. `001_create_user_preferences.sql`
2. `002_create_chat_history.sql`
3. `003_add_chat_columns.sql`

You can run these directly in the Supabase SQL editor or using the Supabase CLI.

### 4. Run the Application

**Start the backend (Terminal 1):**
\`\`\`bash
cd backend
python app.py
\`\`\`
The Flask API will run on `http://localhost:5000`

**Start the frontend (Terminal 2):**
\`\`\`bash
cd frontend
npm run dev
\`\`\`
The React app will run on `http://localhost:5173`

Or from the root directory:
\`\`\`bash
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev:frontend
\`\`\`

## Features

- **Authentication**: Email/password sign-up and login with Supabase
- **User Preferences**: Customizable accessibility settings (reading, motion, color preferences)
- **AI Chat Interface**: Upload PDFs/images and get accessible versions
- **Streaming Responses**: Real-time AI responses with OpenAI
- **Session Management**: Conversation history stored in database

## API Endpoints

- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login user
- `GET /api/preferences` - Get user preferences
- `POST /api/preferences` - Save user preferences
- `POST /api/chat` - Send chat message (streaming)

## Tech Stack

**Frontend:**
- React 19
- Vite
- React Router
- Tailwind CSS
- Supabase JS Client
- Radix UI Components

**Backend:**
- Flask
- Supabase Python Client
- OpenAI Python SDK
- Flask-CORS

## Development Notes

- The frontend uses Supabase for authentication state management
- The backend validates JWT tokens from Supabase
- All API requests from frontend include the Supabase auth token
- Chat messages support streaming for real-time responses

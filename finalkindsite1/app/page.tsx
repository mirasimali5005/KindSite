import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Accessibility Tool</h1>
          <p className="text-xl text-muted-foreground">Flask Backend + React Frontend Architecture</p>
        </div>

        <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="text-amber-900 dark:text-amber-100">⚠️ Architecture Change</CardTitle>
            <CardDescription className="text-amber-800 dark:text-amber-200">
              This project has been converted to a Flask backend with React frontend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-amber-900 dark:text-amber-100">
            <p>
              The v0 preview shows this informational page, but the actual application runs separately as two services:
            </p>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Flask Backend:</strong> Python API server on port 5000
              </li>
              <li>
                <strong>React Frontend:</strong> Vite dev server on port 5173
              </li>
            </ul>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>🚀 Quick Start</CardTitle>
              <CardDescription>Get the app running locally</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">1. Install Dependencies</h3>
                <pre className="rounded-lg bg-muted p-3 text-sm">
                  <code>{`# Frontend
cd frontend
npm install

# Backend
cd backend
pip install -r requirements.txt`}</code>
                </pre>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">2. Set Environment Variables</h3>
                <p className="text-sm text-muted-foreground">
                  Create <code className="rounded bg-muted px-1">.env</code> files in both frontend and backend folders.
                  See <code className="rounded bg-muted px-1">.env.example</code> files for required variables.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">3. Run Database Scripts</h3>
                <p className="text-sm text-muted-foreground">
                  Execute the SQL scripts in the <code className="rounded bg-muted px-1">scripts/</code> folder in your
                  Supabase database (001, 002, 003).
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">4. Start Both Servers</h3>
                <pre className="rounded-lg bg-muted p-3 text-sm">
                  <code>{`# Terminal 1 - Backend
cd backend
python app.py

# Terminal 2 - Frontend
cd frontend
npm run dev`}</code>
                </pre>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📁 Project Structure</CardTitle>
              <CardDescription>Understanding the codebase</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-semibold">Backend (Flask)</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>
                    • <code className="rounded bg-muted px-1">backend/app.py</code> - Main Flask API
                  </li>
                  <li>• Authentication endpoints</li>
                  <li>• Preferences management</li>
                  <li>• Streaming chat with OpenAI</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Frontend (React + Vite)</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>
                    • <code className="rounded bg-muted px-1">frontend/src/pages/</code> - All pages
                  </li>
                  <li>• React Router for navigation</li>
                  <li>• Supabase for auth state</li>
                  <li>• Tailwind CSS for styling</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold">Database (Supabase)</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>
                    • <code className="rounded bg-muted px-1">scripts/</code> - Migration scripts
                  </li>
                  <li>• User preferences table</li>
                  <li>• Chat messages with history</li>
                  <li>• Row Level Security enabled</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>🔗 API Endpoints</CardTitle>
            <CardDescription>Flask backend routes (localhost:5000)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <code className="rounded bg-muted px-2 py-1 text-sm">POST /api/auth/signup</code>
                <p className="text-sm text-muted-foreground">Create new user account</p>
              </div>
              <div className="space-y-1">
                <code className="rounded bg-muted px-2 py-1 text-sm">POST /api/auth/login</code>
                <p className="text-sm text-muted-foreground">Login user</p>
              </div>
              <div className="space-y-1">
                <code className="rounded bg-muted px-2 py-1 text-sm">GET /api/preferences</code>
                <p className="text-sm text-muted-foreground">Get user preferences</p>
              </div>
              <div className="space-y-1">
                <code className="rounded bg-muted px-2 py-1 text-sm">POST /api/preferences</code>
                <p className="text-sm text-muted-foreground">Save preferences</p>
              </div>
              <div className="space-y-1">
                <code className="rounded bg-muted px-2 py-1 text-sm">POST /api/chat</code>
                <p className="text-sm text-muted-foreground">Streaming chat endpoint</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📚 Documentation</CardTitle>
            <CardDescription>Additional resources</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm">
              For complete setup instructions and architecture details, see the{" "}
              <code className="rounded bg-muted px-1">README.md</code> file in the project root.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="http://localhost:5173" target="_blank" rel="noopener noreferrer">
                  Open Frontend (Port 5173)
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="http://localhost:5000" target="_blank" rel="noopener noreferrer">
                  Open Backend (Port 5000)
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="rounded-lg border border-muted bg-muted/50 p-4">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> This page is only visible in the v0 preview. When running locally, navigate to{" "}
            <code className="rounded bg-background px-1">http://localhost:5173</code> to access the React frontend
            application.
          </p>
        </div>
      </div>
    </div>
  )
}

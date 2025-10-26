const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000"

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("supabase_token")

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Request failed" }))
    throw new Error(error.error || "Request failed")
  }

  return response.json()
}

export const api = {
  // Auth
  signUp: (email: string, password: string) =>
    apiRequest("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  signIn: (email: string, password: string) =>
    apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  signOut: () => apiRequest("/api/auth/logout", { method: "POST" }),

  getCurrentUser: () => apiRequest("/api/auth/user"),

  // Preferences
  getPreferences: () => apiRequest("/api/preferences"),

  savePreferences: (preferences: any) =>
    apiRequest("/api/preferences", {
      method: "POST",
      body: JSON.stringify(preferences),
    }),

  // Chat
  getChatHistory: (sessionId?: string) => apiRequest(`/api/chat/history${sessionId ? `?session_id=${sessionId}` : ""}`),
  listConversations: () => apiRequest("/api/conversations", { method: "GET" }),
  createConversation: (title?: string) =>
    apiRequest("/api/conversations", {
      method: "POST",
      body: JSON.stringify({ title }),
    }),
  getConversationMessages: (conversationId: string) =>
    apiRequest(`/api/conversations/${conversationId}/messages`, {
      method: "GET",
    }),
}



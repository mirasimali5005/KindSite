import { consumeStream, convertToModelMessages, streamText, type UIMessage } from "ai"
import { createClient } from "@/lib/supabase/server"
import { randomUUID } from "crypto"

export const maxDuration = 30

export async function POST(req: Request) {
  const { messages, sessionId, websiteData }: { messages: UIMessage[]; sessionId?: string; websiteData?: any } =
    await req.json()

  // Get authenticated user
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response("Unauthorized", { status: 401 })
  }

  // Get user preferences
  const { data: preferences } = await supabase.from("user_preferences").select("*").eq("id", user.id).single()

  let userInstructions = "User's accessibility preferences:\n"

  if (preferences?.dyslexia) {
    userInstructions += `- Has dyslexia (e.g., dyslexia). Use clear, simple language with short sentences and paragraphs.\n`
  }

  if (preferences?.adhd) {
    userInstructions += `- Prefers larger text. When providing formatted content, emphasize readability.\n`
  }

  if (preferences?.cognitive_impairment) {
    userInstructions += `- Sensitive to motion. Avoid suggesting animated or moving content.\n`
  }

  if (preferences?.esl_simple_english) {
    userInstructions += `- Prefers reduced motion in interfaces.\n`
  }

  if (preferences?.visual_impairment) {
    userInstructions += `- Sensitive to bright colors. Suggest softer, more comfortable color palettes.\n`
  }


  // Build system prompt based on user preferences
  let systemPrompt = `You are an accessibility assistant that helps convert inaccessible content (PDFs, images, documents, websites) into more accessible formats. 

${userInstructions}
`

  if (websiteData) {
    systemPrompt += `\nWebsite data to analyze:\nURL: ${websiteData.url || "N/A"}\nTitle: ${websiteData.title || "N/A"}\nContent: ${websiteData.content || "N/A"}\n`
  }

  systemPrompt += `\nWhen the user uploads a document, image, or website:
1. Analyze the content for accessibility issues
2. Provide a clear, accessible version of the content
3. Explain what changes you made and why
4. Offer suggestions for further improvements

Be helpful, supportive, and focus on making content truly accessible for this user's specific needs.`

  const prompt = convertToModelMessages([
    {
      id: "system",
      role: "system",
      parts: [{ type: "text", text: systemPrompt }],
    },
    ...messages,
  ])

  const currentSessionId = sessionId || randomUUID()

  const lastUserMessage = messages[messages.length - 1]
  if (lastUserMessage && lastUserMessage.role === "user") {
    const userMessageContent = lastUserMessage.parts
      .filter((part: any) => part.type === "text")
      .map((part: any) => part.text)
      .join(" ")

    await supabase.from("chat_messages").insert({
      user_id: user.id,
      role: "user",
      content: userMessageContent,
      user_instructions: userInstructions,
      website_data: websiteData || null,
      session_id: currentSessionId,
      attachments: lastUserMessage.experimental_attachments || null,
    })
  }

  const result = streamText({
    model: "openai/gpt-5-mini",
    messages: prompt,
    abortSignal: req.signal,
    maxOutputTokens: 2000,
  })

  return result.toUIMessageStreamResponse({
    onFinish: async ({ text, isAborted }) => {
      if (isAborted) {
        console.log("[v0] Chat aborted")
        return
      }

      // For now, reasoning_output is null, but can be populated if using a reasoning model
      await supabase.from("chat_messages").insert({
        user_id: user.id,
        role: "assistant",
        content: text,
        user_instructions: userInstructions,
        website_data: websiteData || null,
        reasoning_output: null, // Can be populated with reasoning model output
        session_id: currentSessionId,
      })
    },
    consumeSseStream: consumeStream,
  })
}

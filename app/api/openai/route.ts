import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const { query } = await req.json()

    // Check if the OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ error: "OpenAI API key is not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Generate a streaming response using the AI SDK
    const result = await streamText({
      model: openai("gpt-4o"),
      prompt: query,
      system:
        "You are a knowledgeable assistant specializing in historical figures and their achievements. " +
        "Provide accurate, concise, and informative answers about the person the user is asking about. " +
        "Focus on historical context, achievements, and interesting facts that might not be visible in their timeline. " +
        "If you're unsure about specific details, acknowledge the limitations of your knowledge.",
    })

    // Return the streaming response
    return result.toTextStreamResponse()
  } catch (error) {
    console.error("Error:", error)
    return new Response(JSON.stringify({ error: "Failed to process your request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

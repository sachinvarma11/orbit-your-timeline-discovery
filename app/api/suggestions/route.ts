import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { query } = await req.json()

    if (!query || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    // Check if the OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
    }

    const prompt = `
      The user is typing "${query}" in a search box for historical figures, celebrities, or notable people.
      Provide 5 likely search completions or suggestions based on this partial input.
      
      Return ONLY a JSON array of strings with no additional text, comments, or explanations.
      
      Example format for input "alb":
      ["Albert Einstein", "Albert Camus", "Alberta Hunter", "Albrecht Dürer", "Al Pacino"]
      
      Make sure the suggestions are diverse and represent different types of notable people.
      If the input is too vague, provide suggestions for the most famous people that match.
      IMPORTANT: Your entire response must be ONLY the JSON array, with no introduction, explanation, or additional text.
    `

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.3,
      maxTokens: 500,
    })

    try {
      // Extract JSON from the response
      const jsonRegex = /\[[\s\S]*\]/
      const match = text.match(jsonRegex)

      if (!match) {
        return NextResponse.json({ suggestions: [] })
      }

      const jsonText = match[0]
      const suggestions = JSON.parse(jsonText)

      if (!Array.isArray(suggestions)) {
        return NextResponse.json({ suggestions: [] })
      }

      return NextResponse.json({ suggestions })
    } catch (parseError) {
      console.error("Error parsing suggestions:", parseError)
      return NextResponse.json({ suggestions: [] })
    }
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ suggestions: [] })
  }
}

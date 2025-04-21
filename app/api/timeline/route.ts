import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { name } = await req.json()

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    // Check if the OpenAI API key is set
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ error: "OpenAI API key is not configured" }, { status: 500 })
    }

    // Generate timeline data using OpenAI with a more explicit prompt
    const prompt = `
      Create a chronological timeline of key events in the life of ${name}, including the most recent events up to the present day if applicable.
      
      Even if the name has a slight misspelling or is not exactly correct, try to identify who they might be referring to.
      For example, if they typed "mark cuben", you should create a timeline for "Mark Cuban".
      
      Your response must be ONLY a valid JSON array with no additional text, comments, or explanations.
      
      For each event, include:
      1. The year it occurred
      2. The person's age at the time
      3. A brief description of the event
      
      Format:
      [
        {"year": 1879, "age": 0, "event": "Born in Ulm, Germany."},
        {"year": 1905, "age": 26, "event": "Published the special theory of relativity."}
      ]
      
      Include at least 8-12 significant events if the person is well-known.
      If the person is not well-known or fictional, respond with an empty array: []
      
      IMPORTANT: Your entire response must be ONLY the JSON array, with no introduction, explanation, or additional text.
      IMPORTANT: Include the most recent events up to the present day if the person is still alive.
    `

    const { text } = await generateText({
      model: openai("gpt-4o"),
      prompt,
      temperature: 0.7,
      maxTokens: 2000,
    })

    try {
      // Extract JSON from the response (in case there's any text before or after the JSON)
      const jsonRegex = /\[[\s\S]*\]/
      const match = text.match(jsonRegex)

      if (!match) {
        console.error("Could not find JSON array in response:", text)
        return NextResponse.json({ error: "Invalid response format", rawResponse: text }, { status: 500 })
      }

      const jsonText = match[0]
      const events = JSON.parse(jsonText)

      // Validate the response format
      if (!Array.isArray(events)) {
        throw new Error("Invalid response format")
      }

      // If no events were found, try to get a suggestion for the name
      if (events.length === 0) {
        const suggestionPrompt = `
          The user searched for "${name}" but no timeline data was found.
          If this appears to be a misspelling or variant of a well-known person's name,
          provide the correct name as a simple string with no additional text.
          If you can't determine who they might be referring to, respond with "unknown".
        `

        const { text: suggestionText } = await generateText({
          model: openai("gpt-4o"),
          prompt: suggestionPrompt,
          temperature: 0.3,
          maxTokens: 100,
        })

        const suggestion = suggestionText.trim()
        if (suggestion && suggestion.toLowerCase() !== "unknown") {
          return NextResponse.json({
            events: [],
            suggestion,
            error: `No timeline found for "${name}". Did you mean "${suggestion}"?`,
          })
        }
      }

      // Sort events by year
      const sortedEvents = events.sort((a, b) => a.year - b.year)

      return NextResponse.json({ events: sortedEvents })
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError, "Raw response:", text)

      // Fallback: Try to create a simple timeline from the text if JSON parsing fails
      try {
        // Create a simple fallback timeline with just one event
        return NextResponse.json({
          events: [],
          error: "Could not parse timeline data. Please try another search.",
        })
      } catch (fallbackError) {
        return NextResponse.json({ error: "Failed to parse timeline data" }, { status: 500 })
      }
    }
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to process your request" }, { status: 500 })
  }
}

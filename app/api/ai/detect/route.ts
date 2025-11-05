import { generateText } from "ai"
import { CRIME_TYPES } from "@/lib/config"

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const description = formData.get("description") as string

    if (!description || !description.trim()) {
      return Response.json({ error: "Description is required" }, { status: 400 })
    }

    const { text } = await generateText({
      model: "groq/mixtral-8x7b-32768",
      system: `You are a crime classification AI. Analyze the incident description and respond with ONLY a JSON object (no markdown, no code blocks) with these exact fields:
{
  "type": "one of: theft, assault, accident, fire, medical, other",
  "confidence": 0.0 to 1.0,
  "explanation": "brief explanation (1-2 sentences)",
  "recommended_channels": ["sms", "email", "voice"] or subset
}`,
      prompt: `Classify this incident: "${description}"`,
    })

    // Parse the AI response
    let result
    try {
      result = JSON.parse(text)
    } catch {
      // Fallback if AI response isn't pure JSON
      result = {
        type: "other",
        confidence: 0.6,
        explanation: "Incident classified as other. Manual review recommended.",
        recommended_channels: ["sms", "email"],
      }
    }

    // Validate crime type
    const validTypes = CRIME_TYPES.map((c) => c.id)
    if (!validTypes.includes(result.type)) {
      result.type = "other"
    }

    return Response.json(result)
  } catch (error) {
    console.error("[v0] AI Detection error:", error)
    return Response.json({ error: "Detection failed" }, { status: 500 })
  }
}

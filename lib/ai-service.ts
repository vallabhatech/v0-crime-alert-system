import { generateText } from "ai"
import { CRIME_TYPES } from "./config"

export interface CrimeDetectionResult {
  type: string
  confidence: number
  explanation: string
  recommended_channels: string[]
}

export const aiService = {
  detectCrime: async (description: string): Promise<CrimeDetectionResult> => {
    if (!description || !description.trim()) {
      throw new Error("Description is required")
    }

    try {
      const { text } = await generateText({
        model: "groq/mixtral-8x7b-32768",
        temperature: 0.3,
        system: `You are a crime classification AI. Analyze the incident description and respond with ONLY a JSON object (no markdown, no code blocks, no explanation text) with these exact fields:
{
  "type": "one of: theft, assault, accident, fire, medical, other",
  "confidence": number between 0.0 and 1.0,
  "explanation": "brief explanation 1-2 sentences max",
  "recommended_channels": array of "sms", "email", "voice"
}`,
        prompt: `Classify this incident: "${description}"`,
      })

      let result: CrimeDetectionResult
      try {
        result = JSON.parse(text.trim())
      } catch {
        console.error("[v0] Failed to parse AI response:", text)
        result = {
          type: "other",
          confidence: 0.5,
          explanation: "Classification uncertain. Manual review recommended.",
          recommended_channels: ["sms", "email"],
        }
      }

      // Validate and clean result
      const validTypes = CRIME_TYPES.map((c) => c.id)
      if (!validTypes.includes(result.type)) {
        result.type = "other"
      }

      result.confidence = Math.max(0, Math.min(1, result.confidence || 0.5))
      if (!Array.isArray(result.recommended_channels)) {
        result.recommended_channels = ["sms", "email"]
      }

      return result
    } catch (error) {
      console.error("[v0] AI service error:", error)
      throw error
    }
  },
}

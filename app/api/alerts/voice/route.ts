// Voice Call Endpoint - Free mock implementation
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message, alertId } = await request.json()

    console.log("[v0] Voice Call Alert:", { phoneNumber, message, alertId })

    // For demo purposes, log to console and return success
    // To use Twilio Voice:
    // const client = twilio(accountSid, authToken);
    // const twiml = new VoiceResponse();
    // twiml.say(message, { voice: 'alice' });
    // await client.calls.create({
    //   to: phoneNumber,
    //   from: process.env.TWILIO_PHONE,
    //   twiml: twiml.toString(),
    // });

    const deliveryLog = {
      alertId,
      method: "voice",
      phoneNumber: phoneNumber.slice(-4), // Don't log full number
      timestamp: new Date().toISOString(),
      status: "queued",
      duration: "~30 seconds",
    }

    console.log("[v0] Voice call queued:", deliveryLog)

    // Simulate call delay
    setTimeout(() => {
      console.log("[v0] Voice call connected to", phoneNumber)
    }, 1500)

    return NextResponse.json({
      success: true,
      message: "Voice call queued",
      alertId,
      method: "voice",
    })
  } catch (error) {
    console.error("[v0] Voice endpoint error:", error)
    return NextResponse.json({ error: "Failed to initiate call" }, { status: 500 })
  }
}

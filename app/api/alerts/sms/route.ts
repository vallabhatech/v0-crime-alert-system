// SMS Alert Endpoint - Free mock implementation
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, message, alertId } = await request.json()

    console.log("[v0] SMS Alert:", { phoneNumber, message, alertId })

    // For demo purposes, log to console and return success
    // To use Twilio:
    // const accountSid = process.env.TWILIO_ACCOUNT_SID;
    // const authToken = process.env.TWILIO_AUTH_TOKEN;
    // const client = twilio(accountSid, authToken);
    // await client.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE,
    //   to: phoneNumber,
    // });

    // Store delivery record
    const deliveryLog = {
      alertId,
      method: "sms",
      phoneNumber: phoneNumber.slice(-4), // Don't log full number
      timestamp: new Date().toISOString(),
      status: "queued",
    }

    console.log("[v0] SMS queued:", deliveryLog)

    // Simulate delivery delay
    setTimeout(() => {
      console.log("[v0] SMS delivered to", phoneNumber)
    }, 2000)

    return NextResponse.json({
      success: true,
      message: "SMS queued for delivery",
      alertId,
      method: "sms",
    })
  } catch (error) {
    console.error("[v0] SMS endpoint error:", error)
    return NextResponse.json({ error: "Failed to send SMS" }, { status: 500 })
  }
}

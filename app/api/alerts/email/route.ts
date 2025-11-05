// Email Alert Endpoint - Free mock implementation
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, subject, message, alertId } = await request.json()

    console.log("[v0] Email Alert:", { email, subject, alertId })

    // For demo purposes, log to console and return success
    // To use SendGrid:
    // import sgMail from '@sendgrid/mail';
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    // await sgMail.send({
    //   to: email,
    //   from: process.env.SENDGRID_FROM_EMAIL,
    //   subject: subject,
    //   html: message,
    // });

    const deliveryLog = {
      alertId,
      method: "email",
      email: email.split("@")[0] + "@***", // Sanitize
      timestamp: new Date().toISOString(),
      status: "queued",
    }

    console.log("[v0] Email queued:", deliveryLog)

    // Simulate delivery delay
    setTimeout(() => {
      console.log("[v0] Email delivered to", email)
    }, 3000)

    return NextResponse.json({
      success: true,
      message: "Email queued for delivery",
      alertId,
      method: "email",
    })
  } catch (error) {
    console.error("[v0] Email endpoint error:", error)
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 })
  }
}

// Alert delivery service
import { ALERT_CHANNELS } from "./config"

export const alertService = {
  // Send SMS alert via Twilio
  sendSMS: async (phoneNumber: string, message: string) => {
    try {
      const response = await fetch("/api/alerts/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, message }),
      })
      return response.ok
    } catch (error) {
      console.error("SMS sending failed:", error)
      return false
    }
  },

  // Send email alert via SendGrid
  sendEmail: async (email: string, subject: string, body: string) => {
    try {
      const response = await fetch("/api/alerts/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subject, body }),
      })
      return response.ok
    } catch (error) {
      console.error("Email sending failed:", error)
      return false
    }
  },

  // Send voice call via Twilio
  sendVoiceCall: async (phoneNumber: string, message: string) => {
    try {
      const response = await fetch("/api/alerts/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, message }),
      })
      return response.ok
    } catch (error) {
      console.error("Voice call failed:", error)
      return false
    }
  },

  // Multi-channel alert dispatch
  dispatchAlert: async (alert: any, channels: string[]) => {
    const results = []
    for (const channel of channels) {
      let result = false
      if (channel === ALERT_CHANNELS.SMS) {
        result = await alertService.sendSMS(alert.contact, alert.message)
      } else if (channel === ALERT_CHANNELS.EMAIL) {
        result = await alertService.sendEmail(alert.email, "Emergency Alert", alert.message)
      } else if (channel === ALERT_CHANNELS.VOICE) {
        result = await alertService.sendVoiceCall(alert.contact, alert.message)
      }
      results.push({ channel, success: result })
    }
    return results
  },
}

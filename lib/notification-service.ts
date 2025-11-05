export interface AlertNotification {
  alertId: string
  title: string
  message: string
  channels: string[]
  phoneNumber?: string
  email?: string
  severity: "low" | "medium" | "high" | "critical"
}

export const notificationService = {
  // In-app notification (always works, stored locally)
  sendInAppNotification: async (notification: AlertNotification) => {
    console.log("[v0] Sending in-app notification:", notification)

    // Store in localStorage for demo
    const notifications = JSON.parse(localStorage.getItem("notifications") || "[]")
    notifications.push({
      ...notification,
      timestamp: new Date(),
      read: false,
    })
    localStorage.setItem("notifications", JSON.stringify(notifications.slice(-50))) // Keep last 50

    // Trigger browser notification if permission granted
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(notification.title, {
        body: notification.message,
        icon: "/placeholder-logo.svg",
        tag: notification.alertId,
      })
    }

    return { success: true, method: "in_app" }
  },

  // Browser Notification API (free, no backend needed)
  requestNotificationPermission: async () => {
    if ("Notification" in window && Notification.permission === "default") {
      await Notification.requestPermission()
    }
  },

  // Play local alarm sound (using Web Audio API)
  playAlarmSound: async () => {
    console.log("[v0] Playing alarm sound")

    try {
      const audioContext = new (window as any).AudioContext() || new (window as any).webkitAudioContext()

      if (!audioContext) return { success: false, error: "AudioContext not supported" }

      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)

      // Create siren pattern: 900Hz, 1100Hz, repeating
      oscillator.frequency.value = 900

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)

      // Schedule second pulse
      setTimeout(() => {
        const osc2 = audioContext.createOscillator()
        const gain2 = audioContext.createGain()

        osc2.connect(gain2)
        gain2.connect(audioContext.destination)

        osc2.frequency.value = 1100
        gain2.gain.setValueAtTime(0.3, audioContext.currentTime)
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)

        osc2.start(audioContext.currentTime)
        osc2.stop(audioContext.currentTime + 0.5)
      }, 600)

      return { success: true, method: "alarm" }
    } catch (error) {
      console.error("[v0] Alarm sound error:", error)
      return { success: false, error: String(error) }
    }
  },

  // Send SMS notification (free service: Twilio sandbox or mock)
  sendSMS: async (phoneNumber: string, message: string, alertId: string) => {
    try {
      const response = await fetch("/api/alerts/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, message, alertId }),
      })

      if (!response.ok) {
        console.warn("[v0] SMS delivery failed, falling back to offline storage")
        return { success: false, method: "sms", error: "SMS service unavailable" }
      }

      return { success: true, method: "sms" }
    } catch (error) {
      console.error("[v0] SMS error:", error)
      return { success: false, method: "sms", error: String(error) }
    }
  },

  // Send Email notification (free service: Mailgun or mock)
  sendEmail: async (email: string, subject: string, message: string, alertId: string) => {
    try {
      const response = await fetch("/api/alerts/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, subject, message, alertId }),
      })

      if (!response.ok) {
        console.warn("[v0] Email delivery failed")
        return { success: false, method: "email", error: "Email service unavailable" }
      }

      return { success: true, method: "email" }
    } catch (error) {
      console.error("[v0] Email error:", error)
      return { success: false, method: "email", error: String(error) }
    }
  },

  // Send Voice notification (free service: mock implementation)
  sendVoiceCall: async (phoneNumber: string, message: string, alertId: string) => {
    try {
      const response = await fetch("/api/alerts/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, message, alertId }),
      })

      if (!response.ok) {
        console.warn("[v0] Voice call failed")
        return { success: false, method: "voice", error: "Voice service unavailable" }
      }

      return { success: true, method: "voice" }
    } catch (error) {
      console.error("[v0] Voice error:", error)
      return { success: false, method: "voice", error: String(error) }
    }
  },

  // Multi-channel notification (try all requested channels)
  sendMultiChannel: async (notification: AlertNotification) => {
    console.log("[v0] Sending multi-channel alert:", notification)

    const results = []

    // Always send in-app
    results.push(await notificationService.sendInAppNotification(notification))

    // Play alarm if critical
    if (notification.severity === "critical") {
      results.push(await notificationService.playAlarmSound())
    }

    // Send to requested channels
    for (const channel of notification.channels) {
      if (channel === "sms" && notification.phoneNumber) {
        results.push(
          await notificationService.sendSMS(notification.phoneNumber, notification.message, notification.alertId),
        )
      } else if (channel === "email" && notification.email) {
        results.push(
          await notificationService.sendEmail(
            notification.email,
            notification.title,
            notification.message,
            notification.alertId,
          ),
        )
      } else if (channel === "voice" && notification.phoneNumber) {
        results.push(
          await notificationService.sendVoiceCall(notification.phoneNumber, notification.message, notification.alertId),
        )
      }
    }

    return results
  },
}

// Local storage utilities for offline mode
export const offlineStorage = {
  // Store alert locally when offline
  saveOfflineAlert: (alert: any) => {
    try {
      const alerts = JSON.parse(localStorage.getItem("offlineAlerts") || "[]")
      alerts.push({ ...alert, savedAt: new Date().toISOString() })
      localStorage.setItem("offlineAlerts", JSON.stringify(alerts))
      return true
    } catch (error) {
      console.error("Error saving offline alert:", error)
      return false
    }
  },

  // Get all offline alerts
  getOfflineAlerts: () => {
    try {
      return JSON.parse(localStorage.getItem("offlineAlerts") || "[]")
    } catch {
      return []
    }
  },

  // Clear offline alerts after syncing
  clearOfflineAlerts: () => {
    localStorage.removeItem("offlineAlerts")
  },

  // Save user preferences
  savePreferences: (prefs: any) => {
    localStorage.setItem("userPreferences", JSON.stringify(prefs))
  },

  // Get user preferences
  getPreferences: () => {
    try {
      return JSON.parse(localStorage.getItem("userPreferences") || "{}")
    } catch {
      return {}
    }
  },

  // Store recent alerts for analytics
  saveRecentAlerts: (alerts: any[]) => {
    localStorage.setItem("recentAlerts", JSON.stringify(alerts))
  },

  // Get recent alerts
  getRecentAlerts: () => {
    try {
      return JSON.parse(localStorage.getItem("recentAlerts") || "[]")
    } catch {
      return []
    }
  },
}

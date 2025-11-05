// API service for backend communication
import { API_CONFIG } from "./config"

export const apiService = {
  // Create new alert
  createAlert: async (alertData: any) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alertData),
      })
      if (!response.ok) throw new Error("Failed to create alert")
      return await response.json()
    } catch (error) {
      console.error("Create alert error:", error)
      throw error
    }
  },

  // Get nearby alerts
  getNearbyAlerts: async (latitude: number, longitude: number, radiusKm = 5) => {
    try {
      const response = await fetch(
        `${API_CONFIG.BACKEND_URL}/api/alerts/nearby?lat=${latitude}&lon=${longitude}&radius=${radiusKm}`,
      )
      if (!response.ok) throw new Error("Failed to fetch nearby alerts")
      return await response.json()
    } catch (error) {
      console.error("Get nearby alerts error:", error)
      return []
    }
  },

  // Get all alerts (admin)
  getAllAlerts: async (filters?: any) => {
    try {
      const params = new URLSearchParams(filters || {})
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/alerts?${params}`)
      if (!response.ok) throw new Error("Failed to fetch alerts")
      return await response.json()
    } catch (error) {
      console.error("Get alerts error:", error)
      return []
    }
  },

  // Update alert status
  updateAlertStatus: async (alertId: string, status: string, responderId?: string) => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, responderId }),
      })
      if (!response.ok) throw new Error("Failed to update alert")
      return await response.json()
    } catch (error) {
      console.error("Update alert error:", error)
      throw error
    }
  },

  // Get analytics
  getAnalytics: async (timeRange = "7d") => {
    try {
      const response = await fetch(`${API_CONFIG.BACKEND_URL}/api/analytics?range=${timeRange}`)
      if (!response.ok) throw new Error("Failed to fetch analytics")
      return await response.json()
    } catch (error) {
      console.error("Get analytics error:", error)
      return null
    }
  },

  // AI crime detection
  detectCrime: async (description: string): Promise<any> => {
    try {
      const response = await fetch(`/api/ai/detect`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      })
      if (!response.ok) throw new Error("Failed to detect crime")
      return await response.json()
    } catch (error) {
      console.error("Crime detection error:", error)
      return null
    }
  },
}

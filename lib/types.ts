// Type definitions for the application
export interface Alert {
  id: string
  userId: string
  type: string
  latitude: number
  longitude: number
  description: string
  timestamp: Date
  status: "pending" | "acknowledged" | "resolved" | "cancelled"
  channels: string[]
  confidenceScore?: number
  responseTime?: number
  responderId?: string
  location?: {
    address: string
    city: string
    state: string
  }
}

export interface User {
  id: string
  email: string
  phone: string
  name: string
  role: "user" | "admin" | "responder"
  preferences: {
    smsAlerts: boolean
    emailAlerts: boolean
    voiceAlerts: boolean
    darkMode: boolean
  }
  emergencyContacts: EmergencyContact[]
  createdAt: Date
}

export interface EmergencyContact {
  id: string
  name: string
  phone: string
  email: string
  relationship: string
}

export interface CrimeHotspot {
  latitude: number
  longitude: number
  intensity: number
  alertCount: number
  lastUpdate: Date
}

export interface Analytics {
  totalAlerts: number
  averageResponseTime: number
  resolvedAlerts: number
  pendingAlerts: number
  alertsByType: Record<string, number>
  alertsByDay: Array<{ date: string; count: number }>
  hotspots: CrimeHotspot[]
}

// API Configuration - Update these with your actual API keys
export const API_CONFIG = {
  TWILIO_ACCOUNT_SID: process.env.NEXT_PUBLIC_TWILIO_ACCOUNT_SID || "",
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN || "",
  TWILIO_PHONE: process.env.NEXT_PUBLIC_TWILIO_PHONE || "+1234567890",

  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY || "",
  SENDGRID_FROM_EMAIL: process.env.NEXT_PUBLIC_SENDGRID_FROM_EMAIL || "noreply@emergencyalert.com",

  // If you need Google Maps, create a server action instead of exposing the key to client

  FIREBASE_CONFIG: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
  },

  BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000",
}

export const CRIME_TYPES = [
  { id: "theft", label: "Theft", color: "#f59e0b" },
  { id: "assault", label: "Assault", color: "#ef4444" },
  { id: "accident", label: "Accident", color: "#f97316" },
  { id: "fire", label: "Fire", color: "#dc2626" },
  { id: "medical", label: "Medical Emergency", color: "#ec4899" },
  { id: "other", label: "Other", color: "#6366f1" },
]

export const ALERT_CHANNELS = {
  SMS: "sms",
  EMAIL: "email",
  VOICE: "voice",
  IN_APP: "in_app",
}

export const RESPONSE_STATUS = {
  PENDING: "pending",
  ACKNOWLEDGED: "acknowledged",
  RESOLVED: "resolved",
  CANCELLED: "cancelled",
}

export const DEFAULT_ALERT_CONTACTS = [
  { type: "police", phone: "+1-911", email: "emergency@police.gov" },
  { type: "ambulance", phone: "+1-911", email: "emergency@ambulance.gov" },
  { type: "fire", phone: "+1-911", email: "emergency@fire.gov" },
]

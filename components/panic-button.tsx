"use client"

import { useState, useRef } from "react"
import { AlertCircle, Loader2, MapPin, CheckCircle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiService } from "@/lib/api-service"
import { offlineStorage } from "@/lib/storage"
import { notificationService } from "@/lib/notification-service"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function PanicButton() {
  const [isActive, setIsActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<"idle" | "confirming" | "sending" | "sent" | "error">("idle")
  const [message, setMessage] = useState("")
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [alertDetails, setAlertDetails] = useState<any>(null)
  const confirmTimeout = useRef<NodeJS.Timeout>()

  const getLocation = (): Promise<{ lat: number; lon: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"))
        return
      }
      navigator.geolocation.getCurrentPosition((position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        })
      }, reject)
    })
  }

  const triggerAlert = async () => {
    setLoading(true)
    setStatus("sending")
    try {
      const coords = await getLocation()
      setLocation(coords)

      const alertData = {
        type: "sos",
        latitude: coords.lat,
        longitude: coords.lon,
        description: "Emergency SOS button triggered",
        timestamp: new Date(),
        channels: ["sms", "email", "in_app"],
        severity: "critical",
      }

      console.log("[v0] Triggering alert:", alertData)

      const notificationPayload = {
        alertId: `alert-${Date.now()}`,
        title: "EMERGENCY ALERT - SOS TRIGGERED",
        message: `Emergency alert at coordinates ${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}`,
        channels: ["sms", "email", "voice"],
        phoneNumber: "+1234567890", // User's number from settings
        email: "admin@emergencyalert.com", // Admin email
        severity: "critical" as const,
      }

      const notificationResults = await notificationService.sendMultiChannel(notificationPayload)
      console.log("[v0] Notification results:", notificationResults)

      try {
        await apiService.createAlert(alertData)
        setStatus("sent")
        setMessage("Alert sent successfully!")
        setAlertDetails(alertData)
      } catch (error) {
        console.log("[v0] Offline - saving locally")
        // If offline, save locally
        offlineStorage.saveOfflineAlert(alertData)
        setStatus("sent")
        setMessage("Alert saved offline - will send when connection restored")
        setAlertDetails(alertData)
      }

      setTimeout(() => {
        setStatus("idle")
        setIsActive(false)
      }, 3000)
    } catch (error) {
      console.error("[v0] Alert trigger error:", error)
      setStatus("error")
      setMessage("Failed to get location. Please enable geolocation.")
      setTimeout(() => setStatus("idle"), 3000)
    } finally {
      setLoading(false)
    }
  }

  const handlePanicPress = () => {
    if (status === "confirming") {
      // Confirmed - send alert
      triggerAlert()
    } else {
      // First press - show confirmation
      setStatus("confirming")
      setMessage("Press again to confirm SOS alert")
      confirmTimeout.current = setTimeout(() => {
        setStatus("idle")
        setMessage("")
      }, 3000)
    }
  }

  const handleCancel = () => {
    if (confirmTimeout.current) {
      clearTimeout(confirmTimeout.current)
    }
    setStatus("idle")
    setMessage("")
    setIsActive(false)
  }

  return (
    <div className="flex flex-col items-center justify-center gap-6 p-6">
      {/* Status Messages */}
      {status === "confirming" && (
        <Alert className="border-red-500 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-500">{message}</AlertDescription>
        </Alert>
      )}

      {status === "sent" && (
        <Alert className="border-green-500 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-500">{message}</AlertDescription>
        </Alert>
      )}

      {status === "error" && (
        <Alert className="border-yellow-500 bg-yellow-500/10">
          <XCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-500">{message}</AlertDescription>
        </Alert>
      )}

      {/* Panic Button */}
      <div className="relative w-40 h-40">
        {status === "confirming" && (
          <div className="absolute inset-0 animate-pulse rounded-full bg-red-500/20 border-2 border-red-500" />
        )}
        <button
          onClick={handlePanicPress}
          disabled={loading || status === "sent"}
          className={`w-full h-full rounded-full font-bold text-2xl text-white transition-all flex items-center justify-center ${
            status === "confirming"
              ? "bg-red-600 hover:bg-red-700 scale-110"
              : status === "sent"
                ? "bg-green-600 cursor-not-allowed"
                : "bg-red-500 hover:bg-red-600 active:scale-95"
          } shadow-lg`}
        >
          {loading ? <Loader2 className="animate-spin" size={32} /> : "SOS"}
        </button>
      </div>

      {/* Location Info */}
      {location && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin size={16} />
          <span>
            {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
          </span>
        </div>
      )}

      {/* Alert Details */}
      {alertDetails && (
        <div className="w-full max-w-md bg-card border border-border rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Alert ID:</span>
            <span className="font-mono text-xs">{alertDetails.timestamp}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type:</span>
            <span className="font-semibold">{alertDetails.type.toUpperCase()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Channels:</span>
            <span>{alertDetails.channels.join(", ").toUpperCase()}</span>
          </div>
        </div>
      )}

      {/* Cancel Button */}
      {status === "confirming" && (
        <Button onClick={handleCancel} variant="outline">
          Cancel
        </Button>
      )}
    </div>
  )
}

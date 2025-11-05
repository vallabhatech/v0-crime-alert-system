"use client"

import { useEffect, useState } from "react"
import { WifiOff, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { offlineStorage } from "@/lib/storage"
import { useOfflineSync } from "@/hooks/use-offline-sync"

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true)
  const [offlineCount, setOfflineCount] = useState(0)
  const { syncStatus } = useOfflineSync()

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      console.log("[v0] Connection restored")
    }

    const handleOffline = () => {
      setIsOnline(false)
      console.log("[v0] Connection lost")
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check for offline alerts
    const alerts = offlineStorage.getOfflineAlerts()
    setOfflineCount(alerts.length)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (isOnline && syncStatus === "idle" && offlineCount === 0) {
    return null
  }

  return (
    <>
      {!isOnline && (
        <Alert className="border-yellow-500 bg-yellow-500/10">
          <WifiOff className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-500">
            You are offline. Alerts will be saved locally and synced when connection is restored.
            {offlineCount > 0 && ` (${offlineCount} pending)`}
          </AlertDescription>
        </Alert>
      )}

      {syncStatus === "syncing" && (
        <Alert className="border-blue-500 bg-blue-500/10">
          <AlertCircle className="h-4 w-4 text-blue-500 animate-spin" />
          <AlertDescription className="text-blue-500">Syncing offline alerts...</AlertDescription>
        </Alert>
      )}

      {syncStatus === "synced" && (
        <Alert className="border-green-500 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-500">Offline alerts synced successfully!</AlertDescription>
        </Alert>
      )}

      {syncStatus === "error" && (
        <Alert className="border-red-500 bg-red-500/10">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-500">
            Failed to sync offline alerts. They are still saved locally.
          </AlertDescription>
        </Alert>
      )}
    </>
  )
}

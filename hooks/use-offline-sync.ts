"use client"

import { useEffect, useState } from "react"
import { offlineStorage } from "@/lib/storage"
import { apiService } from "@/lib/api-service"

export function useOfflineSync() {
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "synced" | "error">("idle")

  useEffect(() => {
    const handleOnline = async () => {
      console.log("[v0] Connection restored, syncing offline alerts...")
      setIsSyncing(true)
      setSyncStatus("syncing")

      try {
        const offlineAlerts = offlineStorage.getOfflineAlerts()

        if (offlineAlerts.length === 0) {
          console.log("[v0] No offline alerts to sync")
          setSyncStatus("synced")
          setIsSyncing(false)
          return
        }

        // Sync each offline alert
        for (const alert of offlineAlerts) {
          try {
            await apiService.createAlert(alert)
            console.log("[v0] Alert synced:", alert.id)
          } catch (error) {
            console.error("[v0] Failed to sync alert:", alert.id, error)
          }
        }

        // Clear offline alerts after successful sync
        offlineStorage.clearOfflineAlerts()
        setSyncStatus("synced")
        console.log("[v0] All offline alerts synced successfully")

        setTimeout(() => setSyncStatus("idle"), 3000)
      } catch (error) {
        console.error("[v0] Sync error:", error)
        setSyncStatus("error")
        setTimeout(() => setSyncStatus("idle"), 3000)
      } finally {
        setIsSyncing(false)
      }
    }

    window.addEventListener("online", handleOnline)

    return () => {
      window.removeEventListener("online", handleOnline)
    }
  }, [])

  return { isSyncing, syncStatus }
}

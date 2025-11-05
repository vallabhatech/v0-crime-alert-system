"use client"

import { Analytics } from "@vercel/analytics/next"
import React from "react"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <OfflineSyncNotification />
      {children}
      <Analytics />
    </>
  )
}

function OfflineSyncNotification() {
  const [mounted, setMounted] = React.useState(false)
  const [offlineCount, setOfflineCount] = React.useState(0)

  React.useEffect(() => {
    setMounted(true)

    // Check for offline alerts
    const checkOfflineAlerts = () => {
      try {
        const alerts = JSON.parse(localStorage.getItem("offlineAlerts") || "[]")
        setOfflineCount(alerts.length)
      } catch {
        setOfflineCount(0)
      }
    }

    checkOfflineAlerts()

    // Listen for online event
    const handleOnline = () => {
      console.log("[v0] Connection restored")
      checkOfflineAlerts()
    }

    window.addEventListener("online", handleOnline)
    return () => window.removeEventListener("online", handleOnline)
  }, [])

  if (!mounted || offlineCount === 0 || navigator.onLine) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 bg-yellow-500/90 text-yellow-950 px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-50">
      Offline mode: {offlineCount} alert{offlineCount > 1 ? "s" : ""} will sync when connected
    </div>
  )
}

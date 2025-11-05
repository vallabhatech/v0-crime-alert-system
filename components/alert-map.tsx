"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import { apiService } from "@/lib/api-service"

interface Alert {
  id: string
  latitude: number
  longitude: number
  type: string
  timestamp: Date
  status: string
}

interface Hotspot {
  latitude: number
  longitude: number
  intensity: number
  alertCount: number
}

export default function AlertMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const position = await new Promise<GeolocationCoordinates>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition((pos) => resolve(pos.coords), reject, { timeout: 5000 })
        })

        setUserLocation({ lat: position.latitude, lon: position.longitude })

        // Fetch nearby alerts
        const nearbyAlerts = await apiService.getNearbyAlerts(position.latitude, position.longitude, 10)
        console.log("[v0] Nearby alerts:", nearbyAlerts)
        setAlerts(nearbyAlerts)
      } catch (error) {
        console.log("[v0] Location error, using mock data:", error)
        // Fallback to mock data
        setUserLocation({ lat: 40.7128, lon: -74.006 })
        setAlerts([
          {
            id: "1",
            latitude: 40.715,
            longitude: -74.008,
            type: "theft",
            timestamp: new Date(),
            status: "pending",
          },
          {
            id: "2",
            latitude: 40.71,
            longitude: -74.005,
            type: "assault",
            timestamp: new Date(Date.now() - 300000),
            status: "acknowledged",
          },
          {
            id: "3",
            latitude: 40.72,
            longitude: -74.01,
            type: "fire",
            timestamp: new Date(Date.now() - 600000),
            status: "resolved",
          },
        ])
      }
    }

    getUserLocation()
  }, [])

  useEffect(() => {
    if (alerts.length === 0) return

    const hotspotMap = new Map<string, Hotspot>()

    alerts.forEach((alert) => {
      // Round to nearest 0.01 degree (~1km)
      const lat = Math.round(alert.latitude * 100) / 100
      const lon = Math.round(alert.longitude * 100) / 100
      const key = `${lat},${lon}`

      const existing = hotspotMap.get(key)
      if (existing) {
        existing.alertCount++
        existing.intensity = Math.min(1, existing.intensity + 0.1)
      } else {
        hotspotMap.set(key, {
          latitude: lat,
          longitude: lon,
          intensity: 0.5,
          alertCount: 1,
        })
      }
    })

    setHotspots(Array.from(hotspotMap.values()))
  }, [alerts])

  useEffect(() => {
    if (!canvasRef.current || !userLocation) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const width = canvas.width
    const height = canvas.height

    // Animation frame
    const animate = () => {
      // Background
      ctx.fillStyle = "#0f172a"
      ctx.fillRect(0, 0, width, height)

      // Grid
      ctx.strokeStyle = "#1e293b"
      ctx.lineWidth = 1
      for (let i = 0; i <= width; i += 50) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, height)
        ctx.stroke()
      }
      for (let i = 0; i <= height; i += 50) {
        ctx.beginPath()
        ctx.moveTo(0, i)
        ctx.lineTo(width, i)
        ctx.stroke()
      }

      // Calculate bounds
      const allPoints = [userLocation, ...alerts]
      let minLat = allPoints[0].latitude
      let maxLat = minLat
      let minLon = allPoints[0].longitude
      let maxLon = minLon

      allPoints.forEach((p) => {
        minLat = Math.min(minLat, p.latitude)
        maxLat = Math.max(maxLat, p.latitude)
        minLon = Math.min(minLon, p.longitude)
        maxLon = Math.max(maxLon, p.longitude)
      })

      // Add padding
      const latRange = (maxLat - minLat) * 0.2 || 0.1
      const lonRange = (maxLon - minLon) * 0.2 || 0.1
      minLat -= latRange
      maxLat += latRange
      minLon -= lonRange
      maxLon += lonRange

      const latToY = (lat: number) => ((maxLat - lat) / (maxLat - minLat)) * height
      const lonToX = (lon: number) => ((lon - minLon) / (maxLon - minLon)) * width

      // Draw hotspots (heatmap)
      hotspots.forEach((hotspot) => {
        const x = lonToX(hotspot.longitude)
        const y = latToY(hotspot.latitude)

        // Pulsing glow effect
        const pulse = (Math.sin(Date.now() / 500) + 1) / 2
        const radius = 20 + pulse * 10

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
        gradient.addColorStop(0, `rgba(239, 68, 68, ${0.6 * hotspot.intensity})`)
        gradient.addColorStop(0.5, `rgba(239, 68, 68, ${0.3 * hotspot.intensity})`)
        gradient.addColorStop(1, "rgba(239, 68, 68, 0)")

        ctx.fillStyle = gradient
        ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2)
      })

      // Draw alert points
      alerts.forEach((alert) => {
        const x = lonToX(alert.longitude)
        const y = latToY(alert.latitude)

        // Color by status
        const statusColor =
          alert.status === "pending" ? "#ef4444" : alert.status === "acknowledged" ? "#fbbf24" : "#22c55e"

        // Point with border
        ctx.fillStyle = statusColor
        ctx.beginPath()
        ctx.arc(x, y, 5, 0, Math.PI * 2)
        ctx.fill()

        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.stroke()
      })

      // Draw user location (center with special marker)
      if (userLocation) {
        const x = lonToX(userLocation.lon)
        const y = latToY(userLocation.lat)

        // Outer rings (pulsing)
        const pulse = (Math.sin(Date.now() / 300) + 1) / 2
        ctx.strokeStyle = `rgba(59, 130, 246, ${0.5 * pulse})`
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.arc(x, y, 12 + pulse * 5, 0, Math.PI * 2)
        ctx.stroke()

        // Inner circle
        ctx.fillStyle = "#3b82f6"
        ctx.beginPath()
        ctx.arc(x, y, 6, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = "#ffffff"
        ctx.beginPath()
        ctx.arc(x, y, 3, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw legend
      const legendX = 15
      let legendY = 15

      ctx.fillStyle = "#ffffff"
      ctx.font = "12px sans-serif"
      ctx.fillText("Legend:", legendX, legendY)
      legendY += 18

      // Pending
      ctx.fillStyle = "#ef4444"
      ctx.fillRect(legendX, legendY - 4, 8, 8)
      ctx.fillStyle = "#e0e7ff"
      ctx.fillText("Pending", legendX + 12, legendY)
      legendY += 14

      // Acknowledged
      ctx.fillStyle = "#fbbf24"
      ctx.fillRect(legendX, legendY - 4, 8, 8)
      ctx.fillStyle = "#e0e7ff"
      ctx.fillText("Acknowledged", legendX + 12, legendY)
      legendY += 14

      // Resolved
      ctx.fillStyle = "#22c55e"
      ctx.fillRect(legendX, legendY - 4, 8, 8)
      ctx.fillStyle = "#e0e7ff"
      ctx.fillText("Resolved", legendX + 12, legendY)

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [userLocation, alerts, hotspots])

  return (
    <Card className="w-full bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Live Alert Map
        </CardTitle>
        <CardDescription>Real-time crime hotspots and nearby alerts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="w-full border border-border rounded-lg bg-slate-900"
          />

          {/* Alert Statistics */}
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-secondary p-3 rounded-lg">
              <p className="text-muted-foreground">Total Alerts</p>
              <p className="text-lg font-bold">{alerts.length}</p>
            </div>
            <div className="bg-secondary p-3 rounded-lg">
              <p className="text-muted-foreground">Hotspots</p>
              <p className="text-lg font-bold">{hotspots.length}</p>
            </div>
            <div className="bg-secondary p-3 rounded-lg">
              <p className="text-muted-foreground">Your Location</p>
              <p className="text-xs font-mono">
                {userLocation ? `${userLocation.lat.toFixed(2)}, ${userLocation.lon.toFixed(2)}` : "N/A"}
              </p>
            </div>
          </div>

          {/* Recent Alerts List */}
          {alerts.length > 0 && (
            <div className="border border-border rounded-lg p-3 max-h-48 overflow-y-auto">
              <p className="text-sm font-semibold mb-2">Recent Alerts</p>
              <div className="space-y-2">
                {alerts.slice(0, 5).map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between text-xs p-2 bg-secondary rounded">
                    <div>
                      <p className="font-semibold capitalize">{alert.type}</p>
                      <p className="text-muted-foreground">
                        {alert.latitude.toFixed(3)}, {alert.longitude.toFixed(3)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-white font-semibold ${
                        alert.status === "pending"
                          ? "bg-red-500"
                          : alert.status === "acknowledged"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                    >
                      {alert.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

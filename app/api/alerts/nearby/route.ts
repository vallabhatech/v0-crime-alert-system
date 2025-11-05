import type { Alert } from "@/lib/types"

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // Radius of the earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const lat = Number.parseFloat(searchParams.get("lat") || "0")
  const lon = Number.parseFloat(searchParams.get("lon") || "0")
  const radius = Number.parseFloat(searchParams.get("radius") || "5")

  // Mock alerts - in production, fetch from database with geospatial query
  const mockAlerts: Alert[] = [
    {
      id: "1",
      userId: "user1",
      type: "theft",
      latitude: 40.715,
      longitude: -74.008,
      description: "Car break-in",
      timestamp: new Date(),
      status: "pending",
      channels: ["sms"],
      confidenceScore: 0.95,
    },
    {
      id: "2",
      userId: "user2",
      type: "assault",
      latitude: 40.71,
      longitude: -74.005,
      description: "Street assault reported",
      timestamp: new Date(),
      status: "acknowledged",
      channels: ["voice"],
      confidenceScore: 0.88,
    },
  ]

  const nearbyAlerts = mockAlerts.filter((alert) => {
    const distance = getDistanceFromLatLonInKm(lat, lon, alert.latitude, alert.longitude)
    return distance <= radius
  })

  return Response.json(nearbyAlerts)
}

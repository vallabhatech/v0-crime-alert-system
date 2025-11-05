import type { Alert } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const alert: Alert = {
      id: `alert-${Date.now()}`,
      userId: body.userId || "anonymous",
      type: body.type || "other",
      latitude: body.latitude || 0,
      longitude: body.longitude || 0,
      description: body.description || "",
      timestamp: new Date(),
      status: "pending",
      channels: body.channels || ["sms", "email"],
      confidenceScore: body.confidenceScore || 0.8,
    }

    console.log("[v0] Alert created:", alert)

    // Here you would save to Firebase/MongoDB
    // For now, return the created alert
    return Response.json(alert)
  } catch (error) {
    console.error("[v0] Failed to create alert:", error)
    return Response.json({ error: "Failed to create alert" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type")
  const status = searchParams.get("status")

  // Mock data - in production, fetch from database
  const mockAlerts: Alert[] = [
    {
      id: "1",
      userId: "user1",
      type: "theft",
      latitude: 40.7128,
      longitude: -74.006,
      description: "Car break-in on Main St",
      timestamp: new Date(),
      status: "acknowledged",
      channels: ["sms"],
      confidenceScore: 0.95,
    },
  ]

  let filtered = mockAlerts

  if (type) {
    filtered = filtered.filter((a) => a.type === type)
  }

  if (status) {
    filtered = filtered.filter((a) => a.status === status)
  }

  return Response.json(filtered)
}

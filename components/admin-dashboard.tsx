"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CheckCircle2, Clock, AlertCircle, Search, RefreshCw } from "lucide-react"
import { apiService } from "@/lib/api-service"

interface AlertData {
  id: string
  type: string
  latitude: number
  longitude: number
  timestamp: string
  status: string
  description: string
  confidenceScore?: number
}

export default function AdminDashboard() {
  const [alerts, setAlerts] = useState<AlertData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null)

  useEffect(() => {
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [filter])

  const fetchAlerts = async () => {
    try {
      const filters = filter !== "all" ? { status: filter } : undefined
      const data = await apiService.getAllAlerts(filters)
      setAlerts(data || [])
    } catch (error) {
      console.error("[v0] Failed to fetch alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateAlertStatus = async (alertId: string, newStatus: string) => {
    try {
      console.log("[v0] Updating alert status:", { alertId, newStatus })
      await apiService.updateAlertStatus(alertId, newStatus, "admin-user")
      fetchAlerts()
    } catch (error) {
      console.error("[v0] Failed to update alert:", error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "resolved":
        return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case "acknowledged":
        return <Clock className="w-4 h-4 text-yellow-500" />
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: "destructive",
      acknowledged: "default",
      resolved: "secondary",
    }
    return variants[status] || "default"
  }

  const filteredAlerts = alerts.filter(
    (alert) =>
      alert.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const stats = {
    total: alerts.length,
    pending: alerts.filter((a) => a.status === "pending").length,
    acknowledged: alerts.filter((a) => a.status === "acknowledged").length,
    resolved: alerts.filter((a) => a.status === "resolved").length,
    avgResponseTime: alerts.length > 0 ? Math.round(Math.random() * 300) : 0, // Mock
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Alert Dashboard</h2>
          <p className="text-muted-foreground">Manage and respond to active emergencies</p>
        </div>
        <Button onClick={fetchAlerts} variant="outline" size="sm" className="gap-2 bg-transparent">
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-red-500/20">
          <CardContent className="pt-6">
            <p className="text-sm text-red-500">Pending</p>
            <p className="text-2xl font-bold text-red-500">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-yellow-500/20">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-500">Acknowledged</p>
            <p className="text-2xl font-bold text-yellow-500">{stats.acknowledged}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-green-500/20">
          <CardContent className="pt-6">
            <p className="text-sm text-green-500">Resolved</p>
            <p className="text-2xl font-bold text-green-500">{stats.resolved}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Avg Response</p>
            <p className="text-2xl font-bold">{stats.avgResponseTime}s</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-2 flex-wrap">
        <div className="flex-1 min-w-64 relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search alerts by type or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          {["all", "pending", "acknowledged", "resolved"].map((status) => (
            <Button
              key={status}
              variant={filter === status ? "default" : "outline"}
              onClick={() => setFilter(status)}
              size="sm"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {loading ? (
          <Card className="bg-card">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Loading alerts...</p>
            </CardContent>
          </Card>
        ) : filteredAlerts.length === 0 ? (
          <Card className="bg-card">
            <CardContent className="pt-6">
              <p className="text-muted-foreground">{searchTerm ? "No alerts match your search" : "No alerts found"}</p>
            </CardContent>
          </Card>
        ) : (
          filteredAlerts.map((alert) => (
            <Card
              key={alert.id}
              className={`bg-card border-border hover:border-primary transition-colors cursor-pointer ${
                selectedAlert === alert.id ? "border-primary border-2" : ""
              }`}
              onClick={() => setSelectedAlert(selectedAlert === alert.id ? null : alert.id)}
            >
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(alert.status)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-semibold capitalize">{alert.type}</p>
                        <Badge variant={getStatusBadge(alert.status)}>{alert.status}</Badge>
                        {alert.confidenceScore && (
                          <Badge variant="outline">Confidence: {Math.round(alert.confidenceScore * 100)}%</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                      <p className="text-xs text-muted-foreground">
                        <strong>Location:</strong> {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)} •{" "}
                        <strong>Time:</strong> {new Date(alert.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 flex-shrink-0">
                    {alert.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-yellow-600 hover:bg-yellow-700"
                          onClick={(e) => {
                            e.stopPropagation()
                            updateAlertStatus(alert.id, "acknowledged")
                          }}
                        >
                          Acknowledge
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            updateAlertStatus(alert.id, "cancelled")
                          }}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {alert.status === "acknowledged" && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={(e) => {
                          e.stopPropagation()
                          updateAlertStatus(alert.id, "resolved")
                        }}
                      >
                        Resolve
                      </Button>
                    )}
                    {alert.status === "resolved" && <Badge variant="secondary">Completed</Badge>}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

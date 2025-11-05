"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts"
import { CRIME_TYPES } from "@/lib/config"
import { TrendingUp, Clock, AlertCircle, CheckCircle } from "lucide-react"

interface AnalyticsData {
  totalAlerts: number
  averageResponseTime: number
  resolvedAlerts: number
  pendingAlerts: number
  alertsByType: Record<string, number>
  alertsByDay: Array<{ date: string; count: number }>
}

export default function AnalyticsView() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      console.log("[v0] Fetching analytics for range:", timeRange)

      // Mock analytics data
      const mockData: AnalyticsData = {
        totalAlerts: 143,
        averageResponseTime: 12,
        resolvedAlerts: 98,
        pendingAlerts: 8,
        alertsByType: {
          theft: 45,
          assault: 32,
          accident: 38,
          fire: 12,
          medical: 16,
        },
        alertsByDay: [
          { date: "Mon", count: 18 },
          { date: "Tue", count: 24 },
          { date: "Wed", count: 19 },
          { date: "Thu", count: 22 },
          { date: "Fri", count: 28 },
          { date: "Sat", count: 20 },
          { date: "Sun", count: 14 },
        ],
      }

      setData(mockData)
    } catch (error) {
      console.error("[v0] Failed to fetch analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-card">
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Loading analytics...</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card className="bg-card">
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No analytics data available</p>
        </CardContent>
      </Card>
    )
  }

  const pieData = Object.entries(data.alertsByType).map(([type, count]) => ({
    name: CRIME_TYPES.find((c) => c.id === type)?.label || type,
    value: count,
    color: CRIME_TYPES.find((c) => c.id === type)?.color || "#6366f1",
  }))

  return (
    <div className="space-y-6">
      {/* Header with Time Range */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics & Reports</h2>
          <p className="text-muted-foreground">Monitor crime trends and response metrics</p>
        </div>
        <div className="flex gap-2">
          {["7d", "30d", "90d"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                timeRange === range
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-foreground hover:bg-secondary/80"
              }`}
            >
              {range === "7d" ? "Week" : range === "30d" ? "Month" : "Quarter"}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Total Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{data.totalAlerts}</p>
            <p className="text-xs text-muted-foreground mt-2">All time period</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-500 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-500">{data.pendingAlerts}</p>
            <p className="text-xs text-muted-foreground mt-2">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-green-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-500 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Resolved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">{data.resolvedAlerts}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round((data.resolvedAlerts / data.totalAlerts) * 100)}% resolution rate
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Avg Response
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{Math.round(data.averageResponseTime)}m</p>
            <p className="text-xs text-muted-foreground mt-2">Average time to first response</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Alerts Over Time (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.alertsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                  cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Alert Distribution by Type</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1e293b", border: "1px solid #334155" }}
                  formatter={(value: any) => [`${value} alerts`, "Count"]}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Crime Type Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left py-2 px-3">Crime Type</th>
                  <th className="text-right py-2 px-3">Count</th>
                  <th className="text-right py-2 px-3">Percentage</th>
                  <th className="text-right py-2 px-3">Trend</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.alertsByType).map(([type, count]) => {
                  const percentage = ((count / data.totalAlerts) * 100).toFixed(1)
                  const crimeType = CRIME_TYPES.find((c) => c.id === type)
                  return (
                    <tr key={type} className="border-b border-border hover:bg-secondary/50 transition-colors">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: crimeType?.color || "#6366f1" }}
                          />
                          {crimeType?.label || type}
                        </div>
                      </td>
                      <td className="text-right py-2 px-3 font-semibold">{count}</td>
                      <td className="text-right py-2 px-3">{percentage}%</td>
                      <td className="text-right py-2 px-3 text-muted-foreground">{Math.random() > 0.5 ? "↑" : "↓"}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

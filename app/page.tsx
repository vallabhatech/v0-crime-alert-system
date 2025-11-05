"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Map, BarChart3, Settings, Zap } from "lucide-react"
import PanicButton from "@/components/panic-button"
import CrimeDetector from "@/components/crime-detector"
import AlertMap from "@/components/alert-map"
import AdminDashboard from "@/components/admin-dashboard"
import AnalyticsView from "@/components/analytics-view"
import SettingsPanel from "@/components/settings-panel"

export default function Home() {
  const [role, setRole] = useState<"user" | "admin">("user")

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Emergency Alert System</h1>
                <p className="text-sm text-muted-foreground">AI-powered real-time crime detection</p>
              </div>
            </div>
            <div className="flex gap-2">
              {["user", "admin"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRole(r as "user" | "admin")}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    role === r ? "bg-primary text-primary-foreground" : "bg-input text-foreground hover:bg-input/80"
                  }`}
                >
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {role === "user" ? (
            <Tabs defaultValue="sos" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-secondary">
                <TabsTrigger value="sos" className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  SOS
                </TabsTrigger>
                <TabsTrigger value="detector" className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Detect
                </TabsTrigger>
                <TabsTrigger value="map" className="flex items-center gap-2">
                  <Map className="w-4 h-4" />
                  Map
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              <TabsContent value="sos" className="mt-6">
                <PanicButton />
              </TabsContent>

              <TabsContent value="detector" className="mt-6">
                <CrimeDetector />
              </TabsContent>

              <TabsContent value="map" className="mt-6">
                <AlertMap />
              </TabsContent>

              <TabsContent value="settings" className="mt-6">
                <SettingsPanel />
              </TabsContent>
            </Tabs>
          ) : (
            <Tabs defaultValue="dashboard" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-secondary">
                <TabsTrigger value="dashboard" className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="dashboard" className="mt-6">
                <AdminDashboard />
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <AnalyticsView />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </main>
  )
}

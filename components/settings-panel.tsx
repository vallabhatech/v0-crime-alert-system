"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Moon, Sun, Download, Trash2, AlertCircle, CheckCircle } from "lucide-react"
import { offlineStorage } from "@/lib/storage"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SettingsPanel() {
  const [darkMode, setDarkMode] = useState(true)
  const [offlineAlerts, setOfflineAlerts] = useState(0)
  const [showAlert, setShowAlert] = useState<string | null>(null)
  const [preferences, setPreferences] = useState({
    smsAlerts: true,
    emailAlerts: true,
    voiceAlerts: true,
    locationTracking: true,
    phoneNumber: "+1-800-0000",
    email: "user@example.com",
  })

  useEffect(() => {
    const savedPrefs = offlineStorage.getPreferences()
    if (Object.keys(savedPrefs).length > 0) {
      setPreferences((prev) => ({ ...prev, ...savedPrefs }))
    }

    const offline = offlineStorage.getOfflineAlerts()
    setOfflineAlerts(offline.length)
    console.log("[v0] Offline alerts found:", offline.length)
  }, [])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle("dark")
  }

  const updatePreferences = (key: string, value: boolean | string) => {
    const newPrefs = { ...preferences, [key]: value }
    setPreferences(newPrefs)
  }

  const savePreferences = () => {
    offlineStorage.savePreferences(preferences)
    setShowAlert("success")
    setTimeout(() => setShowAlert(null), 3000)
    console.log("[v0] Preferences saved:", preferences)
  }

  const clearOfflineAlerts = () => {
    offlineStorage.clearOfflineAlerts()
    setOfflineAlerts(0)
    setShowAlert("cleared")
    setTimeout(() => setShowAlert(null), 3000)
    console.log("[v0] Offline alerts cleared")
  }

  const exportData = () => {
    const data = {
      preferences,
      offlineAlerts: offlineStorage.getOfflineAlerts(),
      exportDate: new Date().toISOString(),
    }

    const dataStr = JSON.stringify(data, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `emergency-alert-backup-${Date.now()}.json`
    link.click()
    URL.revokeObjectURL(url)
    console.log("[v0] Data exported")
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Manage your preferences, alert channels, and offline data</p>
      </div>

      {/* Status Alerts */}
      {showAlert === "success" && (
        <Alert className="border-green-500 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-500">Preferences saved successfully!</AlertDescription>
        </Alert>
      )}

      {showAlert === "cleared" && (
        <Alert className="border-blue-500 bg-blue-500/10">
          <CheckCircle className="h-4 w-4 text-blue-500" />
          <AlertDescription className="text-blue-500">Offline alerts cleared</AlertDescription>
        </Alert>
      )}

      {/* Offline Mode Status */}
      {offlineAlerts > 0 && (
        <Alert className="border-yellow-500 bg-yellow-500/10">
          <AlertCircle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-yellow-500">
            {offlineAlerts} alert{offlineAlerts > 1 ? "s" : ""} saved offline - will sync when connection restored
          </AlertDescription>
        </Alert>
      )}

      {/* Theme */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize how the app looks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              <span>{darkMode ? "Dark Mode" : "Light Mode"}</span>
            </div>
            <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
          </div>
        </CardContent>
      </Card>

      {/* Alert Channels */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Alert Channels</CardTitle>
          <CardDescription>Choose how you want to receive emergency alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>SMS Alerts</span>
            <Switch checked={preferences.smsAlerts} onCheckedChange={(val) => updatePreferences("smsAlerts", val)} />
          </div>
          <div className="flex items-center justify-between">
            <span>Email Alerts</span>
            <Switch
              checked={preferences.emailAlerts}
              onCheckedChange={(val) => updatePreferences("emailAlerts", val)}
            />
          </div>
          <div className="flex items-center justify-between">
            <span>Voice Calls</span>
            <Switch
              checked={preferences.voiceAlerts}
              onCheckedChange={(val) => updatePreferences("voiceAlerts", val)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>Update your phone number and email for alerts</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Phone Number</label>
            <Input
              type="tel"
              value={preferences.phoneNumber}
              onChange={(e) => updatePreferences("phoneNumber", e.target.value)}
              placeholder="+1-800-0000"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Email Address</label>
            <Input
              type="email"
              value={preferences.email}
              onChange={(e) => updatePreferences("email", e.target.value)}
              placeholder="user@example.com"
            />
          </div>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Privacy & Security</CardTitle>
          <CardDescription>Control location and data sharing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Location Tracking</span>
            <Switch
              checked={preferences.locationTracking}
              onCheckedChange={(val) => updatePreferences("locationTracking", val)}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Your location is only used for emergency alerts and is never shared with third parties without your consent.
          </p>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Export or clear your local data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-secondary rounded-lg">
            <div>
              <p className="font-semibold">Offline Alerts Stored</p>
              <p className="text-sm text-muted-foreground">{offlineAlerts} alert(s) saved locally</p>
            </div>
            {offlineAlerts > 0 && (
              <Button size="sm" variant="destructive" onClick={clearOfflineAlerts} className="gap-2">
                <Trash2 className="w-4 h-4" />
                Clear
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={exportData} className="flex-1 gap-2 bg-primary hover:bg-primary/90">
              <Download className="w-4 h-4" />
              Export Data
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Exporting data creates a backup of your preferences and offline alerts that can be restored later.
          </p>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex gap-2">
        <Button onClick={savePreferences} className="flex-1 bg-primary hover:bg-primary/90">
          Save All Preferences
        </Button>
      </div>
    </div>
  )
}

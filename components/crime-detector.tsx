"use client"

import { useState, useRef } from "react"
import { Mic, Send, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiService } from "@/lib/api-service"
import { CRIME_TYPES } from "@/lib/config"

interface DetectionResult {
  type: string
  confidence: number
  explanation: string
  recommended_channels: string[]
}

export default function CrimeDetector() {
  const [description, setDescription] = useState("")
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<DetectionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const audioChunks = useRef<Blob[]>([])

  const startRecording = async () => {
    try {
      setError(null)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder.current = new MediaRecorder(stream)
      audioChunks.current = []

      mediaRecorder.current.ondataavailable = (event) => {
        audioChunks.current.push(event.data)
      }

      mediaRecorder.current.start()
      setRecording(true)
    } catch (error) {
      setError("Microphone access denied")
      console.error("Recording failed:", error)
    }
  }

  const stopRecording = async () => {
    if (mediaRecorder.current) {
      mediaRecorder.current.stop()
      setRecording(false)

      mediaRecorder.current.onstop = async () => {
        const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" })
        console.log("[v0] Audio blob created, attempting transcription")

        try {
          const recognition = new (window as any).webkitSpeechRecognition()
          recognition.start()

          recognition.onresult = async (event: any) => {
            const transcript = Array.from(event.results)
              .map((result: any) => result[0].transcript)
              .join("")

            console.log("[v0] Transcribed audio:", transcript)
            if (transcript) {
              setDescription(transcript)
              await detectCrime(transcript)
            }
          }

          recognition.onerror = (event: any) => {
            setError("Could not transcribe audio. Please try text input instead.")
            console.error("[v0] Speech recognition error:", event.error)
          }
        } catch (error) {
          setError("Speech recognition not available. Please use text input.")
          console.error("[v0] Speech API error:", error)
        }
      }
    }
  }

  const detectCrime = async (text: string) => {
    if (!text.trim()) {
      setError("Please enter a description")
      return
    }

    setLoading(true)
    setError(null)
    console.log("[v0] Starting crime detection for:", text)

    try {
      const result = await apiService.detectCrime(text)
      if (result) {
        console.log("[v0] Detection result:", result)
        setResult(result)
      } else {
        setError("Detection failed. Please try again.")
      }
    } catch (error) {
      setError("An error occurred during detection")
      console.error("[v0] Detection error:", error)
    } finally {
      setLoading(false)
    }
  }

  const crimeTypeLabel = CRIME_TYPES.find((c) => c.id === result?.type)?.label || result?.type

  return (
    <div className="space-y-6">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle>AI Crime Detection</CardTitle>
          <CardDescription>Describe the incident using text or voice for AI analysis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              setError(null)
            }}
            placeholder="Describe what you witnessed... (e.g., 'I see someone breaking into a car on Main Street')"
            className="w-full min-h-24 p-3 bg-input border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />

          {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950 p-2 rounded">{error}</p>}

          <div className="flex gap-2">
            <Button
              onClick={recording ? stopRecording : startRecording}
              variant={recording ? "destructive" : "outline"}
              className="flex-1"
              disabled={loading}
            >
              <Mic className="w-4 h-4 mr-2" />
              {recording ? "Stop Recording" : "Start Recording"}
            </Button>

            <Button
              onClick={() => detectCrime(description)}
              disabled={loading || description.trim().length === 0}
              className="flex-1 bg-primary hover:bg-primary/90"
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Analyze
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detection Result */}
      {result && (
        <Card className="bg-card border-accent">
          <CardHeader className="border-b border-accent">
            <CardTitle className="text-accent">Detection Result</CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Crime Type</p>
                <p className="font-bold text-lg text-accent">{crimeTypeLabel}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Confidence</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-input rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all"
                      style={{ width: `${Math.round((result.confidence || 0) * 100)}%` }}
                    />
                  </div>
                  <span className="font-bold text-accent">{Math.round((result.confidence || 0) * 100)}%</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Explanation</p>
              <p className="text-foreground bg-input p-3 rounded-lg">{result.explanation}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground mb-2">Recommended Alert Channels</p>
              <div className="flex flex-wrap gap-2">
                {result.recommended_channels.map((channel) => (
                  <span key={channel} className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                    {channel.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground">Create Alert</Button>
              <Button variant="outline" onClick={() => setResult(null)}>
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export const geoUtils = {
  // Calculate distance between two points in kilometers
  calculateDistance: (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  },

  // Get user's current location
  getUserLocation: (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"))
        return
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          console.error("[v0] Geolocation error:", error)
          reject(error)
        },
        {
          timeout: 10000,
          enableHighAccuracy: true,
        },
      )
    })
  },

  // Find nearby alerts
  findNearbyAlerts: (alerts: any[], userLat: number, userLon: number, radiusKm = 5) => {
    return alerts.filter((alert) => {
      const distance = geoUtils.calculateDistance(userLat, userLon, alert.latitude, alert.longitude)
      return distance <= radiusKm
    })
  },

  // Generate hotspot clusters
  generateHotspots: (alerts: any[], gridSize = 0.01) => {
    const clusters = new Map<string, any[]>()

    alerts.forEach((alert) => {
      const latBucket = Math.round(alert.latitude / gridSize)
      const lonBucket = Math.round(alert.longitude / gridSize)
      const key = `${latBucket},${lonBucket}`

      if (!clusters.has(key)) {
        clusters.set(key, [])
      }
      clusters.get(key)!.push(alert)
    })

    return Array.from(clusters.entries()).map(([key, items]) => {
      const [latBucket, lonBucket] = key.split(",").map(Number)
      const lat = latBucket * gridSize
      const lon = lonBucket * gridSize

      return {
        latitude: lat,
        longitude: lon,
        intensity: Math.min(1, items.length / 10),
        alertCount: items.length,
      }
    })
  },
}

import axios from "axios";

export interface GeoLocation {
  country: string | null;
  city: string | null;
  lat: number | null;
  lon: number | null;
}

const cache = new Map<string, GeoLocation>();

export async function getLocationFromIP(ip: string): Promise<GeoLocation> {
  if (!ip || ip === "unknown" || ip === "::1" || ip === "127.0.0.1" || ip.startsWith("::ffff:127.")) {
    return { country: null, city: null, lat: null, lon: null };
  }

  // Check cache
  if (cache.has(ip)) {
    return cache.get(ip)!;
  }

  try {
    // Use ip-api.com (free, no API key required, 45 requests per minute)
    const response = await axios.get(`http://ip-api.com/json/${ip}`, {
      timeout: 5000,
    });

    if (response.data.status === "success") {
      const location: GeoLocation = {
        country: response.data.country || null,
        city: response.data.city || null,
        lat: response.data.lat || null,
        lon: response.data.lon || null,
      };
      
      // Cache the result
      cache.set(ip, location);
      
      return location;
    }
  } catch (error) {
    console.error("GeoIP lookup failed:", error);
  }

  const fallback = { country: null, city: null, lat: null, lon: null };
  cache.set(ip, fallback);
  return fallback;
}

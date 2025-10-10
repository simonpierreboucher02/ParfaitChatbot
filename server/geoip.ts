import axios from "axios";

export interface GeoLocation {
  country: string | null;
  city: string | null;
  lat: number | null;
  lon: number | null;
}

const cache = new Map<string, GeoLocation>();

function isPrivateIP(ip: string): boolean {
  // Check for localhost
  if (ip === "::1" || ip === "127.0.0.1" || ip.startsWith("::ffff:127.")) {
    return true;
  }
  
  // Check for private IPv4 ranges
  const parts = ip.split('.');
  if (parts.length === 4) {
    const first = parseInt(parts[0]);
    const second = parseInt(parts[1]);
    
    // 10.0.0.0 - 10.255.255.255
    if (first === 10) return true;
    
    // 172.16.0.0 - 172.31.255.255
    if (first === 172 && second >= 16 && second <= 31) return true;
    
    // 192.168.0.0 - 192.168.255.255
    if (first === 192 && second === 168) return true;
  }
  
  return false;
}

export async function getLocationFromIP(ip: string): Promise<GeoLocation> {
  if (!ip || ip === "unknown" || isPrivateIP(ip)) {
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

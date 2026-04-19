import type { ApiResponse } from "~/types/api"

export async function apiRequest<T>(url: string, options?: RequestInit): Promise<T | null> {
  const config = useRuntimeConfig()
  const BASE_API_URL = config.public.apiBase as string

  try {
    const baseUrl = url.startsWith('http') ? url : BASE_API_URL + url
    
    // Auto add trailing slash to base if missing, and remove it from url start if present
    const cleanBase = BASE_API_URL.endsWith('/') ? BASE_API_URL : `${BASE_API_URL}/`
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url
    const finalUrl = url.startsWith('http') ? url : `${cleanBase}${cleanUrl}`

    const res = await fetch(finalUrl, options)
    
    // Handle non-JSON responses (like binary for Excel)
    const contentType = res.headers.get('content-type')
    if (contentType && !contentType.includes('application/json')) {
       if (res.ok) {
         return res as any // Return raw response only if successful (e.g. for binary/blob)
       }
       console.error(`API Error: Received non-JSON response with status ${res.status}`)
       return null
    }

    const json = await res.json()

    // Handle case where body is a direct array (e.g. some 'all=true' endpoints)
    if (Array.isArray(json)) {
      return json as T
    }

    // Handle standard { success: boolean, data: T, message?: string } response
    if (json && typeof json === 'object' && 'success' in json) {
      if (!json.success) {
        console.error(`API Error: ${json.message}`)
        if (process.client) {
          alert(`❌ API Error: ${json.message}`)
        }
        return null
      }
      return json.data
    }

    // Fallback if it's a valid object but not in standard format
    return json as T
  } catch (err: any) {
    console.error('Network error:', err)
    if (process.client) {
      alert(`❌ Network error: ${err.message || err}`)
    }
    return null
  }
}

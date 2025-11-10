/**
 * API Configuration
 * Configures the generated API client with the appropriate base URL
 */

import { client } from "@/generated/api/client.gen";

/**
 * Get the API base URL from environment variables
 * Falls back to localhost:8080 if not set
 */
const getApiBaseUrl = (): string => {
  // In development, use the env variable or default to localhost:8080
  // In production, use the env variable (should be set in .env.production)
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
  
  // Remove trailing slash if present
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
};

/**
 * Get the authentication token from localStorage
 */
const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

/**
 * Configure the API client with the base URL and other common settings
 */
export function initializeApiClient(): void {
  const baseUrl = getApiBaseUrl();
  
  console.log(`[API Config] Initializing API client with base URL: ${baseUrl}`);
  
  client.setConfig({
    baseUrl,
    // Add common headers or other configuration here
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Add request interceptor to automatically include Authorization header
  client.interceptors.request.use((request) => {
    const token = getAuthToken();
    if (token) {
      request.headers.set("Authorization", `Bearer ${token}`);
    }
    return request;
  });

  // Optional: Add response interceptor to handle 401 errors
  client.interceptors.response.use((response) => {
    if (response.status === 401) {
      // Token might be expired or invalid
      console.warn("[API] Received 401 Unauthorized - token may be expired");
      // You could dispatch a logout action here if needed
    }
    return response;
  });
}

/**
 * Get the configured API client
 * This is the client that should be used by all services
 */
export { client as apiClient };

/**
 * Get the current API base URL
 */
export function getApiUrl(): string {
  return getApiBaseUrl();
}

/**
 * Update the authentication token
 * Call this after login/signup to ensure the token is available for requests
 */
export function setAuthToken(token: string): void {
  localStorage.setItem("auth_token", token);
}

/**
 * Clear the authentication token
 * Call this on logout
 */
export function clearAuthToken(): void {
  localStorage.removeItem("auth_token");
}


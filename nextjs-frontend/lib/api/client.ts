import { client } from "@/app/openapi-client/client.gen";
import { ENV_VARS } from "@/lib/constants";

/**
 * Initialize API client with base URL from environment or localhost
 */
export function initializeApiClient(): void {
  client.setConfig({
    baseURL: ENV_VARS.API_BASE_URL,
  });
}

/**
 * Get the API base URL from environment or return default
 */
export function getApiBaseUrl(): string {
  const baseUrl = ENV_VARS.API_BASE_URL;
  return baseUrl.replace(/\/+$/, "");
}

/**
 * FastAPI: `/v1/action-detection/*` (sign-to-text, text-to-sign). Default uvicorn :8001.
 */
export function getMlApiBaseUrl(): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_ML_API_BASE_URL ||
    process.env.ML_API_BASE_URL ||
    "http://localhost:8001";
  return baseUrl.replace(/\/+$/, "");
}

// Initialize on module load
initializeApiClient();

export default client;

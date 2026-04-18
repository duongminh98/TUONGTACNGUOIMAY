import { API_ENDPOINTS } from "@/lib/constants";
import { getMlApiBaseUrl } from "./client";
import type { SignToTextResponse, TextToSignResponse } from "@/lib/types";

/**
 * Make a JSON request to the API
 */
async function requestJson<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${getMlApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

/**
 * Predict sign to text from a sequence of poses
 */
export async function predictSignToText(sequence: number[][]): Promise<SignToTextResponse> {
  return requestJson<SignToTextResponse>(API_ENDPOINTS.SIGN_TO_TEXT, {
    method: "POST",
    body: JSON.stringify({ sequence }),
  });
}

/**
 * Translate text to sign language
 */
export async function translateTextToSign(
  text: string,
  options?: { spokenLanguage?: string; signedLanguage?: string },
): Promise<TextToSignResponse> {
  return requestJson<TextToSignResponse>(API_ENDPOINTS.TEXT_TO_SIGN, {
    method: "POST",
    body: JSON.stringify({
      text,
      spoken_language: options?.spokenLanguage,
      signed_language: options?.signedLanguage,
    }),
  });
}

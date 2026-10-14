export const PIXEL_ID = "1187108507173609";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

/**
 * Dispara um evento padrão do Meta Pixel (fbq track)
 */
export function trackPixelEvent(
  eventName: "PageView" | "Lead" | "Contact",
  params?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    if (params) {
      window.fbq("track", eventName, params);
    } else {
      window.fbq("track", eventName);
    }
  }
}

/**
 * Dispara um evento personalizado do Meta Pixel (fbq trackCustom)
 */
export function trackPixelCustom(
  eventName: "QuizStart" | "QuizComplete" | string,
  params?: Record<string, unknown>
) {
  if (typeof window !== "undefined" && typeof window.fbq === "function") {
    if (params) {
      window.fbq("trackCustom", eventName, params);
    } else {
      window.fbq("trackCustom", eventName);
    }
  }
}

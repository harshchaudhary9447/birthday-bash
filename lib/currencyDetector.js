"use client";

import { CURRENCY_CONFIG } from "./monthlyOffer";

/**
 * Synchronously detects the user's currency based on the client browser's timezone & languages.
 * Instant, zero latency, zero network dependencies.
 */
export function detectUserCurrencySync() {
  if (typeof window === "undefined") return "INR";

  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    const languages = navigator.languages || [navigator.language || ""];

    // 1. Check India Timezones & Indian languages
    if (
      timeZone.includes("Kolkata") ||
      timeZone.includes("Calcutta") ||
      timeZone.startsWith("Indian/") ||
      languages.some((l) => l.endsWith("-IN") || l.startsWith("hi") || l.startsWith("ta") || l.startsWith("te"))
    ) {
      return "INR";
    }

    // 2. Check United Kingdom
    if (timeZone.includes("London") || languages.some((l) => l === "en-GB")) {
      return "GBP";
    }

    // 3. Check Canada
    if (
      timeZone.includes("Toronto") ||
      timeZone.includes("Vancouver") ||
      timeZone.includes("Montreal") ||
      timeZone.includes("Edmonton") ||
      timeZone.includes("Winnipeg") ||
      languages.some((l) => l === "en-CA" || l === "fr-CA")
    ) {
      return "CAD";
    }

    // 4. Check Australia
    if (timeZone.startsWith("Australia/") || languages.some((l) => l === "en-AU")) {
      return "AUD";
    }

    // 5. Check United Arab Emirates (UAE)
    if (timeZone.includes("Dubai")) {
      return "AED";
    }

    // 6. Check Eurozone
    if (
      timeZone.startsWith("Europe/") &&
      !timeZone.includes("London") &&
      !timeZone.includes("Kyiv") &&
      !timeZone.includes("Moscow")
    ) {
      return "EUR";
    }

    // 7. United States or other global regions
    return "USD";
  } catch (err) {
    return "INR";
  }
}

/**
 * Asynchronously refines user country/currency via lightweight IP geo lookup.
 * Fails safely back to synchronous detection if network error or ad-blocked.
 */
export async function detectUserCurrencyAsync() {
  const syncFallback = detectUserCurrencySync();
  if (typeof window === "undefined") return syncFallback;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);
    const res = await fetch("https://api.country.is", { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      const code = (data.country || "").toUpperCase();
      if (code === "IN") return "INR";
      if (code === "US") return "USD";
      if (code === "GB") return "GBP";
      if (code === "CA") return "CAD";
      if (code === "AU") return "AUD";
      if (code === "AE") return "AED";
      if (["DE", "FR", "IT", "ES", "NL", "BE", "AT", "PT", "IE", "FI", "GR"].includes(code)) {
        return "EUR";
      }
      return "USD";
    }
  } catch (err) {
    // Network lookup skipped or timed out, use sync fallback
  }

  return syncFallback;
}

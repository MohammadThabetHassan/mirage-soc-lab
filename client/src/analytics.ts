function optionalAnalyticsConfig() {
  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT?.trim();
  const websiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID?.trim();
  if (!endpoint || !websiteId) return null;

  try {
    const baseUrl = new URL(endpoint);
    if (!["http:", "https:"].includes(baseUrl.protocol)) return null;
    return { baseUrl, websiteId };
  } catch {
    return null;
  }
}

/** Loads privacy-configured analytics only when an operator explicitly supplies valid settings. */
export function initializeOptionalAnalytics() {
  const config = optionalAnalyticsConfig();
  if (!config || document.querySelector("script[data-mirage-analytics]"))
    return;

  const script = document.createElement("script");
  script.defer = true;
  script.dataset.mirageAnalytics = "true";
  script.src = new URL(
    "umami",
    config.baseUrl.href.endsWith("/")
      ? config.baseUrl.href
      : `${config.baseUrl.href}/`
  ).toString();
  script.dataset.websiteId = config.websiteId;
  document.head.appendChild(script);
}

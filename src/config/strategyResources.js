// ── Static Strategy Resources Configuration ──────────────────────────
// Temporary static PDF resources for each strategy.
// Replace with API data when backend endpoint is available.
//
// Structure matches ResourcesSection.jsx expected shape:
//   { _id, originalName, mimeType, url, size }
//
// Key: lowercase strategy name (matches parentStrategy?.title?.toLowerCase())
// To swap to API: replace the lookup with API response data — no UI changes needed.

export const STRATEGY_RESOURCES = {
  react: [
    {
      _id: "react-guide",
      originalName: "React Strategy Guide.pdf",
      mimeType: "application/pdf",
      url: "https://edulms.blob.core.windows.net/edu-platform-resources/e6715ae8-d06a-4a67-afd4-44d0ee12cd9c-React%20-%20A4%20PDF.pdf",
      size: 16365060,
    },
  ],

  defy: [
    {
      _id: "defy-guide",
      originalName: "Defy Strategy Guide.pdf",
      mimeType: "application/pdf",
      url: "https://edulms.blob.core.windows.net/edu-platform-resources/9e729166-cf0f-4933-b589-50c94764c205-Defy%20-%20A4%20PDF%20(1).pdf",
      size: 16330301,
    },
  ],

  killshot: [
    {
      _id: "killshot-guide",
      originalName: "Killshot Strategy Guide.pdf",
      mimeType: "application/pdf",
      url: "https://edulms.blob.core.windows.net/edu-platform-resources/123c8c84-ff42-4fd6-b8fa-48d28aa13666-Killshot%20-%20A4%20PDF%20(2).pdf",
      size: 14965196,
    },
  ],

  bullseye: [
    {
      _id: "bullseye-guide",
      originalName: "Bullseye Strategy Guide.pdf",
      mimeType: "application/pdf",
      url: "https://edulms.blob.core.windows.net/edu-platform-resources/c3e40dcf-70ea-4ef1-9436-c43522b0cf54-Bullseye%20-%20A4%20PDF%20(3).pdf",
      size: 15677436,
    },
  ],
};

/**
 * Get static resources for a strategy by its title.
 * Performs case-insensitive lookup with space → underscore normalisation.
 * @param {string} strategyTitle - e.g. "React", "DEFY", "Killshot"
 * @returns {Object[]|null} - Array of resource objects or null
 */
export function getStrategyResources(strategyTitle) {
  if (!strategyTitle) return null;
  const key = strategyTitle.toLowerCase().trim().replace(/\s+/g, "_");
  return STRATEGY_RESOURCES[key] || null;
}

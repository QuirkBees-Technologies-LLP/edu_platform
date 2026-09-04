// Resolves the educator-chosen display order (Task 14) between the three media groups an
// Insight/Idea can carry: uploaded images, TradingView chart snapshots, and (Insights only)
// a DynTube video. The snapshot images live mixed into the same `image`/`photos` array as
// manual uploads — this is the one heuristic (URL substring) already used elsewhere in the
// codebase to tell them apart, reused here so grouping/ordering stays consistent with it.
const TV_SNAPSHOT_MARKERS = ["tv-chart-images", "tv-snapshot"];

const isTvSnapshotUrl = (url) =>
  typeof url === "string" && TV_SNAPSHOT_MARKERS.some((marker) => url.includes(marker));

const DEFAULT_ORDER = ["image", "tradingview", "dyntube"];

// Returns an ordered list of { type: "image" | "tradingview" | "dyntube", url } slides,
// in the order the educator chose (falling back to image → tradingview → dyntube for
// records saved before this feature existed, or with no dyntube field at all for Ideas).
export function getOrderedMediaSlides(doc) {
  const allImages = Array.isArray(doc?.image)
    ? doc.image
    : Array.isArray(doc?.photos)
      ? doc.photos
      : [];
  const uploadedImages = allImages.filter((url) => !isTvSnapshotUrl(url));
  const tvImages = allImages.filter((url) => isTvSnapshotUrl(url));
  const dyntubeUrl = doc?.dyntubeUrl || null;

  const order =
    Array.isArray(doc?.mediaOrder) && doc.mediaOrder.length > 0
      ? doc.mediaOrder
      : DEFAULT_ORDER;

  const groups = {
    image: uploadedImages.map((url) => ({ type: "image", url })),
    tradingview: tvImages.map((url) => ({ type: "tradingview", url })),
    dyntube: dyntubeUrl ? [{ type: "dyntube", url: dyntubeUrl }] : [],
  };

  const slides = [];
  order.forEach((key) => {
    if (groups[key]) slides.push(...groups[key]);
  });
  // Safety net for a group missing from a stale/malformed mediaOrder — still show it,
  // just appended at the end rather than silently dropped.
  Object.keys(groups).forEach((key) => {
    if (!order.includes(key)) slides.push(...groups[key]);
  });
  return slides;
}

// Convenience for callers that only render <img> elements (plain sliders, single-thumbnail
// cards) and have no dyntube slide to worry about — the ordered image + TradingView-snapshot
// URLs only, dyntube excluded.
export function getOrderedImageUrls(doc) {
  return getOrderedMediaSlides(doc)
    .filter((slide) => slide.type !== "dyntube")
    .map((slide) => slide.url);
}

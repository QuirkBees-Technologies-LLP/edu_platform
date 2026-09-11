// Resolves the educator-chosen display order (Task 14) between the three media groups an
// Insight/Idea can carry: uploaded images, TradingView chart snapshots, and (Insights only)
// a DynTube video. The snapshot images live mixed into the same `image`/`photos` array as
// manual uploads — this is the one heuristic (URL substring) already used elsewhere in the
// codebase to tell them apart, reused here so grouping/ordering stays consistent with it.
const TV_SNAPSHOT_MARKERS = ["tv-chart-images", "tv-snapshot"];

const isTvSnapshotUrl = (url) =>
  typeof url === "string" && TV_SNAPSHOT_MARKERS.some((marker) => url.includes(marker));

const DEFAULT_ORDER = ["image", "tradingview", "dyntube"];

// newestFirst flips the order *within* each media group so the most recently added item
// leads. New uploads are appended to the stored array (imageUrls.concat(uploadedUrls) on
// the backend), so the stored order is oldest-first and reversing a group surfaces the
// latest image. The educator-chosen order *between* groups (mediaOrder) is deliberately
// left alone — only the contents of each group flip.
const applyDirection = (urls, newestFirst) => (newestFirst ? [...urls].reverse() : urls);

// Returns an ordered list of { type: "image" | "tradingview" | "dyntube", url } slides,
// in the order the educator chose (falling back to image → tradingview → dyntube for
// records saved before this feature existed, or with no dyntube field at all for Ideas).
export function getOrderedMediaSlides(doc, { newestFirst = false } = {}) {
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
    image: applyDirection(uploadedImages, newestFirst).map((url) => ({ type: "image", url })),
    tradingview: applyDirection(tvImages, newestFirst).map((url) => ({
      type: "tradingview",
      url,
    })),
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
export function getOrderedImageUrls(doc, options) {
  return getOrderedMediaSlides(doc, options)
    .filter((slide) => slide.type !== "dyntube")
    .map((slide) => slide.url);
}

// Live Ideas keep a plain `image` array with no mediaOrder field and no uploaded-vs-snapshot
// split, so "newest first" for them is simply the stored array reversed — same reasoning as
// applyDirection above: the backend appends new uploads to the end.
export function getLatestFirstImages(doc) {
  return Array.isArray(doc?.image) ? [...doc.image].reverse() : [];
}

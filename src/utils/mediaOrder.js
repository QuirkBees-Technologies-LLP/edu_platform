// Resolves the educator-chosen display order (Task 14) between the three media groups an
// Insight/Idea can carry: uploaded images, TradingView chart snapshots, and (Insights only)
// a DynTube video. Snapshot images live mixed into the same `image`/`photos` array as manual
// uploads, so they're told apart by which Azure container they were written to.
//
// Only the container counts — not the file name. Generated snapshots are named
// "…-tv-snapshot_<id>.png", and an educator who downloads one and re-uploads it keeps that
// name while the file lands in the UPLOADS container. Matching the name flagged those
// uploads as TradingView charts, which mislabelled them in the form and mis-sorted them
// under Display Order. The container is assigned by the backend and can't be spoofed by a
// file name, and it's the same signal the backend itself uses.
const TV_SNAPSHOT_CONTAINER = "/tv-chart-images/";

export const isTvSnapshotUrl = (url) =>
  typeof url === "string" && url.includes(TV_SNAPSHOT_CONTAINER);

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

// Live Ideas have no mediaOrder field and no uploaded-vs-snapshot split, so their images
// are shown exactly as stored — the order the educator/admin arranged them in.
export function getImages(doc) {
  return Array.isArray(doc?.image) ? doc.image : [];
}

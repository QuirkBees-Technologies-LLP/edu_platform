import React from "react";
import clsx from "clsx";

// Page-level width control, set per view rather than globally.
//
// The theme's own container is either `container-fixed` (a hard 1280px cap) or
// `container-fluid` (edge to edge). Neither suits every page: dense views want most of a
// wide monitor, while reading views get tiring at full width. These presets sit in
// between — each is a percentage of the viewport with a ceiling, so the page grows with
// the screen up to a point and then stops instead of stretching indefinitely.
//
// Width is `min(<percentage of viewport>, <ceiling>)`, so:
//   - below the ceiling the page is that percentage of the screen, leaving even gutters
//   - past it the page holds its width and centres, and only the gutters grow
//   - on phones/tablets the percentage is effectively the full screen minus padding
const WIDTH_PRESETS = {
  // Reading / detail views — long text at full monitor width is hard to scan.
  narrow: "max-w-[min(80vw,1280px)]",
  // General pages.
  default: "max-w-[min(88vw,1600px)]",
  // Dense views (profile dashboards, multi-column grids) that benefit from a wide monitor.
  // The ceiling is deliberately high: pages using this are expected to narrow their side
  // columns and add card columns at the 3xl/4xl tiers, so the extra width becomes content
  // rather than a stretched version of the same layout.
  wide: "max-w-[min(94vw,2400px)]",
  // Tables and viewers that should use everything available.
  full: "max-w-none",
};

// Optional viewport-height mode: the page fills the screen and its own body scrolls,
// instead of the whole document scrolling. Meant for dense table/viewer screens where the
// header should stay put — long editorial pages should keep the default document scroll.
const HEIGHT_PRESETS = {
  auto: "",
  screen: "h-[calc(100vh-var(--tw-header-height))] flex flex-col overflow-hidden",
};

const PageContainer = ({
  width = "default",
  height = "auto",
  className = "",
  children,
}) => (
  <div
    className={clsx(
      "w-full mx-auto px-4 sm:px-6 xl:px-7.5",
      WIDTH_PRESETS[width] ?? WIDTH_PRESETS.default,
      HEIGHT_PRESETS[height] ?? HEIGHT_PRESETS.auto,
      className
    )}
  >
    {children}
  </div>
);

export { PageContainer, WIDTH_PRESETS, HEIGHT_PRESETS };
export default PageContainer;

import React from "react";

// Left/right rail banner for the IQ Social feed (task 2.2). Marketing assets haven't been
// delivered yet, so `image` stays undefined for now — until a real URL is passed in, this
// renders nothing at all rather than a placeholder, and CommunityFeed drops the reserved
// column for it entirely (see hasSideBanners there).
const SocialSideBanner = ({ position = "left", image, alt = "Banner", stickyTop }) => {
  if (!image) return null;

  const gradientClass =
    position === "left"
      ? "bg-gradient-to-br from-blue-500/10 to-[#8B5CF6]/10 dark:from-blue-500/15 dark:to-[#8B5CF6]/15"
      : "bg-gradient-to-bl from-[#8B5CF6]/10 to-blue-500/10 dark:from-[#8B5CF6]/15 dark:to-blue-500/15";

  return (
    <div
      // top offset is passed in from the page rather than a fixed class — it has to clear
      // both the app's fixed header AND the sticky title/tabs bar above it, and the latter's
      // height isn't a constant (it can wrap on narrower widths), so the page measures it
      // and hands the real pixel offset down here instead of guessing a fixed value.
      style={stickyTop ? { top: stickyTop } : undefined}
      className={`hidden lg:block sticky w-full rounded-2xl overflow-hidden border border-gray-200 dark:border-[#22242A] min-h-[520px] ${gradientClass}`}
    >
      <img src={image} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
};

export default SocialSideBanner;

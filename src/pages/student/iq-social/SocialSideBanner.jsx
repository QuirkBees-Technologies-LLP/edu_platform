import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Left/right rail banner for the IQ Social feed (task 2.2). Marketing assets haven't been
// delivered yet, so `image` stays undefined for now and this permanently renders its
// skeleton state — once an image URL is passed in, it swaps straight over to the real
// banner with no other changes needed here.
const SocialSideBanner = ({ position = "left", image, alt = "Banner", stickyTop }) => {
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
      {image ? (
        <img src={image} alt={alt} className="w-full h-full object-cover" />
      ) : (
        <div className="relative w-full h-full min-h-[520px] flex items-center justify-center">
          <Skeleton className="absolute inset-0 w-full h-full rounded-2xl" />
          <span className="relative text-xs text-gray-400 dark:text-[#6B6E76] font-medium">
            Banner coming soon
          </span>
        </div>
      )}
    </div>
  );
};

export default SocialSideBanner;

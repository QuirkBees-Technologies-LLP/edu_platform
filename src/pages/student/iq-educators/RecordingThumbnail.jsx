import React, { useEffect, useRef, useState, useCallback } from "react";
import { toAbsoluteUrl } from "@/utils/Assets";

const RecordingThumbnail = ({
  videoUrl,
  seekTime = 1,
  image,
  defaultImage,
  onRecordingClick,
  // Height of the thumbnail box. Defaults to the viewport-relative height the admin and
  // educator recording pages were built around; card grids pass "aspect-video" instead so
  // the thumbnail scales with the card's width rather than growing with screen height.
  sizeClassName = "h-[28vh]",
}) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [thumbnail, setThumbnail] = useState(image || null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const displayImage = image
    ? image
    : defaultImage
      ? defaultImage
      : toAbsoluteUrl("/media/images/2600x1600/live_banner.jpg");

  // useEffect(() => {
  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       entries.forEach((entry) => {
  //         if (entry.isIntersecting) {
  //           setVisible(true);
  //           observer.disconnect();
  //         }
  //       });
  //     },
  //     { rootMargin: "0px 0px 200px 0px" }
  //   );

  //   if (containerRef.current) observer.observe(containerRef.current);
  //   return () => observer.disconnect();
  // }, []);

  // useEffect(() => {
  //   if (!visible || thumbnail || !videoUrl) return;

  //   setLoading(true);
  //   const video = document.createElement("video");
  //   videoRef.current = video;
  //   video.crossOrigin = "anonymous";
  //   video.preload = "metadata";
  //   video.src = videoUrl;

  //   const generateThumbnail = () => {
  //     try {
  //       const canvas = document.createElement("canvas");
  //       canvas.width = video.videoWidth || 320;
  //       canvas.height = video.videoHeight || 240;
  //       const ctx = canvas.getContext("2d");
  //       if (!ctx) throw new Error("Cannot get canvas context");

  //       ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  //       const dataURL = canvas.toDataURL("image/jpeg", 0.7);
  //       setThumbnail(dataURL);
  //     } catch (err) {
  //       console.warn("Thumbnail generation failed:", err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   const handleLoadedData = () => {
  //     try {
  //       video.currentTime = Math.min(seekTime, video.duration);
  //     } catch (e) {
  //       console.warn("Cannot seek video yet", e);
  //     }
  //   };

  //   const handleSeeked = () => generateThumbnail();

  //   video.addEventListener("loadeddata", handleLoadedData);
  //   video.addEventListener("seeked", handleSeeked);
  //   video.addEventListener("error", (e) => console.warn("Video error:", e));

  //   return () => {
  //     video.removeEventListener("loadeddata", handleLoadedData);
  //     video.removeEventListener("seeked", handleSeeked);
  //     video.removeEventListener("error", () => {});
  //     video.src = "";
  //     videoRef.current = null;
  //   };
  // }, [visible, videoUrl, seekTime, thumbnail]);

  const handleClick = useCallback(() => {
    if (onRecordingClick) onRecordingClick();
    else if (videoUrl) window.open(videoUrl, "_blank");
  }, [onRecordingClick, videoUrl]);

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className={`w-full ${sizeClassName} cursor-pointer bg-light flex justify-center items-center rounded-lg relative overflow-hidden`}
    >
      {displayImage ? (
        <>
          <img
            src={displayImage}
            alt="Thumbnail"
            className="rounded-lg w-full h-full object-cover"
          />
          <div className="rounded-lg absolute inset-0 flex justify-center items-center bg-black/25">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" />
            </svg>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex justify-center items-center rounded-lg bg-gray-200 animate-pulse">
          {/* Skeleton loader */}
          <div className="w-full h-full rounded-lg bg-gray-300" />
        </div>
      )}
    </div>
  );
};

export default RecordingThumbnail;

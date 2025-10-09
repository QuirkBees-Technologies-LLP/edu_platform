import React, { useEffect, useRef, useState, useCallback } from "react";

const RecordingThumbnail = ({
  videoUrl,
  seekTime = 1,
  image,
  onRecordingClick,
}) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null); // dynamically created video element
  const [thumbnail, setThumbnail] = useState(image || null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Lazy-load when visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin: "0px 0px 200px 0px" }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // ✅ Generate thumbnail only when visible, no thumbnail yet, and video exists
  useEffect(() => {
    if (!visible || thumbnail || !videoUrl) return;

    setLoading(true);

    const video = document.createElement("video");
    videoRef.current = video;
    video.crossOrigin = "anonymous";
    video.preload = "metadata";
    video.src = videoUrl;

    const generateThumbnail = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 240;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Cannot get canvas context");

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataURL = canvas.toDataURL("image/jpeg", 0.7);
        setThumbnail(dataURL);
      } catch (err) {
        console.warn("Thumbnail generation failed:", err.message);
      } finally {
        setLoading(false);
      }
    };

    const handleLoadedData = () => {
      try {
        video.currentTime = Math.min(seekTime, video.duration);
      } catch (e) {
        console.warn("Cannot seek video yet", e);
      }
    };

    const handleSeeked = () => generateThumbnail();

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("error", (e) => console.warn("Video error:", e));

    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("error", () => {});
      video.src = "";
      videoRef.current = null;
    };
  }, [visible, videoUrl, seekTime, thumbnail]);

  const handleClick = useCallback(() => {
    if (onRecordingClick) onRecordingClick();
    else if (videoUrl) window.open(videoUrl, "_blank");
  }, [onRecordingClick, videoUrl]);

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      className="w-full h-[28vh] cursor-pointer bg-light flex justify-center items-center rounded-lg relative"
    >
      {thumbnail ? (
        <>
          <img
            src={thumbnail}
            alt="Thumbnail"
            className="rounded-lg w-full h-[28vh] object-cover"
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
        <div className="rounded-lg w-full h-full flex justify-center items-center bg-light">
          {loading ? (
            <span className="text-gray-500 text-xs">Loading thumbnail...</span>
          ) : (
            <div className="flex flex-col items-center text-gray-500">
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="gray"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polygon points="10 8 16 12 10 16 10 8" />
              </svg>
              <span className="text-xs mt-2">Loading thumbnail...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RecordingThumbnail;

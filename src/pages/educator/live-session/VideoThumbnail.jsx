import React, { useEffect, useRef, useState } from "react";

const VideoThumbnail = ({
  videoUrl,
  seekTime = 1,
  recordingThumbnail,
  data,
}) => {
  const videoRef = useRef(null);
  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.crossOrigin = "anonymous"; // Enable this after configuring CORS on Azure
    video.preload = "auto";

    const handleLoadedData = () => {
      video.currentTime = seekTime;
    };

    const handleSeeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 240;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = canvas.toDataURL("image/jpeg", 0.8);
        setThumbnail(imageData);
      } catch (err) {
        console.log("Thumbnail generation failed:", err.message);

        // Check if it's a CORS issue
        if (err.message.includes("tainted")) {
          console.log("CORS issue detected. To fix this:");
          console.log("1. Configure CORS on Azure Blob Storage");
          console.log(
            "2. Allow origins: http://localhost:5173, https://iqonic.vip"
          );
          console.log("3. Methods: GET, HEAD");
        }

        // Continue without thumbnail - video still works
      }
    };

    video.addEventListener("loadeddata", handleLoadedData);
    video.addEventListener("seeked", handleSeeked);
    video.addEventListener("error", (e) => {
      console.error("Video error:", e);
      console.error("Video error details:", video.error);
    });

    return () => {
      video.removeEventListener("loadeddata", handleLoadedData);
      video.removeEventListener("seeked", handleSeeked);
      video.removeEventListener("error", (e) => {
        console.error("Video error:", e);
        console.error("Video error details:", video.error);
      });
    };
  }, [videoUrl, seekTime]);

  const handleThumbnailClick = () => {
    window.open(videoUrl, "_blank");
  };

  return (
    <div
      onClick={handleThumbnailClick}
      className="w-full h-44 cursor-pointer bg-light d-flex justify-center align-items-center rounded-lg"
    >
      <video
        ref={videoRef}
        src={videoUrl}
        style={{ display: "none" }}
        muted
        playsInline
      />
      {recordingThumbnail ? (
        <>
          <div className="w-full h-[28vh] relative">
            <img
              src={recordingThumbnail || thumbnail}
              alt="Thumbnail"
              className="rounded-lg w-full h-full object-cover"
            />
            <div className="rounded-lg absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center">
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
          </div>
        </>
      ) : (
        <div className="rounded-lg w-full h-full flex justify-center items-center bg-light">
          <div className="flex flex-col items-center">
            <svg
              width="48"
              height="48"
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
            <span className="text-gray-500 mt-2">Click to play video</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoThumbnail;

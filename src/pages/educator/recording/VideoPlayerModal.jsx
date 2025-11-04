// VideoPlayerModal.jsx
import React, { useMemo, Suspense } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ShowMoreLess from "../../../components/ui/showmoreless";

const VideoJS = React.lazy(() => import("../../../components/VideoJS"));

// 🧠 Helper to detect and convert embed URLs
const getEmbedUrl = (url) => {
  if (!url) return null;

  if (url.includes("youtube.com/watch?v=")) {
    const id = url.split("v=")[1].split("&")[0];
    return `https://www.youtube.com/embed/${id}`;
  }

  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  }

  if (url.includes("vimeo.com/")) {
    const parts = url.split("vimeo.com/")[1].split("/");
    const id = parts[0].split("?")[0];
    const hash = parts[1] ? parts[1].split("?")[0] : null;
    return hash
      ? `https://player.vimeo.com/video/${id}?h=${hash}`
      : `https://player.vimeo.com/video/${id}`;
  }

  if (url.includes("dailymotion.com/video/")) {
    const id = url.split("dailymotion.com/video/")[1].split("?")[0];
    return `https://www.dailymotion.com/embed/video/${id}`;
  }

  if (url.includes("loom.com/share/")) {
    const id = url.split("loom.com/share/")[1].split("?")[0];
    return `https://www.loom.com/embed/${id}`;
  }

  // if (url.includes("dyntube.com/video/")) {
  //   let id = url.split("dyntube.com/video/")[1].split("?")[0];
  //   id = id.replace(/\/$/, "");
  //   return `https://player.dyntube.com/video/${id}`;
  // }

  if (url.includes("app.dyntube.com/#/video/")) {
    const match = url.match(/video\/([^/]+)/);
    if (match?.[1]) return `https://player.dyntube.com/video/${match[1]}`;
  }

  // CASE 2: https://videos.dyntube.com/iframes/<id>
  if (url.includes("videos.dyntube.com/iframes/")) {
    const match = url.match(/iframes\/([^/?#]+)/);
    if (match?.[1]) return `https://videos.dyntube.com/iframes/${match[1]}`;
  }

  // CASE 3: https://player.dyntube.com/video/<id>
  if (url.includes("player.dyntube.com/video/")) {
    const match = url.match(/video\/([^/?#]+)/);
    if (match?.[1]) return `https://player.dyntube.com/video/${match[1]}`;
  }

  // CASE 4: fallback generic
  if (url.includes("dyntube.com/")) return url;

  return null;
};

const VideoPlayerModal = ({ open, onOpenChange, videoUrl, data }) => {
  const embedUrl = useMemo(() => getEmbedUrl(videoUrl), [videoUrl]);

  const playerOptions = useMemo(() => {
    if (embedUrl) return null;
    return {
      autoplay: true,
      controls: true,
      responsive: true,
      fluid: true,
      muted: true,
      html5: {
        attributes: {
          controlsList: "nodownload noplaybackrate",
          disablePictureInPicture: true,
        },
      },
      sources: [
        {
          src: videoUrl,
          type: "video/mp4",
        },
      ],
    };
  }, [videoUrl, embedUrl]);

  const handlePlayerReady = (player) => {
    console.log("VideoJS Player is ready", player);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>{data?.call_title || "Recording Playback"}</DialogTitle>
          <ShowMoreLess
            html={
              data?.call_description ||
              "View and access all video recordings uploaded by educators and admins."
            }
            limit={100}
          />
        </DialogHeader>

        <div className="p-4">
          {open &&
            (embedUrl ? (
              // 🎬 Iframe-based embed player
              <div className="aspect-video w-full bg-black rounded-lg overflow-hidden">
                <iframe
                  src={embedUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full aspect-video border rounded-md"
                ></iframe>
              </div>
            ) : (
              // 🎥 Video.js player for direct files
              <Suspense
                fallback={
                  <div className="w-full h-[50vh] bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                    <div className="w-3/4 h-3/4 bg-gray-300 rounded-lg" />
                  </div>
                }
              >
                <VideoJS options={playerOptions} onReady={handlePlayerReady} />
              </Suspense>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerModal;

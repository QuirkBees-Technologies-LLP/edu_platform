// VideoPlayerModal.jsx
import React, { useMemo , Suspense } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ShowMoreLess from "../../../components/ui/showmoreless";
const VideoJS = React.lazy(() => import("../../../components/VideoJS"));

const VideoPlayerModal = ({ open, onOpenChange, videoUrl, data }) => {
  const playerOptions = useMemo(
    () => ({
      autoplay: true,
      controls: true,
      responsive: true,
      fluid: true,
      muted: true,
      sources: [
        {
          src: videoUrl,
          type: "video/mp4",
        },
      ],
    }),
    [videoUrl]
  );

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
          {open && (
            <Suspense
              fallback={
                <div className="w-full h-[50vh] bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
                  <div className="w-3/4 h-3/4 bg-gray-300 rounded-lg" />
                </div>
              }
            >
              <VideoJS options={playerOptions} onReady={handlePlayerReady} />
            </Suspense>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerModal;

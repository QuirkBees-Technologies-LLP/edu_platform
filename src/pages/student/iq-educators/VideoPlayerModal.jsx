// // VideoPlayerModal.jsx
// import React from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import VideoJS from "../../../components/VideoJS";
// // import VideoJS from '../../../components/VideoJS';
// import ShowMoreLess from "../../../components/ui/showmoreless";

// const VideoPlayerModal = ({ open, onOpenChange, videoUrl, data }) => {
//   const playerOptions = {
//     autoplay: true,
//     controls: true,
//     responsive: true,
//     fluid: true,
//     muted: true,
//     sources: [
//       {
//         src: videoUrl,
//         type: "video/mp4",
//       },
//     ],
//   };

//   const handlePlayerReady = (player) => {
//     console.log("VideoJS Player is ready", player);
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent
//         className="max-w-4xl w-full p-0 overflow-hidden"
//         onContextMenu={(e) => e.preventDefault()}
//       >
//         <DialogHeader className="p-4 pb-0 bg-white">
//           <DialogTitle>{data?.call_title || "Recording Playback"}</DialogTitle>
//           {/* <p className='flex items-center gap-2 text-sm font-normal text-gray-700'>{data?.call_description || 'View and access all video recordings uploaded by educators and admins.'}</p> */}
//           <ShowMoreLess
//             html={
//               data?.call_description ||
//               "View and access all video recordings uploaded by educators and admins."
//             }
//             limit={100}
//           />
//         </DialogHeader>
//         <div className="p-4" onContextMenu={(e) => e.preventDefault()}>
//           {/* ✅ Only render the video when modal is open */}
//           {open && (
//             <VideoJS
//               key={videoUrl} // 🔑 force re-mount when videoUrl changes or modal reopens
//               options={playerOptions}
//               onReady={handlePlayerReady}
//             />
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default VideoPlayerModal;

// VideoPlayerModal.jsx
import React, { Suspense, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ShowMoreLess from "../../../components/ui/showmoreless";
const VideoJS = React.lazy(() => import("../../../components/VideoJS"));

// Utility: detect embed-type URLs
const getEmbedUrl = (url) => {
  if (!url) return "";

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

  if (url.includes("dyntube.com/video/")) {
    let id = url.split("dyntube.com/video/")[1].split("?")[0];
    id = id.replace(/\/$/, "");
    return `https://player.dyntube.com/video/${id}`;
  }

  return null; // not an embed URL
};

const VideoPlayerModal = ({ open, onOpenChange, videoUrl, data }) => {
  const embedUrl = useMemo(() => getEmbedUrl(videoUrl), [videoUrl]);

  const playerOptions = useMemo(() => {
    if (embedUrl) return null; // skip options for iframe sources
    return {
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

        {/* <div className="mt-2">
          <iframe
            src={getEmbedUrl(formik.values.videoUrl)}
            className="w-full aspect-video border rounded-md"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div> */}

        <div className="p-4">
          {open &&
            (embedUrl ? (
              // 🔹 Iframe player for embedded sources
              <div className="aspect-video w-full rounded-lg overflow-hidden">
                <iframe
                  src={embedUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full aspect-video border rounded-md"
                ></iframe>
              </div>
            ) : (
              // 🔹 Video.js player for direct file URLs
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

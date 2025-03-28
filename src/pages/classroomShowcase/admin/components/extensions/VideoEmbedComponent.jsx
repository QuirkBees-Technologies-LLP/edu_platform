import React, { useEffect, useState } from "react";
import { NodeViewWrapper } from "@tiptap/react";
import { Video } from "lucide-react";

const VideoEmbedComponent = ({ node, updateAttributes }) => {
  const { url, provider } = node.attrs;
  const [embedUrl, setEmbedUrl] = useState(null);

  useEffect(() => {
    if (!url) return;

    let newEmbedUrl = null;
    switch (provider) {
      case "youtube":
        const youtubeId = url.match(
          /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
        )?.[1];
        newEmbedUrl = youtubeId
          ? `https://www.youtube.com/embed/${youtubeId}`
          : null;
        break;

      case "vimeo":
        const vimeoId = url.match(/vimeo\.com\/([0-9]+)/)?.[1];
        newEmbedUrl = vimeoId
          ? `https://player.vimeo.com/video/${vimeoId}`
          : null;
        break;

      case "loom":
        const loomId = url.match(/loom\.com\/share\/([a-zA-Z0-9-]+)/)?.[1];
        newEmbedUrl = loomId ? `https://www.loom.com/embed/${loomId}` : null;
        break;

      default:
        newEmbedUrl = null;
    }

    setEmbedUrl(newEmbedUrl);
  }, [url, provider]);

  if (!embedUrl) {
    return (
      <NodeViewWrapper className="video-embed">
        <div className="flex items-center justify-center p-4 bg-gray-100 rounded-lg">
          <div className="flex items-center gap-2 text-gray-500">
            <Video className="w-5 h-5" />
            <span>Invalid video URL</span>
          </div>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper className="video-embed">
      <div className="relative w-full pt-[56.25%] my-4">
        <iframe
          src={embedUrl}
          className="absolute top-0 left-0 w-full h-full rounded-lg"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Embedded video"
        />
      </div>
    </NodeViewWrapper>
  );
};

export default VideoEmbedComponent;

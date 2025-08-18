// VideoPlayerModal.jsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import VideoJS from '../../../components/VideoJS';
// import VideoJS from '../../../components/VideoJS';
import ShowMoreLess from "../../../components/ui/showmoreless";


const VideoPlayerModal = ({ open, onOpenChange, videoUrl, data }) => {
  const playerOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: true,
    muted: true,
    sources: [
      {
        src: videoUrl,
        type: 'video/mp4',
      },
    ],
  };

  const handlePlayerReady = (player) => {
    console.log('VideoJS Player is ready', player);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} >
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
        <DialogHeader className="p-4 pb-0 bg-white">
          <DialogTitle>{data?.call_title || 'Recording Playback'}</DialogTitle>
          {/* <p className='flex items-center gap-2 text-sm font-normal text-gray-700'>{data?.call_description || 'View and access all video recordings uploaded by educators and admins.'}</p> */}
          <ShowMoreLess html={data?.call_description || 'View and access all video recordings uploaded by educators and admins.'} limit={100} />
        </DialogHeader>
        <div className="p-4" onContextMenu={(e) => e.preventDefault()}>
          {/* ✅ Only render the video when modal is open */}
          {open && <VideoJS options={playerOptions} onReady={handlePlayerReady} />}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerModal;

// VideoPlayerModal.jsx
import React, { useMemo, Suspense } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ShowMoreLess from '../../../components/ui/showmoreless';

const VideoJS = React.lazy(() => import('../../../components/VideoJS'));

const VideoPlayerModal = ({ open, onOpenChange, videoUrl, data }) => {
  // ✅ Memoize options to prevent unnecessary re-renders
  const playerOptions = useMemo(() => ({
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
  }), [videoUrl]);

  const handlePlayerReady = (player) => {
    console.log('VideoJS Player is ready', player);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>{data?.call_title || 'Recording Playback'}</DialogTitle>
          <ShowMoreLess
            html={data?.call_description || 'View and access all video recordings uploaded by educators and admins.'}
            limit={100}
          />
        </DialogHeader>
        <div className="p-4">
          {/* ✅ Lazy-load VideoJS only when modal is open */}
          {open && (
            <Suspense fallback={<div className="text-center text-gray-500">Loading video...</div>}>
              <VideoJS options={playerOptions} onReady={handlePlayerReady} />
            </Suspense>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayerModal;

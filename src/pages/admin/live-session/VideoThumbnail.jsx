import React, { useEffect, useRef, useState } from 'react';

const VideoThumbnail = ({ videoUrl, seekTime = 1 }) => {
    const videoRef = useRef(null);
    const [thumbnail, setThumbnail] = useState(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        video.crossOrigin = 'anonymous';
        video.preload = 'auto';

        const handleLoadedData = () => {
            video.currentTime = seekTime;
        };

        const handleSeeked = () => {
            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const imageData = canvas.toDataURL('image/png');
            setThumbnail(imageData);
        };

        video.addEventListener('loadeddata', handleLoadedData);
        video.addEventListener('seeked', handleSeeked);

        return () => {
            video.removeEventListener('loadeddata', handleLoadedData);
            video.removeEventListener('seeked', handleSeeked);
        };
    }, [videoUrl, seekTime]);

    const handleThumbnailClick = () => {
        window.open(videoUrl, '_blank');
    };

    return (
        <div
            onClick={handleThumbnailClick}
            className='w-full h-44 cursor-pointer bg-light d-flex justify-center align-items-center rounded-lg'
        >
            <video
                ref={videoRef}
                src={videoUrl}
                style={{ display: 'none' }}
                muted
                playsInline
                crossOrigin="anonymous"
            />
            {thumbnail ? (
                <>
                    <div className="w-full h-full relative">
                        <img src={thumbnail} alt="Thumbnail"
                            className='rounded-lg w-full h-full object-cover'
                        />
                        <div className='rounded-lg absolute top-0 left-0 right-0 bottom-0 flex justify-center items-center'>
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
                <div className='rounded-lg w-full h-full flex justify-center items-center bg-light'>
                    <span>Loading thumbnail...</span>
                </div>
            )
            }
        </div >
    );
};

export default VideoThumbnail;


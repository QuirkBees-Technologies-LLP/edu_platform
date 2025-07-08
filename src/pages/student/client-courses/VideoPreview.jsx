import { useEffect, useState } from 'react';

const getVideoThumbnail = async (url) => {
    // YouTube thumbnail
    const ytMatch = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
    if (ytMatch) {
        return `https://img.youtube.com/vi/${ytMatch[1]}/hqdefault.jpg`;
    }

    // Vimeo thumbnail
    const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
        try {
            const res = await fetch(`https://vimeo.com/api/v2/video/${vimeoMatch[1]}.json`);
            const data = await res.json();
            return data[0].thumbnail_large;
        } catch (error) {
            console.error('Failed to fetch Vimeo thumbnail:', error);
        }
    }

    // Fallback
    return null;
};

const VideoPreview = ({ url }) => {
    const [thumbnail, setThumbnail] = useState(null);

    useEffect(() => {
        const fetchThumbnail = async () => {
            const thumb = await getVideoThumbnail(url);
            setThumbnail(thumb);
        };

        fetchThumbnail();
    }, [url]);

    return (
        <div>
            {thumbnail ? (
                <img
                    src={thumbnail}
                    alt="Video thumbnail"
                    style={{ width: '100%', cursor: 'pointer' }}
                    onClick={() => window.open(url, '_blank')}
                />
            ) : (
                <p>Loading preview...</p>
            )}
        </div>
    );
};

export default VideoPreview;

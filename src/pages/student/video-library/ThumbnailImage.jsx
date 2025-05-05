import React, { useState, useEffect } from 'react';
import { toAbsoluteUrl } from '@/utils/Assets';
function ThumbnailImage({ image, defaultImage }) {
    const [isImageWorking, setIsImageWorking] = useState(null);

    const isImageUrlWorking = async (url) => {
        const img = new Image();
        return new Promise((resolve) => {
            img.onload = () => resolve(true);  
            img.onerror = () => resolve(false);  
            img.src = url;
        });
    };

    useEffect(() => {
        if (image) {
            isImageUrlWorking(image).then((isWorking) => {
                setIsImageWorking(isWorking);  
            });
        } else {
            setIsImageWorking(false);  
        }
    }, [image]);


    if (isImageWorking === null) {
        return <img className="rounded-xl sm:h-24 sm:w-40 w-20 h-22 object-cover" src={toAbsoluteUrl(defaultImage)} alt="Loading..." />;
    }

    const imageUrl = isImageWorking ? image : toAbsoluteUrl(defaultImage);
console.log(imageUrl, "imageUrl");

    return (
        <img
            className="w-full h-full rounded-xl"
            src={imageUrl}
            alt="Thumbnail"
        />
    );
}

export default ThumbnailImage;

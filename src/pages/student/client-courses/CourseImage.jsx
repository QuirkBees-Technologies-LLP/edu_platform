import React, { useState, useEffect } from 'react';
import { toAbsoluteUrl } from '@/utils/Assets';
function CourseImage({ course, defaultImage }) {
    const [isImageWorking, setIsImageWorking] = useState(null);

    // Function to check if the image URL is working
    const isImageUrlWorking = async (url) => {
        const img = new Image();
        return new Promise((resolve) => {
            img.onload = () => resolve(true);  // Image loaded successfully
            img.onerror = () => resolve(false);  // Image failed to load
            img.src = url;
        });
    };

    // Check if the image URL is working when the component mounts or when course.imageUrl changes
    useEffect(() => {
        if (course.imageUrl) {
            isImageUrlWorking(course.imageUrl).then((isWorking) => {
                setIsImageWorking(isWorking);  // Update the state based on the result
            });
        } else {
            setIsImageWorking(false);  // If no URL, set to false
        }
    }, [course.imageUrl]);

    // Display default image until the check is completed
    if (isImageWorking === null) {
        return <img className="rounded-xl sm:h-24 sm:w-40 w-20 h-22 object-cover" src={toAbsoluteUrl(defaultImage)} alt="Loading..." />;
    }

    // Use the valid image URL or fallback to the default image
    const imageUrl = isImageWorking ? course.imageUrl : toAbsoluteUrl(defaultImage);

    return (
        <img
            className="rounded-xl sm:h-24 sm:w-40 w-20 h-22 object-cover"
            src={imageUrl}
            alt={course.title || "Course image"}
        />
    );
}

export default CourseImage;

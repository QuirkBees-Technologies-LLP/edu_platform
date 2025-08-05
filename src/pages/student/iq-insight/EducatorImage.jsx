import React, { useState, useEffect } from 'react';
import { toAbsoluteUrl } from '@/utils/Assets';

function EducatorImage({ educator, defaultImage }) {
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const checkImage = async () => {
      if (educator?.image) {
        const img = new Image();
        img.onload = () => {
          if (isMounted) setImageUrl(educator.image);
        };
        img.onerror = () => {
          if (isMounted) setImageUrl(toAbsoluteUrl(defaultImage));
        };
        img.src = educator.image;
      } else {
        setImageUrl(toAbsoluteUrl(defaultImage));
      }
    };

    checkImage();

    return () => {
      isMounted = false;
    };
  }, [educator?.image, defaultImage]);

  if (!imageUrl) return null; // Or add a spinner if needed

  return (
    <img
      className="rounded-full size-8 me-2 object-cover"
      src={imageUrl}
      alt={`${educator?.first_name} ${educator?.last_name}`}
    />
  );
}

export default EducatorImage;

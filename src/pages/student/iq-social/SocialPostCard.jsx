import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageSquare, Share2 } from "lucide-react";

const SocialPostCard = ({ post, onEdit, refetch }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [selectedImage]);

  const {
    content,
    images = [],
    author,
    createdAt,
    likeCount = 0,
    commentCount = 0,
  } = post;

  return (
    <div className="card rounded-xl bg-white dark:bg-gray-800 p-5 mb-6 transition-all">
      {/* Author */}
      <div className="flex items-center mb-4">
        <img
          src={author?.image}
          alt={author?.first_name}
          className="w-12 h-12 rounded-full object-cover border-2 border-gray-300 dark:border-gray-700"
        />
        <div className="ml-3">
          <p className="font-semibold text-gray-800 dark:text-gray-100">
            {author?.first_name} {author?.last_name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Post Content */}
      {content && (
        <p className="text-gray-800 dark:text-gray-200">{content}</p>
      )}

      {/* Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 gap-4 mt-4">
          {images.map((img) => (
            <img
              key={img._id || img.url}
              src={img.url}
              alt="post"
              className="w-full h-60 rounded-lg object-cover shadow-md transition-all duration-300 cursor-pointer"
              onClick={() => setSelectedImage(img.url)} // 🔑 Open modal on click
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative flex items-center justify-center"
            onClick={(e) => e.stopPropagation()} // prevent close on inside click
          >
            <img
              src={selectedImage}
              alt="post"
              className="rounded-2xl max-w-full max-h-[90vh]"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 bg-white text-black px-3 py-1 rounded-lg shadow"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Optional Edit Button */}
      {onEdit && (
        <div className="text-right mt-3">
          <button
            onClick={() => onEdit(post)}
            className="text-xs text-blue-500 hover:underline transition-all duration-300"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default SocialPostCard;

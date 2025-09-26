import React from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, MessageSquare, Share2 } from "lucide-react";

const SocialPostCard = ({ post, onEdit, refetch }) => {
  const {
    _id,
    content,
    images = [],
    author,
    createdAt,
    likeCount = 0,
    commentCount = 0,
  } = post;

  return (
    <div className="card rounded-xl bg-white dark:bg-gray-800 p-5 mb-6 transition-all">
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
        <p className="text-gray-800 dark:text-gray-200 mb-4">{content}</p>
      )}

      {/* Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {images.map((img) => (
            <img
              key={img._id || img.url}
              src={img.url}
              alt="post"
              className="w-full rounded-lg object-cover shadow-md hover:scale-105 transition-all duration-300"
            />
          ))}
        </div>
      )}

      {/* Actions */}
      {/* <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-3 text-sm text-gray-600 dark:text-gray-300">
        <button className="flex items-center gap-1 hover:text-red-500 transition-all duration-300">
          <Heart size={18} /> {likeCount}
        </button>
        <button className="flex items-center gap-1 hover:text-blue-500 transition-all duration-300">
          <MessageSquare size={18} /> {commentCount}
        </button>
        <button className="flex items-center gap-1 hover:text-green-500 transition-all duration-300">
          <Share2 size={18} /> Share
        </button>
      </div> */}

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

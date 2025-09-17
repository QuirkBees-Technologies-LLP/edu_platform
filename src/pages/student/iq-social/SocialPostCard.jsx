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
    <div className="card rounded-xl shadow-md bg-white dark:bg-gray-900 p-4 mb-6">
      {/* Author Info */}
      <div className="flex items-center mb-3">
        <img
          src={author?.image}
          alt={author?.first_name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="ml-3">
          <p className="font-semibold text-gray-800 dark:text-gray-100">
            {author?.first_name} {author?.last_name}
          </p>
          <p className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Post Content */}
      {content && (
        <p className="text-gray-800 dark:text-gray-200 mb-3">{content}</p>
      )}

      {/* Images */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          {images.map((img) => (
            <img
              key={img._id || img.url}
              src={img.url}
              alt="post"
              className="w-full rounded-lg object-cover"
            />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center border-t border-gray-200 dark:border-gray-700 pt-3 text-sm text-gray-600 dark:text-gray-300">
        <button className="flex items-center gap-1 hover:text-red-500">
          <Heart size={18} /> {likeCount}
        </button>
        <button className="flex items-center gap-1 hover:text-blue-500">
          <MessageSquare size={18} /> {commentCount}
        </button>
        <button className="flex items-center gap-1 hover:text-green-500">
          <Share2 size={18} /> Share
        </button>
      </div>

      {/* Optional Edit Button */}
      {onEdit && (
        <div className="text-right mt-2">
          <button
            onClick={() => onEdit(post)}
            className="text-xs text-blue-500 hover:underline"
          >
            Edit
          </button>
        </div>
      )}
    </div>
  );
};

export default SocialPostCard;

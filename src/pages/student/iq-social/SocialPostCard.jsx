import React, { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router";
import { Heart, MessageSquare, Share2, Edit } from "lucide-react";

const SocialPostCard = ({ post, onEdit, refetch }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = selectedImage ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [selectedImage]);

  const {
    content,
    images = [],
    author,
    videos = [],
    createdAt,
    likeCount = 0,
    commentCount = 0,
  } = post;

  // Convert HTML → plain text
  const htmlToPlainText = (html) => {
    if (!html) return "";
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      return (doc.body.textContent || "").trim();
    } catch {
      return html.replace(/<[^>]+>/g, "").trim();
    }
  };

  const plainTextContent = htmlToPlainText(content || "");

  // Convert URLs into clickable links
  const makeClickableLinks = (text) =>
    text.replace(/(https?:\/\/[^\s]+|www\.[^\s]+)/g, (url) => {
      const clickableUrl = url.startsWith("http") ? url : `https://${url}`;
      return `<a href="${clickableUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-[#8B5CF6] hover:underline">${url}</a>`;
    });

  const displayText = isExpanded
    ? plainTextContent
    : plainTextContent.substring(0, 200);

  const finalHtml =
    makeClickableLinks(displayText) +
    (plainTextContent.length > 200
      ? isExpanded
        ? ` <span id="toggleText" class="text-blue-600 dark:text-[#8B5CF6] cursor-pointer font-medium ml-1">Show less</span>`
        : ` <span id="toggleText" class="text-blue-600 dark:text-[#8B5CF6] cursor-pointer font-medium">...more</span>`
      : "");

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-[#22242A] bg-white dark:bg-[#16181D] p-6 mb-6 transition-all duration-300 w-full">
      {/* Author Info */}
      <div className="flex items-center mb-4">
        <img
          onClick={() => navigate(`/iq-educators/${author?._id}`)}
          src={
            author?.image ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              author?.first_name || "User"
            )}&background=random&color=fff&size=80`
          }
          alt={author?.first_name}
          className="w-12 h-12 rounded-full object-contain border border-gray-300 dark:border-[#2C2F36] cursor-pointer hover:opacity-90 transition-all"
        />
        <div className="ml-3">
          <p
            onClick={() => navigate(`/iq-educators/${author?._id}`)}
            className="font-medium text-gray-900 dark:text-[#EDEDED] hover:text-blue-600 dark:hover:text-[#8B5CF6] cursor-pointer transition-colors"
          >
            {author?.first_name} {author?.last_name}
          </p>
          <p className="text-xs text-gray-500 dark:text-[#9CA3AF]">
            Educator •{" "}
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Post Content */}
      {plainTextContent && (
        <div className="mb-3">
          <p
            className="text-sm text-gray-800 dark:text-[#EDEDED] transition-colors duration-300 leading-relaxed whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: finalHtml }}
            onClick={(e) => {
              if (e.target.id === "toggleText") setIsExpanded(!isExpanded);
            }}
          />
        </div>
      )}

      {/* Images */}
      {images.length > 0 && (
        <div
          className={`grid ${
            images.length === 1 ? "grid-cols-1" : "grid-cols-2"
          } gap-3 mt-3`}
        >
          {/* {images.map((img) => (
            <div key={img._id || img.url} className="relative group">
              <img
                src={img.url}
                alt="post"
                className="w-full h-60 rounded-xl object-contain border border-gray-200 dark:border-[#22242A] cursor-pointer hover:opacity-90 transition-all"
                onClick={() => setSelectedImage(img.url)}
              />
            </div>
          ))} */}

          {images.map((img) => (
            <div
              key={img._id || img.url}
              className="relative w-full overflow-hidden rounded-xl bg-black/5 dark:bg-white/5 group cursor-pointer"
              onClick={() => setSelectedImage(img.url)}
            >
              <img
                src={img.url}
                alt="post"
                className="w-full aspect-square object-contain transition-all duration-300 ease-in-out group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      )}
      {videos.length > 0 && (
        <div
          className={`grid ${
            videos.length === 1 ? "grid-cols-1" : "grid-cols-2"
          } gap-3 mt-3`}
        >
          {videos.map((vid) => (
            <div key={vid._id || vid.url} className="relative group">
              <video
                src={vid.url}
                alt="post"
                controls
                className="w-full h-56 rounded-xl object-cover border border-gray-200 dark:border-[#22242A] cursor-pointer hover:opacity-90 transition-all"
                // onClick={() => setSelectedImage(img.url)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage}
              alt="post"
              className="rounded-2xl max-w-full max-h-[90vh] border border-gray-200 dark:border-[#2C2F36]"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 bg-white dark:bg-[#1F1F23] text-black dark:text-[#EDEDED] hover:bg-gray-200 dark:hover:bg-[#3B3B42] px-3 py-1 rounded-lg shadow-md transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Action Bar */}
      {/* <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-200 dark:border-[#22242A] text-gray-600 dark:text-[#9CA3AF] text-sm"> */}
      {/* <div className="flex items-center gap-5">
          <button className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-[#8B5CF6] transition-all">
            <Heart size={16} /> {likeCount}
          </button>
          <button className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-[#8B5CF6] transition-all">
            <MessageSquare size={16} /> {commentCount}
          </button>
          <button className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-[#8B5CF6] transition-all">
            <Share2 size={16} /> Share
          </button>
        </div> */}

      {/* {onEdit && (
          <button
            onClick={() => onEdit(post)}
            className="flex items-center gap-1 text-xs text-blue-500 dark:text-[#8B5CF6] hover:underline transition"
          >
            <Edit size={14} /> Edit
          </button>
        )} */}
      {/* </div> */}
    </div>
  );
};

export default SocialPostCard;

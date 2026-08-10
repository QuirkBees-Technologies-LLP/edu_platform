import React, { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router";
import { Heart, MessageSquare, Share2, Edit, Play, MoreHorizontal, Trash2 } from "lucide-react";
import { getEmbedUrl, getVideoThumbnail } from "@/utils/videoUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import DeletePostDialog from "@/components/DeletePostDialog";

const SocialPostCard = ({ post, onEdit, refetch }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dyntubeModalOpen, setDyntubeModalOpen] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const deleteDialogRef = useRef(null);
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
    dyntubeUrl,
    tradingViewImages = [],
    createdAt,
    likeCount = 0,
    commentCount = 0,
  } = post;

  // Extract plain text length for truncation logic, but keep HTML for display
  const getPlainTextLength = (html) => {
    if (!html) return 0;
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      return (doc.body.textContent || "").trim().length;
    } catch {
      return html.replace(/<[^>]+>/g, "").trim().length;
    }
  };

  const richContent = content || "";
  const contentLength = getPlainTextLength(richContent);

  // Safe HTML truncation that doesn't break tags
  const truncateHtml = (html, maxLen) => {
    if (!html) return "";
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const text = doc.body.textContent || "";
      if (text.length <= maxLen) return html;

      let remaining = maxLen;
      const truncateNode = (node) => {
        if (remaining <= 0) {
          node.remove();
          return;
        }
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.textContent.length > remaining) {
            node.textContent = node.textContent.substring(0, remaining) + "…";
            remaining = 0;
          } else {
            remaining -= node.textContent.length;
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const children = Array.from(node.childNodes);
          for (const child of children) {
            truncateNode(child);
          }
        }
      };

      truncateNode(doc.body);
      return doc.body.innerHTML;
    } catch {
      return html.substring(0, maxLen) + "…";
    }
  };

  const displayHtml = isExpanded ? richContent : truncateHtml(richContent, 200);

  const finalHtml =
    displayHtml +
    (contentLength > 200
      ? isExpanded
        ? ` <span id="toggleText" class="text-blue-600 dark:text-[#8B5CF6] cursor-pointer font-medium ml-1">Show less</span>`
        : ` <span id="toggleText" class="text-blue-600 dark:text-[#8B5CF6] cursor-pointer font-medium">...more</span>`
      : "");

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-[#22242A] bg-white dark:bg-[#16181D] p-6 mb-6 transition-all duration-300 w-full">
      {/* Author Info */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
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
        {onEdit && (
          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="text-gray-500 dark:text-[#9CA3AF] hover:text-gray-900 dark:hover:text-white p-1 rounded-full hover:bg-gray-100 dark:hover:bg-[#22242A] transition-all"
            >
              <MoreHorizontal size={18} />
            </button>
            {showOptions && (
              <div className="absolute right-0 top-8 bg-white dark:bg-[#1F1F23] border border-gray-200 dark:border-[#2C2F36] rounded-lg shadow-lg py-2 min-w-[120px] z-[9]">
                <button
                  onClick={() => {
                    onEdit(post);
                    setShowOptions(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-[#EDEDED] hover:bg-gray-100 dark:hover:bg-[#22242A] flex items-center gap-2"
                >
                  <Edit size={14} />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setIsDeleteOpen(true);
                    setShowOptions(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-[#22242A] flex items-center gap-2"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Post Content */}
      {richContent && (
        <div className="mb-3">
          <div
            className="text-sm text-gray-800 dark:text-[#EDEDED] transition-colors duration-300 leading-relaxed whitespace-pre-wrap break-words prose prose-sm max-w-none dark:prose-invert"
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
          className={`grid ${images.length === 1 ? "grid-cols-1" : "grid-cols-2"
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
          className={`${videos.length === 1 ? "flex justify-center" : "grid grid-cols-2 gap-3"
            } mt-3`}
        >
          {videos.map((vid) => (
            <div key={vid._id || vid.url} className={`relative group ${videos.length === 1 ? "w-full max-w-lg" : ""}`}>
              <video
                src={vid.url}
                alt="post"
                controls
                className={`w-full ${videos.length === 1 ? "h-[420px]" : "h-56"} rounded-xl object-contain bg-black/5 dark:bg-white/5 border border-gray-200 dark:border-[#22242A] cursor-pointer hover:opacity-90 transition-all`}
              />
            </div>
          ))}
        </div>
      )}

      {/* DynTube Thumbnail + Play Button */}

      {/* TradingView Chart Images */}
      {tradingViewImages?.length > 0 && (
        <div className="mt-3 space-y-3">
          <div
            className={`grid ${tradingViewImages.length === 1 ? "grid-cols-1" : "grid-cols-2"
              } gap-3`}
          >
            {[...tradingViewImages]
              .filter((tvImg) => tvImg?.url)
              .sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
              .map((tvImg, index) => (
                <div key={tvImg?._id || tvImg?.url || index} className="flex flex-col gap-1.5">
                  <div
                    className="relative w-full overflow-hidden rounded-xl bg-black/5 dark:bg-white/5 group cursor-pointer"
                    onClick={() => setSelectedImage(tvImg?.url)}
                  >
                    <img
                      src={tvImg?.url}
                      alt="TradingView Chart"
                      loading="lazy"
                      className="w-full aspect-video object-contain transition-all duration-300 ease-in-out group-hover:scale-105"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                  {tvImg?.tradingViewUrl && (
                    <a
                      href={tvImg.tradingViewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 truncate transition-colors"
                      title={tvImg.tradingViewUrl}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                      <span className="truncate">{tvImg.tradingViewUrl}</span>
                    </a>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}
      {dyntubeUrl && (
        <div
          className="mt-3 relative w-full rounded-xl overflow-hidden bg-black border border-gray-200 dark:border-[#22242A] cursor-pointer group"
          style={{ aspectRatio: '16/9' }}
          onClick={() => setDyntubeModalOpen(true)}
        >
          {/* Non-interactive iframe as thumbnail (same as StrategyVideoCarousel) */}
          <iframe
            src={getEmbedUrl(dyntubeUrl)}
            className="w-full h-full"
            loading="lazy"
            tabIndex={-1}
            scrolling="no"
            style={{ pointerEvents: 'none', border: 'none', overflow: 'hidden' }}
            title="DynTube Video"
          />
          {/* Invisible overlay to capture clicks safely just in case */}
          <div className="absolute inset-0" />
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
      {/* DynTube Video Modal */}
      {dyntubeUrl && (
        <Dialog open={dyntubeModalOpen} onOpenChange={setDyntubeModalOpen}>
          <DialogContent
            className="max-w-5xl w-full p-0 !overflow-hidden bg-black border-gray-800 !max-h-[85vh] flex flex-col"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DialogHeader className="px-5 pt-4 pb-2 shrink-0">
              <DialogTitle className="text-white text-lg font-semibold truncate pr-8">
                Video
              </DialogTitle>
              <DialogDescription className="sr-only">
                DynTube video player
              </DialogDescription>
            </DialogHeader>
            <div className="w-full flex-1 min-h-0 p-4 pt-0">
              <div className="aspect-video w-full h-full max-h-full">
                {dyntubeModalOpen && (
                  <iframe
                    src={getEmbedUrl(dyntubeUrl)}
                    className="w-full h-full rounded-lg"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="DynTube Video Player"
                    style={{ border: 'none' }}
                  />
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Post Dialog */}
      {onEdit && (
        <DeletePostDialog
          isDeleteOpen={isDeleteOpen}
          handleDeleteClose={() => setIsDeleteOpen(false)}
          selectedPost={{ ...post, id: post._id }}
          refetch={refetch}
          ref={deleteDialogRef}
        />
      )}
    </div>
  );
};

export default SocialPostCard;

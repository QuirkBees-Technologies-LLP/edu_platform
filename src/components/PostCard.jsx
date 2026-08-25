import React, { useState, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Edit,
  Trash2,
  Play,
  X,
  FileText,
} from "lucide-react";
import { getEmbedUrl, getVideoThumbnail } from "@/utils/videoUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useDispatch, useSelector } from "react-redux";
import {
  likePost,
  unlikePost,
  deleteEducatorPost,
  setSelectedPost,
} from "@/store/reducer/postSlice";
import DeletePostDialog from "./DeletePostDialog";
import { useEffect } from "react";

const PostCard = ({ post, onEdit, isOwnPost = false, refetch }) => {
  const dispatch = useDispatch();
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [showOptions, setShowOptions] = useState(false);
  const [isContentExpanded, setIsContentExpanded] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const deleteDialogRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dyntubeModalOpen, setDyntubeModalOpen] = useState(false);

  
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

  const richContent = post?.content || "";
  const contentLength = getPlainTextLength(richContent);

  // For truncation: use a safe HTML truncation that doesn't break tags
  const truncateHtml = (html, maxLen) => {
    if (!html) return "";
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const text = doc.body.textContent || "";
      if (text.length <= maxLen) return html;

      // Walk the DOM and truncate text nodes
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
        ? ` <span id="toggleText" class="text-blue-600 hover:text-blue-800 cursor-pointer font-medium ml-1">Show less</span>`
        : ` <span id="toggleText" class="text-blue-600 hover:text-blue-800 cursor-pointer font-medium">...more</span>`
      : "");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  const handleLike = () => {
    if (isLiked) {
      dispatch(unlikePost(post.id));
      setIsLiked(false);
    } else {
      dispatch(likePost(post.id));
      setIsLiked(true);
    }
  };

  const toggleContent = () => {
    setIsContentExpanded(!isContentExpanded);
  };

  const handleDelete = () => {
    setIsDeleteOpen(true);
    setShowOptions(false);
  };

  const handleDeleteClose = () => {
    setIsDeleteOpen(false);
  };

  const handleEdit = () => {
    dispatch(setSelectedPost(post));
    onEdit(post);
    setShowOptions(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffSeconds = Math.floor(diffTime / 1000);
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffSeconds < 60) {
      return `${diffSeconds} sec ago`;
    } else if (diffMinutes < 60) {
      return `${diffMinutes} min ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    } else if (diffDays < 30) {
      const weeks = Math.ceil(diffDays / 7);
      return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
    } else if (diffDays < 365) {
      const months = Math.ceil(diffDays / 30);
      return `${months} month${months > 1 ? "s" : ""} ago`;
    } else {
      const years = Math.ceil(diffDays / 365);
      return `${years} year${years > 1 ? "s" : ""} ago`;
    }
  };

  const renderMedia = () => {
    const hasImages = post.images && post.images.length > 0;
    const hasVideos = post.videos && post.videos.length > 0;
    const hasDocuments = post.documents && post.documents.length > 0;
    const hasDyntubeUrl = !!post.dyntubeUrl;

    if (!hasImages && !hasVideos && !hasDocuments && !hasDyntubeUrl) return null;

    return (
      <div className="space-y-3">
        {/* Images */}
        {hasImages && (
          <div>
            {post.images.length === 1 ? (
              <>
                <img
                  src={post.images[0]}
                  alt="Post content"
                  className="w-[650px] rounded-lg h-96 object-cover cursor-pointer"
                  onClick={() => setIsOpen(true)}
                />

                {/* Modal */}
                {isOpen && (
                  <div
                    className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="relative flex items-center justify-center">
                      <img
                        src={post.images[0]}
                        alt="Post enlarged"
                        className="max-w-full max-h-[90vh] rounded-2xl"
                      />
                      <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-2 right-2 bg-white text-black px-3 py-1 rounded-lg shadow"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {post.images.slice(0, 4).map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`Post content ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    {index === 3 && post.images.length > 4 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                        <span className="text-white font-semibold">
                          +{post.images.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Videos */}
        {hasVideos && (
          <div className="space-y-2">
            {post.videos.map((video, index) => (
              <video
                key={index}
                src={video}
                className="w-full rounded-lg"
                controls
              />
            ))}
          </div>
        )}

        {/* Documents */}
        {hasDocuments && (
          <div className="space-y-2">
            {post.documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <FileText size={24} className="text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">
                    {doc.name || `Document ${index + 1}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {doc.type || "Document"}
                  </p>
                </div>
                <a
                  href={doc.url || doc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        )}

        {/* DynTube Thumbnail + Play Button */}
        {hasDyntubeUrl && (
          <div
            className="relative w-full rounded-lg overflow-hidden bg-black cursor-pointer group"
            style={{ aspectRatio: '16/9' }}
            onClick={() => setDyntubeModalOpen(true)}
          >
            {/* Non-interactive iframe as thumbnail (same as StrategyVideoCarousel) */}
            <iframe
              src={getEmbedUrl(post.dyntubeUrl)}
              className="w-full h-full"
              loading="lazy"
              tabIndex={-1}
              scrolling="no"
              style={{ pointerEvents: 'none', border: 'none', overflow: 'hidden' }}
              title="DynTube Video"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-white/30 group-hover:scale-110 transition-all duration-200">
                <Play size={28} className="text-white ml-1" fill="white" />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="card rounded-lg shadow-md p-4 mb-4">
      {/* Post Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
          <img
            src={
              post.author?.image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || "User")}&background=random&color=fff&size=48`
            }
            alt={post.author?.name || "User"}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author?.name || "User")}&background=random&color=fff&size=48`;
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-gray-800 font-termina">
                {post.author?.name || "Anonymous User"}
              </h3>
              <p className="text-gray-500 text-xs font-termina capitalize">
                {post.author?.role && `${post.author.role} • `}
                {formatDate(post.createdAt)}
              </p>
            </div>
            {isOwnPost && (
              <div className="relative">
                <button
                  onClick={() => setShowOptions(!showOptions)}
                  className="text-gray-500 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
                >
                  <MoreHorizontal size={16} />
                </button>

                {showOptions && (
                  <div className="absolute right-0 top-8 bg-white dark:bg-gray-200 border border-gray-200 rounded-lg shadow-lg py-2 min-w-[120px] z-[9]">
                    <button
                      onClick={handleEdit}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Edit size={14} />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-100 flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

     {richContent && (
        <div className="mb-3">
          <div
            className="text-sm text-gray-700 leading-relaxed font-termina whitespace-pre-wrap break-words prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: finalHtml }}
            onClick={(e) => {
              if (e.target.id === "toggleText") setIsExpanded(!isExpanded);
            }}
          />
        </div>
      )}

      {/* Post Media */}
      {renderMedia()}

      {/* Delete Post Dialog */}
      <DeletePostDialog
        isDeleteOpen={isDeleteOpen}
        handleDeleteClose={handleDeleteClose}
        selectedPost={post}
        refetch={refetch}
        ref={deleteDialogRef}
      />

      {/* DynTube Video Modal */}
      {post.dyntubeUrl && (
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
                    src={getEmbedUrl(post.dyntubeUrl)}
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
    </div>
  );
};

export default PostCard;

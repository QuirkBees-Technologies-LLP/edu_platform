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

  
  const htmlToPlainText = (html) => {
    if (!html) return "";
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const text = doc.body.textContent || "";
      return text.trim();
    } catch (err) {
      return html.replace(/<[^>]+>/g, "").trim(); // fallback
    }
  };


  const plainTextContent = htmlToPlainText(post?.content || "");


  const makeClickableLinks = (text) =>
    text.replace(/(https?:\/\/[^\s]+|www\.[^\s]+)/g, (url) => {
      const clickableUrl = url.startsWith("http") ? url : `https://${url}`;
      return `<a href="${clickableUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">${url}</a>`;
    });

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    // Cleanup (jab component unmount ya modal close thaye)
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

    if (!hasImages && !hasVideos && !hasDocuments) return null;

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
      </div>
    );
  };

    const displayText = isExpanded
    ? plainTextContent
    : plainTextContent.substring(0, 200);
  const finalHtml =
    makeClickableLinks(displayText) +
    (plainTextContent.length > 200
      ? isExpanded
        ? ` <span id="toggleText" class="text-blue-600 hover:text-blue-800 cursor-pointer font-medium ml-1">Show less</span>`
        : ` <span id="toggleText" class="text-blue-600 hover:text-blue-800 cursor-pointer font-medium">...more</span>`
      : "");

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

      {/* Post Content */}
        {/* {post.content && (
                <div className="mb-3">
                    <p className="text-sm text-gray-700 leading-relaxed font-termina whitespace-pre-wrap break-words">
                        {post.content.length > 200 && !isContentExpanded
                            ? (
                                <>
                                    {post.content.substring(0, 200)}
                                    <span className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium" onClick={toggleContent}>
                                        ...more
                                    </span>
                                </>
                            )
                            : (
                                <>
                                    {post.content}
                                    {post.content.length > 200 && (
                                        <span className="text-blue-600 hover:text-blue-800 cursor-pointer font-medium ml-1" onClick={toggleContent}>
                                            Show less
                                        </span>
                                    )}
                                </>
                            )
                        }
                    </p>
                </div>
            )} */}
     {plainTextContent && (
        <div className="mb-3">
          <p
            className="text-sm text-gray-700 leading-relaxed font-termina whitespace-pre-wrap break-words"
            dangerouslySetInnerHTML={{ __html: finalHtml }}
            onClick={(e) => {
              if (e.target.id === "toggleText") setIsExpanded(!isExpanded);
            }}
          />
        </div>
      )}

      {/* Post Media */}
      {renderMedia()}

      {/* Post Actions - Commented out */}
      {/* <div className="mt-4 flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-6">
                    <button 
                        onClick={handleLike}
                        className={`flex items-center gap-2 text-sm transition-colors ${
                            isLiked 
                                ? 'text-red-500' 
                                : 'text-gray-600 hover:text-red-500'
                        }`}
                    >
                        <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                        <span className="font-termina">{post.likeCount || 0}</span>
                    </button>
                    
                    <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-500 transition-colors">
                        <MessageCircle size={18} />
                        <span className="font-termina">{post.commentCount || 0}</span>
                    </button>
                    
                    <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-500 transition-colors">
                        <Share2 size={18} />
                        <span className="font-termina">{post.shareCount || 0}</span>
                    </button>
                </div>
            </div> */}

      {/* Delete Post Dialog */}
      <DeletePostDialog
        isDeleteOpen={isDeleteOpen}
        handleDeleteClose={handleDeleteClose}
        selectedPost={post}
        refetch={refetch}
        ref={deleteDialogRef}
      />
    </div>
  );
};

export default PostCard;

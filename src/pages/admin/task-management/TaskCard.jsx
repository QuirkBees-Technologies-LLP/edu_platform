import React, { useState, useEffect } from "react";
import { MoreHorizontal, Edit, Trash2, FileText, Flag } from "lucide-react";

const priorityColors = {
  low: "bg-green-100 text-green-700",
  medium: "bg-yellow-100 text-yellow-700",
  high: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

const ShowMoreLess = ({
  text = "",
  html = "",
  limit = 120,
  showMoreText = " Show More",
  showLessText = " Show Less",
  className = "text-sm text-gray-700 leading-relaxed",
}) => {
  const [expanded, setExpanded] = useState(false);
  const isHtml = !!html;
  const content = isHtml ? html : text;
  const plainText = isHtml ? content.replace(/<[^>]+>/g, "") : text;
  const isLong = plainText.length > limit;

  return (
    <div className={className}>
      <div
        className={`${!expanded && isLong ? "line-clamp-4" : ""}`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
      {isLong && (
        <span
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 cursor-pointer hover:underline font-medium"
        >
          {expanded ? showLessText : showMoreText}
        </span>
      )}
    </div>
  );
};

const TaskCard = ({ task, onEdit, onDelete, isOwnTask = false }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    document.body.style.overflow = selectedImage ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [selectedImage]);

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

  const makeClickableLinks = (htmlOrText) => {
    if (!htmlOrText) return "";
    return htmlOrText.replace(/(https?:\/\/[^\s]+|www\.[^\s]+)/g, (url) => {
      const clickableUrl = url.startsWith("http") ? url : `https://${url}`;
      return `<a href="${clickableUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 underline hover:text-blue-800">${url}</a>`;
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderMedia = () => {
    const { images = [], videos = [], documents = [] } = task;
    const getUrl = (item) => (typeof item === "string" ? item : item?.url);

    if (!images.length && !videos.length && !documents.length) return null;

    return (
      <div className="space-y-3 mt-3">
        {images.length > 0 && (
          <div>
            {images.length === 1 ? (
              <img
                src={getUrl(images[0])}
                alt="Task attachment"
                className="w-full max-w-[650px] rounded-lg h-96 object-cover cursor-pointer"
                onClick={() => setSelectedImage(getUrl(images[0]))}
              />
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {images.slice(0, 4).map((img, i) => (
                  <div key={i} className="relative">
                    <img
                      src={getUrl(img)}
                      alt="Task"
                      className="w-full h-96 object-cover rounded-lg cursor-pointer"
                      onClick={() => setSelectedImage(getUrl(img))}
                    />
                    {i === 3 && images.length > 4 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                        <span className="text-white font-semibold">
                          +{images.length - 4}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {videos.length > 0 && (
          <div className="space-y-2 ">
            {videos.map((video, i) => (
              <video
                key={i}
                src={getUrl(video)}
                className="w-full rounded-lg"
                controls
              />
            ))}
          </div>
        )}

        {documents.length > 0 && (
          <div className="space-y-2 ">
            {documents.map((doc, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <FileText size={24} className="text-blue-500" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700">
                    {doc.name || `Document ${i + 1}`}
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

  const handleDelete = () => {
    onDelete?.(task);
    setShowOptions(false);
  };

  const handleEdit = () => {
    onEdit?.(task);
    setShowOptions(false);
  };

  const safeHtml = makeClickableLinks(task?.description || "");

  console.log(safeHtml, "safeHtml");

  return (
    <>
      <div className="card rounded-lg shadow-md p-5 mb-4 transition hover:shadow-lg">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg">
              {task.title || "Untitled Task"}
            </h3>
            <p className="text-gray-500 text-xs flex items-center gap-2">
              Created by{" "}
              {task.author
                ? `${task.author.first_name || ""} ${task.author.last_name || ""}`
                : "Unknown"}{" "}
              • {formatDate(task.createdAt)}
              {task.priority && (
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full ${
                    priorityColors[task.priority] || "bg-gray-100 text-gray-700"
                  }`}
                >
                  <Flag size={10} />{" "}
                  {task.priority.charAt(0).toUpperCase() +
                    task.priority.slice(1)}
                </span>
              )}
            </p>
          </div>

          {isOwnTask && (
            <div className="relative">
              <button
                onClick={() => setShowOptions(!showOptions)}
                className="text-gray-500 hover:text-gray-900 p-1 rounded-full hover:bg-gray-100"
              >
                <MoreHorizontal size={18} />
              </button>

              {showOptions && (
                <div
                  className="absolute right-0 top-8 min-w-[140px] 
               bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50
               dark:bg-slate-800 dark:border-slate-700 dark:text-gray-100"
                >
                  <button
                    onClick={handleEdit}
                    className="w-full text-left px-4 py-2 text-sm flex items-center gap-2
                 text-gray-700 hover:bg-gray-100
                 dark:text-gray-800 dark:hover:bg-slate-700"
                  >
                    <Edit size={14} />
                    Edit
                  </button>

                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-4 py-2 text-sm flex items-center gap-2
                 text-red-600 hover:bg-red-50
                 dark:text-red-400 dark:hover:bg-slate-700"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {task?.description && (
          <ShowMoreLess
            html={safeHtml}
            limit={500}
            className="text-sm text-gray-700 leading-relaxed font-termina whitespace-pre-wrap break-words"
          />
        )}

        {renderMedia()}
      </div>

      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage}
              alt="Task"
              className="rounded-2xl max-w-full max-h-[90vh] border border-gray-200"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-3 right-3 bg-white text-black hover:bg-gray-200 px-3 py-1 rounded-lg shadow-md transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default TaskCard;

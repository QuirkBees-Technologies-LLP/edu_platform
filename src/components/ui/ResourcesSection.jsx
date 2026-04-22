import { useState } from "react";
import { createPortal } from "react-dom";
import {
  Paperclip,
  FileText,
  FileSpreadsheet,
  FileImage,
  File as FileIcon,
  FileArchive,
  Eye,
  X,
  Loader2,
  Download,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ── helpers ───────────────────────────────────────────────────────────
const getFileIcon = (mimeType) => {
  if (!mimeType) return <FileIcon className="w-5 h-5 text-gray-400" />;
  if (mimeType?.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />;
  if (mimeType?.includes("word") || mimeType?.includes("document"))
    return <FileText className="w-5 h-5 text-blue-500" />;
  if (mimeType?.includes("sheet") || mimeType?.includes("excel") || mimeType?.includes("csv"))
    return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
  if (mimeType?.includes("presentation") || mimeType?.includes("powerpoint"))
    return <FileText className="w-5 h-5 text-orange-500" />;
  if (mimeType?.includes("image")) return <FileImage className="w-5 h-5 text-purple-500" />;
  if (mimeType?.includes("zip") || mimeType?.includes("rar"))
    return <FileArchive className="w-5 h-5 text-yellow-600" />;
  return <FileIcon className="w-5 h-5 text-gray-400" />;
};

const formatFileSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const getPreviewType = (mimeType) => {
  if (!mimeType) return "other";
  if (mimeType?.includes("image")) return "image";
  if (mimeType?.includes("pdf")) return "pdf";
  if (
    mimeType?.includes("word") ||
    mimeType?.includes("document") ||
    mimeType?.includes("presentation") ||
    mimeType?.includes("powerpoint") ||
    mimeType?.includes("sheet") ||
    mimeType?.includes("excel")
  )
    return "office";
  return "other";
};

// Forces a file-save dialog regardless of file type (image, pdf, etc.)
const triggerDownload = async (url, filename) => {
  try {
    const res = await fetch(url, { mode: "cors" });
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename || "download";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(blobUrl);
  } catch {
    // Fallback: open in new tab if fetch fails (e.g. strict CORS)
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

const ResourcesSection = ({ resources = [], className = "" }) => {
  const [previewResource, setPreviewResource] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  if (!resources?.length) return null;

  const openPreview = (resource) => {
    const type = getPreviewType(resource?.mimeType);
    if (type === "other") {
      window.open(resource?.url, "_blank", "noopener,noreferrer");
    } else {
      setPreviewResource(resource);
    }
  };

  const handleDownload = async (resource) => {
    setDownloadingId(resource?._id);
    await triggerDownload(resource?.url, resource?.originalName);
    setDownloadingId(null);
  };

  const handleModalDownload = async (resource) => {
    setDownloadingId("modal");
    await triggerDownload(resource?.url, resource?.originalName);
    setDownloadingId(null);
  };

  return (
    <>
      <div className={`space-y-3 p-4 rounded-lg border border-gray-200 shadow-sm ${className}`}>
        <h3 className="font-medium text-gray-800 flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-primary" />
          Resources
          <span className="bg-primary text-white text-xs w-5 h-5 flex items-center justify-center rounded-full leading-none">
            {resources?.length}
          </span>
        </h3>

        <div className="space-y-2">
          {resources?.map((resource) => (
            <div
              key={resource?._id}
              className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
            >
              {getFileIcon(resource?.mimeType)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {resource?.originalName}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(resource?.size)}
                </p>
              </div>

              {/* View button */}
              <button
                type="button"
                onClick={() => openPreview(resource)}
                className="p-2 text-primary hover:bg-primary/10 rounded-md transition-colors"
                title="View"
              >
                <Eye className="w-4 h-4" />
              </button>

              {/* Download button */}
              <button
                type="button"
                onClick={() => handleDownload(resource)}
                disabled={downloadingId === resource?._id}
                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors disabled:opacity-50"
                title="Download"
              >
                {downloadingId === resource?._id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {createPortal(
        <AnimatePresence>
          {previewResource && (
            <motion.div
              key="resource-preview-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ position: "fixed", inset: 0, zIndex: 9999 }}
              className="flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
              onClick={() => setPreviewResource(null)}
            >
              <motion.div
                key="resource-preview-modal"
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[95vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                  <div className="flex items-center gap-2 min-w-0">
                    {getFileIcon(previewResource?.mimeType)}
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {previewResource?.originalName}
                    </span>
                    <span className="text-xs text-gray-400 shrink-0">
                      {formatFileSize(previewResource?.size)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    {/* Download button in modal */}
                    <button
                      type="button"
                      onClick={() => handleModalDownload(previewResource)}
                      disabled={downloadingId === "modal"}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-primary text-primary hover:bg-primary hover:text-white transition-colors disabled:opacity-50"
                    >
                      {downloadingId === "modal" ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )}
                      Download
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewResource(null)}
                      className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-hidden relative">
                  {getPreviewType(previewResource?.mimeType) === "image" ? (
                    <div className="flex items-center justify-center p-6 h-full">
                      <img
                        src={previewResource?.url}
                        alt={previewResource?.originalName}
                        className="max-w-full max-h-[70vh] object-contain rounded-lg shadow"
                      />
                    </div>
                  ) : getPreviewType(previewResource?.mimeType) === "pdf" ? (
                    <iframe
                      src={previewResource?.url}
                      className="w-full h-[70vh] border-0"
                      title={previewResource?.originalName}
                    />
                  ) : getPreviewType(previewResource?.mimeType) === "office" ? (
                    <div className="relative w-full h-[70vh]">
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gray-50 text-gray-400 text-sm z-0">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span>Loading preview…</span>
                      </div>
                      <iframe
                        src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(previewResource?.url)}`}
                        className="relative z-10 w-full h-full border-0"
                        title={previewResource?.originalName}
                      />
                    </div>
                  ) : null}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default ResourcesSection;

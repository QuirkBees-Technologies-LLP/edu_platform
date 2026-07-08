import { useState } from "react";
import { FileText, Eye, Download, Loader2 } from "lucide-react";

const formatFileSize = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

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
    window.open(url, "_blank", "noopener,noreferrer");
  }
};

const StrategyResources = ({ resources = [] }) => {
  const [downloadingId, setDownloadingId] = useState(null);

  if (!resources?.length) return null;

  const handleView = (resource) => {
    window.open(resource?.url, "_blank", "noopener,noreferrer");
  };

  const handleDownload = async (resource) => {
    setDownloadingId(resource?._id);
    await triggerDownload(resource?.url, resource?.originalName);
    setDownloadingId(null);
  };

  return (
    <div className="space-y-2">
      {resources.map((resource) => (
        <div
          key={resource?._id}
          className="flex items-center gap-3 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 backdrop-blur-sm hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
        >
          <div className="w-8 h-8 rounded-lg bg-[#5961F6]/15 dark:bg-[#5961F6]/30 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-[#5961F6]" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {resource?.originalName}
            </p>
            <p className="text-xs text-gray-500 dark:text-white/60">
              {formatFileSize(resource?.size)}
            </p>
          </div>

          {/* View */}
          <button
            type="button"
            onClick={() => handleView(resource)}
            className="p-1.5 text-[#5961F6] hover:bg-[#5961F6]/10 dark:text-white dark:hover:text-white/50 dark:hover:bg-white/15 rounded-lg transition-colors"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </button>

          {/* Download */}
          <button
            type="button"
            onClick={() => handleDownload(resource)}
            disabled={downloadingId === resource?._id}
            className="p-1.5 text-gray-600 hover:text-[#5961F6] hover:bg-[#5961F6]/10 dark:text-white dark:hover:text-white dark:hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
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
  );
};

export default StrategyResources;

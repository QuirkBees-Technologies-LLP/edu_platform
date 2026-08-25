/* eslint-disable prettier/prettier */
import React, { useCallback, useRef, useState } from "react";
import { Upload, X, FileText, Film, Image } from "lucide-react";

/**
 * Reusable Drag & Drop file upload component.
 *
 * Props:
 * - accept:    string – comma-separated MIME types (e.g. "image/*,video/mp4")
 * - maxSize:   number – max file size in bytes (default 500MB)
 * - file:      File | null – current file (controlled)
 * - preview:   string – URL for preview (existing uploaded file)
 * - onChange:   (file: File | null) => void
 * - onRemove:  () => void
 * - label:     string – label text (optional)
 * - hint:      string – format hint (e.g. "JPG, PNG, WEBP")
 * - error:     string – error message
 * - disabled:  boolean
 */
const FileDropzone = ({
  accept = "*",
  maxSize = 500 * 1024 * 1024,
  file = null,
  preview = "",
  onChange,
  onRemove,
  label = "Upload File",
  hint = "",
  error = "",
  disabled = false,
}) => {
  const inputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);
  const [localError, setLocalError] = useState("");

  const validateFile = useCallback(
    (f) => {
      if (f.size > maxSize) {
        setLocalError(`File too large. Max ${(maxSize / 1024 / 1024).toFixed(0)}MB.`);
        return false;
      }
      setLocalError("");
      return true;
    },
    [maxSize]
  );

  const handleFile = useCallback(
    (f) => {
      if (!f || disabled) return;
      if (validateFile(f)) {
        onChange?.(f);
      }
    },
    [disabled, onChange, validateFile]
  );

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setDragActive(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    setLocalError("");
    onRemove?.();
  };

  const displayError = error || localError;

  // Determine if we have a file to show
  const hasFile = file || preview;
  const fileName = file?.name || (preview ? preview.split("/").pop() : "");
  const fileSize = file ? formatBytes(file.size) : "";
  const isImage =
    file?.type?.startsWith("image/") ||
    /\.(jpg|jpeg|png|gif|webp)$/i.test(preview);
  const isVideo =
    file?.type?.startsWith("video/") ||
    /\.(mp4|mov|webm)$/i.test(preview);
  const previewUrl = file ? URL.createObjectURL(file) : preview;

  return (
    <div className="space-y-1.5">
      {/* Dropzone */}
      <div
        onClick={() => !disabled && inputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          ${dragActive
            ? "border-primary bg-primary/5 dark:bg-primary/10"
            : displayError
              ? "border-rose-400 bg-rose-50/50 dark:bg-rose-500/5"
              : "border-gray-300 dark:border-gray-600 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-white/[.02]"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          className="hidden"
          disabled={disabled}
        />

        {hasFile ? (
          /* ── File Preview ── */
          <div className="flex items-center gap-4 px-5 py-4">
            {/* Preview thumbnail */}
            <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-100 dark:bg-[#1e2028] flex items-center justify-center border border-gray-200 dark:border-gray-700">
              {isImage && previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : isVideo ? (
                <Film className="w-6 h-6 text-indigo-500" />
              ) : (
                <FileText className="w-6 h-6 text-blue-500" />
              )}
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                {fileName}
              </p>
              {fileSize && (
                <p className="text-xs text-gray-500 mt-0.5">{fileSize}</p>
              )}
              <p className="text-xs text-primary mt-1 hover:underline">
                Click to replace
              </p>
            </div>

            {/* Remove button */}
            <button
              type="button"
              onClick={handleRemove}
              className="flex-shrink-0 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a2d35] text-gray-400 hover:text-rose-500 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <div className="p-3 rounded-full bg-primary/10 mb-3">
              <Upload className="w-6 h-6 text-primary" />
            </div>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">
              {label}
            </p>
            {hint && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hint}</p>
            )}
            <p className="text-xs text-primary mt-2">
              Click or drag & drop a file here
            </p>
          </div>
        )}
      </div>

      {/* Error */}
      {displayError && (
        <p className="text-xs text-rose-500">{displayError}</p>
      )}
    </div>
  );
};

function formatBytes(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export default FileDropzone;

import { useEffect, useState, useCallback } from "react";
import React from "react";
import { Clock, Loader2, FileText, Video, AlertCircle } from "lucide-react";
import ReactPlayer from "react-player/lazy";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

import { lmsLectures } from "../../../../../../services";
import { useAuthContext } from "../../../../../../auth/useAuthContext";
import ShowMoreLess from "../../../../../../components/ui/showmoreless";

const LectureMainContent = ({ currentLecture }) => {
  const [lectureContent, setLectureContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { auth } = useAuthContext();

  useEffect(() => {
    const fetchLectureContent = async () => {
      if (!currentLecture?._id) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await lmsLectures.getLectureById(
          currentLecture._id,
          auth.token
        );
        setLectureContent(response.data);
      } catch (err) {
        console.error("Error fetching lecture content:", err);
        setError(err.message || "Failed to load lecture content");
      } finally {
        setIsLoading(false);
      }
    };
    console.log(lectureContent);
    fetchLectureContent();
  }, [currentLecture?._id, auth.token]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-gray-500">Loading lecture content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-red-50 rounded-lg border border-red-100 p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-red-800 mb-2">
          Error Loading Content
        </h3>
        <p className="text-red-600 text-center">{error}</p>
      </div>
    );
  }

  if (!lectureContent) {
    return (
      <div className="flex flex-col items-center justify-center h-96 bg-gray-50 rounded-lg p-8">
        <FileText className="w-12 h-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">
          No Content Available
        </h3>
        <p className="text-gray-500 text-center">
          This lecture doesn't have any content yet.
        </p>
      </div>
    );
  }

  const isVideoType =
    lectureContent.type === "VIDEO" || lectureContent.type === "video";

  return (
    <motion.div
      className="p-6 max-w-4xl mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {lectureContent.title}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-sm">
              {isVideoType ? (
                <Video className="w-4 h-4 text-blue-500" />
              ) : (
                <FileText className="w-4 h-4 text-purple-500" />
              )}
              <span>{isVideoType ? "Video" : "Text"}</span>
            </div>

            {lectureContent.duration && (
              <div className="flex items-center gap-1 text-gray-500">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{lectureContent.duration}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {lectureContent.description && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-5 mt-6">
          <h3 className="text-sm font-medium text-indigo-800 mb-2">
            Description
          </h3>
          {/* <p className="text-indigo-700">{lectureContent.description}</p> */}
          <ShowMoreLess html={lectureContent.description} limit={120} />
        </div>
      )}

      {isVideoType ? (
        <div className="bg-gray-900 rounded-xl overflow-hidden mb-6 shadow-lg">
          <div className="aspect-video">
            {lectureContent.content ? (
              <ReactPlayer
                url={lectureContent.content}
                width="100%"
                height="100%"
                controls
                config={{
                  youtube: {
                    playerVars: { showinfo: 1 },
                  },
                  vimeo: {
                    playerOptions: {
                      byline: false,
                      portrait: false,
                      title: false,
                    },
                  },
                }}
                fallback={
                  <div className="flex items-center justify-center h-full bg-gray-800">
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                  </div>
                }
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white">
                <Video className="w-16 h-16 text-gray-500 mb-4" />
                <p>No video URL provided</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="prose prose-lg max-w-none bg-white p-8 rounded-xl shadow-sm border border-gray-200 prose-headings:text-gray-800 prose-a:text-indigo-600">
          {lectureContent.content ? (
            <div
              dangerouslySetInnerHTML={{ __html: lectureContent.content }}
              className="rich-content"
              style={{
                lineHeight: 1.6,
                wordBreak: "break-word",
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-gray-500">
              <FileText className="w-10 h-10 text-gray-300 mb-3" />
              <p>No content available for this lecture</p>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default LectureMainContent;

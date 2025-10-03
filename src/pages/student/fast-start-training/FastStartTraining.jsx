import { CirclePlay } from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  useGetAcademyCategoryByMainSectionQuery,
  useGetFirstStartTrainingSectionQuery,
} from "../../../store/api/client/clientAcademyCategoryApiSlice";
import Loader from "../../../components/ui/loader";
import { useSelector } from "react-redux";
import { selectSelectedLanguage } from "../../../store/reducer/studentLanagugeSlice";
import ShowMoreLess from "../../../components/ui/showmoreless";
import { Accordion, AccordionItem } from "@/components/accordion";

export default function FastStartTraining() {
  const [activeLectureId, setActiveLectureId] = useState(null);
  const [openAccordionIndex, setOpenAccordionIndex] = useState([0]); // Back to array format
  const [activeTab, setActiveTab] = useState("");
  const [lecture, setLecture] = useState();
  const [id, setId] = useState();
  const [category, setCategory] = useState();

  const handleClick = (id) => {
    setId(id); // or simply: id, based on your API setup
  };

  const selectedLanguage = useSelector(selectSelectedLanguage);

  const {
    data,
    isLoading: isCategoryLoading,
    isError,
    refetch,
  } = useGetFirstStartTrainingSectionQuery(
    {
      mainSection: "Fast Start Training",
      id,
      category: activeTab,
      language: selectedLanguage, // Only use selectedLanguage, no fallback to category
    },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  const categories = data?.category || [];
  const course = data?.course || [];

  const [currentCourse, setCurrentCourse] = useState([]);

  useEffect(() => {
    console.log("Course data update:", {
      hasCourseData: !!data?.course,
      courseLength: data?.course?.length,
      activeTab,
      activeCategoryId: data?.ActiveCategory?.[0]?.categoryId,
      tabMatches: activeTab === `${data?.ActiveCategory?.[0]?.categoryId}`,
    });

    // Only set course data if we have course data AND the active tab matches
    if (
      data?.course &&
      data.course.length > 0 &&
      activeTab === `${data?.ActiveCategory?.[0]?.categoryId}`
    ) {
      setCurrentCourse(data.course);
      console.log("Setting course data:", data.course.length, "courses");
    } else {
      // Reset course data if no course data or tab doesn't match
      setCurrentCourse([]);
      console.log("Resetting course data - no valid course data");
    }
  }, [data, activeTab]);

  useEffect(() => {
    console.log("data in side ", data);

    // Auto-select first category tab when data loads
    if (data?.ActiveCategory?.length > 0 && !activeTab) {
      setActiveTab(data.ActiveCategory[0]?.categoryId);
    }

    // Auto-select first tab from categories if no active tab
    if (data?.categories?.length > 0 && !activeTab) {
      setActiveTab(data.categories[0]?._id);
    }

    // 🟢 Auto-select first lecture when data loads
    if (data?.course?.length > 0) {
      const firstCourse = data.course[0];
      if (firstCourse?.lectures?.length > 0) {
        const firstLectureId = firstCourse.lectures[0]._id;
        // Only set if no lecture is currently selected
        if (!activeLectureId) {
          setActiveLectureId(firstLectureId);
          setLecture(firstCourse.lectures[0] || {});
        }
      } else {
        setLecture({});
      }
    }
  }, [data, activeTab, activeLectureId, selectedLanguage]);

  // Force select first tab when data changes and no tab is selected
  useEffect(() => {
    if (data && !activeTab) {
      // Priority 1: Try to select from ActiveCategory
      if (data.ActiveCategory?.length > 0) {
        setActiveTab(data.ActiveCategory[0]?.categoryId);
      }
      // Priority 2: Try to select from categories
      else if (data.categories?.length > 0) {
        setActiveTab(data.categories[0]?._id);
      }
    }
  }, [data, activeTab, selectedLanguage]);

  // Reset state when language changes
  useEffect(() => {
    setActiveTab("");
    setActiveLectureId(null);
    setLecture({});
    setCurrentCourse([]); // Also reset course data when language changes
  }, [selectedLanguage]);

  // Refetch data when component mounts or when returning to page
  useEffect(() => {
    // Refetch data when component mounts
    refetch();

    // Listen for visibility change to refetch when user returns to page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log("Page became visible, refetching data...");
        refetch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Cleanup listener on unmount
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refetch]);

  // Ensure active tab is set when returning to page
  useEffect(() => {
    if (data && !activeTab) {
      console.log("Setting active tab on return to page");
      // Priority 1: Try to select from ActiveCategory
      if (data.ActiveCategory?.length > 0) {
        setActiveTab(data.ActiveCategory[0]?.categoryId);
        console.log(
          "Set active tab from ActiveCategory:",
          data.ActiveCategory[0]?.categoryId
        );
      }
      // Priority 2: Try to select from categories
      else if (data.categories?.length > 0) {
        setActiveTab(data.categories[0]?._id);
        console.log("Set active tab from categories:", data.categories[0]?._id);
      }
    }
  }, [data, activeTab]);

  const handleBannerClick = (clickedLectureId) => {
    const lectureData = currentCourse.flatMap((c) => c.lectures || []);
    const displayLecture = lectureData.find(
      (lecture) => lecture._id === clickedLectureId
    );
    if (displayLecture) {
      setLecture(displayLecture);
      setActiveLectureId(clickedLectureId);
    }
  };

  const getEmbedUrl = (url) => {
    console.log("url--------->", url);
    if (!url) return "";

    if (url.includes("youtube.com/watch?v=")) {
      const videoId = url.split("v=")[1].split("&")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    if (url.includes("youtu.be/")) {
      const videoId = url.split("youtu.be/")[1].split("?")[0];
      return `https://www.youtube.com/embed/${videoId}`;
    }

    // if (url.includes("vimeo.com/")) {
    //   const videoId = url.split("vimeo.com/")[1].split("?")[0];
    //   return `https://player.vimeo.com/video/${videoId}`;
    // }


     if (url.includes("vimeo.com/")) {
      const parts = url.split("vimeo.com/")[1].split("/");
      const videoId = parts[0].split("?")[0];
      const hash = parts[1] ? parts[1].split("?")[0] : null;
      return hash
        ? `https://player.vimeo.com/video/${videoId}?h=${hash}`
        : `https://player.vimeo.com/video/${videoId}`;
    }

    if (url.includes("dailymotion.com/video/")) {
      const videoId = url.split("dailymotion.com/video/")[1].split("?")[0];
      return `https://www.dailymotion.com/embed/video/${videoId}`;
    }

    // Loom
    if (url.includes("loom.com/share/")) {
      const videoId = url.split("loom.com/share/")[1].split("?")[0];
      return `https://www.loom.com/embed/${videoId}`;
    }
    // Dyntube
    if (url.includes("dyntube.com/v/")) {
      const videoId = url.split("dyntube.com/v/")[1].split("?")[0];
      return `https://dyntube.com/embed/${videoId}`;
    }

    return url;
  };

  const tabs = [
    {
      id: "Backoffice",
      name: "Backoffice",
      content: "Select the lactures", // Dynamic content rendered based on `lecture`
    },
    {
      id: "Crypto",
      name: "Crypto",
      content:
        "Explore the world of cryptocurrencies, blockchain technology, and digital asset trading.",
    },
    {
      id: "Stock-options",
      name: "Stock Options",
      content:
        "Understand stock options, strategies, and how to trade them effectively.",
    },
  ];

  // Added the image

  return (
    <>
      <div>
        {isCategoryLoading ? (
          <Loader />
        ) : data?.success === false &&
          data?.message === "No Category found on this Language" ? (
          <div className="container-fluid pb-10">
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-center">
                <div className="text-6xl mb-4">📚</div>
                <h3 className="text-xl font-medium text-gray-700 mb-2">
                  No Data Found
                </h3>
                <p className="text-gray-500">
                  {data?.message ||
                    "There is no data found for this category and language."}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Category: {activeTab || "Not selected"} | Language:{" "}
                  {selectedLanguage || "Not selected"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="container-fluid pb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Header Banner */}
              <div className="col-span-full">
                {data?.ActiveCategory && data.ActiveCategory.length > 0 ? (
                  <div
                    style={{
                      backgroundImage: `url(/media/banners/Backoffice.jpg)`,
                    }}
                    className="text-white py-12 rounded-2xl flex justify-center items-center bg-cover bg-center bg-no-repeat h-72 w-full"
                  >
                    <div className="text-center">
                      <h1 className="text-4xl font-bold tracking-wider pb-2">
                        {data?.ActiveCategory[0]?.categoryName}
                      </h1>

                      <p className="text-lg sm:text-xl tracking-widest">
                        TRAINING
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 dark:bg-gray-100 py-12 rounded-2xl flex justify-center items-center h-72 w-full">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold tracking-wider pb-2 text-gray-600 dark:text-gray-300">
                        {selectedLanguage}
                      </h1>
                      <p className="text-lg sm:text-xl tracking-widest text-gray-500 dark:text-gray-400">
                        does not have any categories available
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar - Course + Lectures */}
              {data?.ActiveCategory &&
              data.ActiveCategory.length > 0 &&
              activeTab === `${data.ActiveCategory[0]?.categoryId}` ? (
                <>
                  {currentCourse?.length > 0 ? (
                    <div className="max-h-[675px] left_sidebar overflow-y-auto rounded-xl shadow card divide-y divide-gray-200">
                      <Accordion
                        allowMultiple={false}
                        defaultIndex={0} // 🟢 First accordion open by default
                      >
                        {currentCourse.map((c, index) => (
                          <AccordionItem
                            key={c._id}
                            title={`${index + 1}. ${c.title}`}
                          >
                            {c?.lectures?.map((t) => (
                              <div
                                key={t._id}
                                onClick={() => handleBannerClick(t._id)} // 🟢 Simplified click handler
                                className={`flex items-center p-4 border-t border-gray-100 cursor-pointer transition 
                                   ${
                                     activeLectureId === t._id
                                       ? "bg-gray-300 dark:bg-slate-800"
                                       : "hover:bg-gray-50 dark:hover:bg-slate-900"
                                   }`}
                              >
                                <CirclePlay className="mr-2 text-gray-400" />
                                <span className="text-gray-800 font-medium text-xs">
                                  {t.title}
                                </span>
                              </div>
                            ))}
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  ) : (
                    <div className="max-h-[675px] left_sidebar rounded-xl shadow card bg-gray-50 dark:bg-gray-100">
                      <div className="flex flex-col items-center justify-center py-12 px-6">
                        <div className="text-center">
                          <div className="text-4xl mb-4">📚</div>
                          <h3 className="text-lg font-medium text-gray-700 dark:text-gray-600 mb-2">
                            No Courses Available
                          </h3>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Course not available in this category
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="max-h-[675px] left_sidebar rounded-xl shadow card bg-gray-50 dark:bg-gray-100">
                  <div className="flex flex-col items-center justify-center py-12 px-6">
                    <div className="text-center">
                      <div className="text-4xl mb-4">📚</div>
                      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-600 mb-2">
                        No Courses Available
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        Course not available in this category
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab + Lecture Display */}
              <div className="md:col-span-2">
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="flex gap-3 sm:gap-6 flex-wrap">
                      {data?.categories?.map((tab) => (
                        <button
                          key={tab._id}
                          className={`pb-4 border-b-2 ${
                            activeTab === tab._id
                              ? "border-black dark:border-white text-gray-900"
                              : "border-transparent text-gray-500 hover:text-gray-900"
                          }`}
                          onClick={() => setActiveTab(tab._id)}
                        >
                          {tab.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tab Content Area */}
                  <div className="rounded-lg mt-6">
                    {data?.categories?.map((tab) => (
                      <div
                        key={tab._id}
                        className={`${activeTab === tab._id ? "block" : "hidden"}`}
                      >
                        {/* Dynamic content for active tab */}
                        {data?.ActiveCategory &&
                        data.ActiveCategory.length > 0 &&
                        activeTab ===
                          `${data.ActiveCategory[0]?.categoryId}` ? (
                          currentCourse?.length > 0 && lecture ? (
                            <div className="card">
                              {lecture.type === "VIDEO" && (
                                <div className="aspect-video w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                                  <iframe
                                    src={getEmbedUrl(
                                      lecture.content
                                        ? lecture.content
                                        : lecture.videoUrl
                                    )}
                                    className="w-full h-full rounded-md"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                  />
                                </div>
                              )}

                              <div className="px-6 py-8 rounded-bl-md rounded-br-md">
                                {/* <h3 className="text-sm tracking-widest font-normal text-gray-600 mb-2">
                                  {lecture.title}
                                </h3> */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center flex-wrap justify-between mb-3 gap-2">
                                  <h4 className="sm:text-2xl font-medium text-gray-900">
                                    {lecture.title}
                                  </h4>
                                  <button className="bg-gray-100 text-sm flex items-center justify-center gap-2 rotate-0 opacity-100 rounded-2xl border border-gray-300 py-3 px-6 whitespace-nowrap">
                                    Mark as Complete
                                  </button>
                                </div>
                                {lecture.type == "TEXT" && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {lecture.content?.replace(/<\/?p>/g, "")}
                                  </p>
                                )}
                                <p className="text-sm text-gray-600 mt-1">
                                  {lecture.description?.replace(/<\/?p>/g, "")}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="card">
                              <div className="flex flex-col items-center justify-center py-20 px-6">
                                <div className="text-center">
                                  <div className="text-6xl mb-4">📚</div>
                                  <h3 className="text-xl font-medium text-gray-700 mb-2">
                                    No Course Available
                                  </h3>
                                  <p className="text-gray-500">
                                    Course not available in this category
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        ) : (
                          <div className="card">
                            <div className="flex flex-col items-center justify-center py-20 px-6">
                              <div className="text-center">
                                <div className="text-6xl mb-4">📚</div>
                                <h3 className="text-xl font-medium text-gray-700 mb-2">
                                  No Course Available
                                </h3>
                                <p className="text-gray-500">
                                  Course not available in this category
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* IQ Vault Section */}
              {data?.ActiveCategory &&
                data.ActiveCategory.length > 0 &&
                data?.upcomingCourse?.length > 0 && (
                  <div className="col-span-full">
                    <div className="text-gray-900">
                      <div className="bg-[#1f103f] text-white p-6 rounded-t-2xl">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <h2 className="text-xl font-medium">
                            Fast Start Training
                          </h2>
                          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <select className="bg-[#2a165d] text-white p-2 rounded-md w-full sm:w-auto">
                              <option>Experience</option>
                              <option>Beginner</option>
                              <option>Advanced</option>
                            </select>
                            <select className="bg-[#2a165d] text-white p-2 rounded-md w-full sm:w-auto">
                              <option>Style</option>
                              <option>Technical</option>
                              <option>Fundamental</option>
                            </select>
                          </div>
                        </div>
                      </div>
                      <div className="card rounded-t-none">
                        <div className="rounded-t-none rounded-b-2xl pb-2 m-6 overflow-x-auto">
                          <div className="flex gap-4 pb-0">
                            {/* Static Course Cards - Optional, not connected to lecture data */}
                            {data?.upcomingCourse?.map((i) => (
                              <div
                                key={i}
                                className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/4 border rounded-xl shadow-sm flex-shrink-0 cursor-pointer ${i?._id === id ? `border-primary border-2` : ``} `}
                              >
                                <div
                                  className="rounded-t-xl overflow-hidden"
                                  onClick={() => handleClick(i?._id)}
                                >
                                  <img
                                    src={
                                      i.imageUrl
                                        ? i.imageUrl
                                        : "public/media/images/video-thumbail.jpg"
                                    }
                                    alt="Course Title"
                                    className="w-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src =
                                        "https://placehold.co/400x225/E0BBE4/957DAD?text=Image+Error";
                                    }}
                                  />
                                </div>
                                <div className="p-5">
                                  <div className="flex items-center justify-between">
                                    <h3 className="text-md text-gray-800 font-medium mb-2">
                                      {i?.title}
                                    </h3>
                                  </div>
                                  <p className="text-xs text-gray-600">
                                    {i.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

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
import { useLocation, useNavigate } from "react-router-dom";
import { useTourStep } from "@/hooks/useTourStep";
import ResourcesSection from "../../../components/ui/ResourcesSection";
import StrategyVideoCarousel from "../../../components/ui/StrategyVideoCarousel";
import { getEmbedUrl } from "@/utils/videoUtils";

/**
 * Placeholder video data for the Fast Start Training carousel.
 * Replace with an API call when a backend endpoint is available.
 */
const FAST_START_VIDEOS = [
  {
    id: "fst-v1",
    title: "01_Getting Started_V2",
    videoUrl: "https://videos.dyntube.com/iframes/ek3BUWMF0WtQg9iTMtA0Q",
    duration: "",
  },
  {
    id: "fst-v2",
    title: "02_Access your Account_V2",
    videoUrl: "https://videos.dyntube.com/iframes/FrZ6pur22ky1g33c5sa2Iw",
    duration: "",
  },
  {
    id: "fst-v3",
    title: "03_Access your Education",
    videoUrl: "https://videos.dyntube.com/iframes/IfperYQPFEiPElvCcWYPaQ",
    duration: "",
  },
  {
    id: "fst-v4",
    title: "04_Access your Trading Tools",
    videoUrl: "https://videos.dyntube.com/iframes/sMCa6rpVjEe0Ix4Ge8BjA",
    duration: "",
  },
  {
    id: "fst-v5",
    title: "05_Start using your Apps_V2",
    videoUrl: "https://videos.dyntube.com/iframes/nPaKOr16k26Sn83rjY5w",
    duration: "",
  },
];

export default function FastStartTraining() {
  const [activeLectureId, setActiveLectureId] = useState(null);
  const [openAccordionIndex, setOpenAccordionIndex] = useState([0]);
  const [activeTab, setActiveTab] = useState("");
  const [lecture, setLecture] = useState();
  const [id, setId] = useState();
  const [category, setCategory] = useState();

  const location = useLocation();
  const navigate = useNavigate();

  const handleClick = (id) => {
    setId(id);
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
      language: selectedLanguage,
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
    if (
      data?.course &&
      data.course.length > 0 &&
      activeTab === `${data?.ActiveCategory?.[0]?.categoryId}`
    ) {
      setCurrentCourse(data.course);
    } else {
      setCurrentCourse([]);
    }
  }, [data, activeTab]);

  useEffect(() => {
    if (data?.ActiveCategory?.length > 0 && !activeTab) {
      setActiveTab(data.ActiveCategory[0]?.categoryId);
    }

    if (data?.categories?.length > 0 && !activeTab) {
      setActiveTab(data.categories[0]?._id);
    }

    if (data?.course?.length > 0) {
      const firstCourse = data.course?.[0];
      if (firstCourse?.lectures?.length > 0) {
        const firstLectureId = firstCourse?.lectures?.[0]?._id;
        if (!activeLectureId) {
          setActiveLectureId(firstLectureId);
          setLecture(firstCourse?.lectures?.[0] || {});
        }
      } else {
        setLecture({});
      }
    }
  }, [data, activeTab, activeLectureId, selectedLanguage]);

  useEffect(() => {
    if (data && !activeTab) {
      if (data.ActiveCategory?.length > 0) {
        setActiveTab(data.ActiveCategory[0]?.categoryId);
      }
      else if (data.categories?.length > 0) {
        setActiveTab(data.categories[0]?._id);
      }
    }
  }, [data, activeTab, selectedLanguage]);

  useEffect(() => {
    setActiveTab("");
    setActiveLectureId(null);
    setLecture({});
    setCurrentCourse([]);
  }, [selectedLanguage]);

  useEffect(() => {
    refetch();

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refetch();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [refetch]);

  useEffect(() => {
    if (data && !activeTab) {
      if (data.ActiveCategory?.length > 0) {
        setActiveTab(data.ActiveCategory[0]?.categoryId);
      }
      else if (data.categories?.length > 0) {
        setActiveTab(data.categories[0]?._id);
      }
    }
  }, [data, activeTab]);

  useTourStep({
    shouldStart: location?.state?.continueTour === true,
    isReady: !isCategoryLoading && !!currentCourse?.length && !!lecture,
    getSteps: () => {
      const steps = [];
      const tabArea = document.querySelector('.fst-tab-area');
      if (tabArea) steps.push({ element: tabArea, title: '📺 Course Tabs', intro: 'These tabs organize your course content. Click a tab to switch between video lectures for different topics in your training.', position: 'bottom' });
      const sectionEl = document.querySelector('.accordion-item');
      if (sectionEl) steps.push({ element: sectionEl, title: '📂 Course Sections', intro: 'Lectures are grouped into sections by topic. Click a section heading to expand it and see the lectures inside.', position: 'right' });
      const lectureEl = document.querySelector('.fst-lecture-item');
      if (lectureEl) steps.push({ element: lectureEl, title: '🎬 Watch a Lecture', intro: 'Click any lecture title to load and play the video in the main area. Your progress is tracked automatically.', position: 'right' });
      return steps;
    },
    onDone: () => navigate('/iq-vault', { state: { continueTour: true } }),
    delay: 800,
  });

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
              {/* Video Carousel */}
              <div className="col-span-full">
                <StrategyVideoCarousel videos={FAST_START_VIDEOS} />
              </div>

              {/* Sidebar - Course + Lectures */}
              <div className="order-2 md:order-1 mb-6">
                {data?.ActiveCategory &&
                  data.ActiveCategory.length > 0 &&
                  activeTab === `${data.ActiveCategory[0]?.categoryId}` ? (
                  <>
                    {currentCourse?.length > 0 ? (
                      <div className="max-h-[675px] left_sidebar overflow-y-auto rounded-xl shadow card divide-y divide-gray-200">
                        <Accordion
                          allowMultiple={false}
                          defaultIndex={0}
                        >
                          {currentCourse.map((c, index) => (
                            <AccordionItem
                              key={c._id}
                              title={`${index + 1}. ${c.title}`}
                            >
                              {c?.lectures?.map((t, lIdx) => (
                                <div
                                  key={t._id}
                                  onClick={() => handleBannerClick(t._id)}
                                  className={`flex items-center p-4 border-t border-gray-100 cursor-pointer transition ${lIdx === 0 && index === 0 ? 'fst-lecture-item' : ''}
                                   ${activeLectureId === t._id
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
              </div>

              {/* Tab + Lecture Display */}
              <div className="md:col-span-2 order-1 md:order-2">
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div className="flex gap-3 sm:gap-6 flex-wrap fst-tab-area">
                      {data?.categories?.map((tab) => (
                        <button
                          key={tab._id}
                          className={`pb-4 border-b-2 ${activeTab === tab._id
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
                                {/* Resources — view only */}
                                <ResourcesSection
                                  resources={lecture?.resources || []}
                                  viewOnly
                                  className="mt-4"
                                />
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
            </div>
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
        )}
      </div>
    </>
  );
}

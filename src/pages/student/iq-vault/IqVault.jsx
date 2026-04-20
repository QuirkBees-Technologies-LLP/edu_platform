import { CirclePlay } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useGetAcademyCategoryByMainSectionQuery } from "../../../store/api/client/clientAcademyCategoryApiSlice";
import Loader from "../../../components/ui/loader";
import { useSelector } from "react-redux";
import { selectSelectedLanguage } from "../../../store/reducer/studentLanagugeSlice";
import { Accordion, AccordionItem } from "@/components/accordion";
import { useLocation, useNavigate } from "react-router";
import ShowMoreLess from "../../../components/ui/showmoreless";
import { useAuthContext } from "@/auth";
import { useTourStep } from "@/hooks/useTourStep";

export default function IqVault() {
  const [activeTab, setActiveTab] = useState("");
  const [lecture, setLecture] = useState({});
  const [id, setId] = useState();
  const [category, setCategory] = useState();
  const [activeLectureId, setActiveLectureId] = useState(null);

  const { auth } = useAuthContext();
  const navigate = useNavigate();

  const selectedLanguage = useSelector(selectSelectedLanguage);

  const handleClick = (id) => {
    setId(id); // or simply: id, based on your API setup
  };
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const mainSection = params.get("mainSection");
  const language = params.get("language");
  const categoryName = params.get("categoryId");
  const courseId = params.get("courseId");

  const {
    data,
    isLoading: isCategoryLoading,
    isError,
    refetch,
  } = useGetAcademyCategoryByMainSectionQuery(
    {
      mainSection: mainSection ? mainSection : "IQ Academy",
      id: courseId ? courseId : id,
      category: categoryName ? categoryName : activeTab,
      language: language ? language : selectedLanguage,
    },
    {
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );

  useEffect(() => {
    const activeCategoryId = data?.ActiveCategory?.[0]?.categoryId;
    const hasValidCourseData =
      Array.isArray(data?.course) && data.course.length > 0;
    const tabMatches = activeTab === `${activeCategoryId}`;

    if (hasValidCourseData && tabMatches) {
      setCurrentCourse(data.course);

      // 🟢 Also auto select first lecture whenever data changes
      const firstCourse = data.course[0];
      if (firstCourse?.lectures?.length > 0) {
        const firstLecture = firstCourse.lectures[0];
        setActiveLectureId(firstLecture._id);
        setLecture(firstLecture);
      }
    } else {
      setCurrentCourse([]);
    }
  }, [data, activeTab]);

  const categories = data?.category || [];
  const course = data?.course || [];

  // Reset course data when activeTab changes to prevent showing old data
  const [currentCourse, setCurrentCourse] = useState([]);

  useEffect(() => {
    // Only set course data if we have course data AND the active tab matches
    if (
      data?.course &&
      data.course.length > 0 &&
      activeTab === `${data?.ActiveCategory?.[0]?.categoryId}`
    ) {
      setCurrentCourse(data.course);
    } else {
      // Reset course data if no course data or tab doesn't match
      setCurrentCourse([]);
    }
  }, [data, activeTab]);

  useEffect(() => {
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
  // useEffect(() => {
  //   setActiveTab("");
  //   setActiveLectureId(null);
  //   setLecture({});
  //   setCurrentCourse([]); // Also reset course data when language changes
  // }, [selectedLanguage]);

  // Refetch data when component mounts or when returning to page
  useEffect(() => {
    // Refetch data when component mounts
    refetch();

    // Listen for visibility change to refetch when user returns to page
    const handleVisibilityChange = () => {
      if (!document.hidden) {
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
      // Priority 1: Try to select from ActiveCategory
      if (data.ActiveCategory?.length > 0) {
        setActiveTab(data.ActiveCategory[0]?.categoryId);
      }
      // Priority 2: Try to select from categories
      else if (data.categories?.length > 0) {
        setActiveTab(data.categories[0]?._id);
      }
    }
  }, [data, activeTab]);

  // Reset everything when categoryName (URL param) changes
  useEffect(() => {
    if (categoryName) {
      // Force UI to pick the category from URL
      setActiveTab(categoryName);
      setCurrentCourse([]); // reset previous course
      setLecture({}); // reset previous lecture
      setActiveLectureId(null); // reset active lecture
    }
  }, [categoryName]);
  // ─── IQ Vault Tour (continued from FastStartTraining) ──────────────────────

  useTourStep({
    shouldStart: location?.state?.continueTour === true,
    isReady: !isCategoryLoading &&
      Array.isArray(data?.categories) && data.categories.length > 0 &&
      Array.isArray(data?.upcomingCourse),
    getSteps: () => {
      const steps = [];
      const tabArea = document.querySelector('.iq-vault-tab-area');
      if (tabArea) steps.push({ element: tabArea, title: '📑 Course Categories', intro: 'Switch between subject areas using these tabs. Each tab shows courses for a different topic like Trading or Digital Marketing.', position: 'bottom' });
      const sectionEl = document.querySelector('.accordion-item');
      if (sectionEl) steps.push({ element: sectionEl, title: '📂 Course Sections', intro: 'Lectures are grouped into sections. Click a section to expand it and see the individual lectures inside.', position: 'right' });
      const lectureEl = document.querySelector('.iq-vault-lecture-item');
      if (lectureEl) steps.push({ element: lectureEl, title: '🎬 Watch a Lecture', intro: 'Click any lecture to play it in the video player. Your progress is saved automatically.', position: 'right' });
      const vaultSection = document.querySelector('.iq-vault-suggestions-section');
      if (vaultSection) steps.push({ element: vaultSection, title: '📚 IQ Vault Extra Courses', intro: 'Browse additional recommended courses below the video player. Use the <strong>Experience</strong> and <strong>Style</strong> filters to find courses that match your level and learning approach.', position: 'top' });
      return steps;
    },
    onDone: () => navigate('/master-class', { state: { continueTour: true } }),
    delay: 800,
  });
  // ─────────────────────────────────────────────────────────────────────────

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
    //  if (url.includes("dyntube.com/video/")) {
    //     let videoId = url.split("dyntube.com/video/")[1].split("?")[0];
    //     videoId = videoId.replace(/\/$/, "");
    //     return `https://player.dyntube.com/video/${videoId}`;
    //   }
    if (url.includes("app.dyntube.com/#/video/")) {
      const match = url.match(/video\/([^/]+)/);
      if (match?.[1]) return `https://player.dyntube.com/video/${match[1]}`;
    }

    // CASE 2: https://videos.dyntube.com/iframes/<id>
    if (url.includes("videos.dyntube.com/iframes/")) {
      const match = url.match(/iframes\/([^/?#]+)/);
      if (match?.[1]) return `https://videos.dyntube.com/iframes/${match[1]}`;
    }

    // CASE 3: https://player.dyntube.com/video/<id>
    if (url.includes("player.dyntube.com/video/")) {
      const match = url.match(/video\/([^/?#]+)/);
      if (match?.[1]) return `https://player.dyntube.com/video/${match[1]}`;
    }

    // CASE 4: fallback generic
    if (url.includes("dyntube.com/")) return url;

    return url;
  };

  const tabs = [
    {
      id: "Forex",
      name: "Forex",
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

  const sanitizeHtmlContent = (html) => {
    if (!html) return "";

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const links = [...doc.querySelectorAll("a")];
      links.forEach((a) => {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
        a.classList.add("text-blue-600", "underline", "hover:text-blue-800");
      });

      const htmlWithLinks = doc.body.innerHTML.replace(
        /<(?!a\s|\/a)[^>]+>/g,
        ""
      );
      return htmlWithLinks.trim();
    } catch (err) {
      return html.replace(/<(?!a\s|\/a)[^>]+>/g, "").trim();
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Header Banner */}
              <div className="col-span-full">
                {data?.ActiveCategory && data.ActiveCategory.length > 0 ? (
                  <div
                    style={{
                      backgroundImage: `url(/media/banners/${data?.ActiveCategory[0]?.categoryName.replace(/\s+/g, "-")}.jpg)`,
                    }}
                    className="text-white py-12 rounded-2xl flex justify-center items-center bg-cover bg-center bg-no-repeat h-72 w-full"
                  >
                    <div className="text-center">
                      <h1 className="text-4xl font-bold tracking-wider pb-2">
                        {data?.ActiveCategory[0]?.categoryName}
                      </h1>

                      <p className="text-lg sm:text-xl tracking-widest">
                        Academy in {language ? language : selectedLanguage}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100in  dark:bg-gray-100 py-12 rounded-2xl flex justify-center items-center h-72 w-full">
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
              <div className="order-2 md:order-1 mb-6">
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
                              {c?.lectures?.map((t, lIdx) => (
                                <div
                                  key={t._id}
                                  onClick={() => handleBannerClick(t._id)} // 🟢 Simplified click handler
                                  className={`flex items-center p-4 border-t border-gray-100 cursor-pointer transition ${lIdx === 0 && currentCourse.indexOf(c) === 0 ? 'iq-vault-lecture-item' : ''}
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
                              Coming Soon
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                              Coming Soon
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
                          Coming Soon
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                          Coming Soon
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
                    <div className="flex gap-3 sm:gap-6 flex-wrap iq-vault-tab-area">
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
                                {lecture.type === "TEXT" && (
                                  <div
                                    className="text-sm text-gray-600 mt-1"
                                    dangerouslySetInnerHTML={{
                                      __html: sanitizeHtmlContent(
                                        lecture.content
                                      ),
                                    }}
                                  />
                                )}

                                {lecture.description && (
                                  <div
                                    className="text-sm text-gray-600 mt-1"
                                    dangerouslySetInnerHTML={{
                                      __html: sanitizeHtmlContent(
                                        lecture.description
                                      ),
                                    }}
                                  />
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="card">
                              <div className="flex flex-col items-center justify-center py-20 px-6">
                                <div className="text-center">
                                  <div className="text-6xl mb-4">📚</div>
                                  <h3 className="text-xl font-medium text-gray-700 mb-2">
                                    Coming Soon
                                  </h3>
                                  <p className="text-gray-500">Coming Soon</p>
                                </div>
                              </div>
                            </div>
                            // <div className="card">
                            //   <div className="flex flex-col items-center justify-center py-20 px-6">
                            //     <div className="justify-center">
                            //       <Loader />
                            //     </div>
                            //   </div>
                            // </div>
                          )
                        ) : (
                          // <div className="card">
                          //   <div className="flex flex-col items-center justify-center py-20 px-6">
                          //     <div className="text-center">
                          //       <div className="text-6xl mb-4">📚</div>
                          //       <h3 className="text-xl font-medium text-gray-700 mb-2">
                          //         Coming Soon
                          //       </h3>
                          //       <p className="text-gray-500">Coming Soon</p>
                          //     </div>
                          //   </div>
                          // </div>
                          <div className="card">
                            <div className="flex flex-col items-center justify-center py-20 px-6">
                              <div className="justify-center">
                                <Loader />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {/* IQ Vault Section */}
              {data?.ActiveCategory &&
                data.ActiveCategory.length > 0 &&
                data?.upcomingCourse?.length > 0 && (
                  <div className="col-span-full iq-vault-suggestions-section">
                    <div className="text-gray-900">
                      <div className="bg-[#1f103f] text-white p-6 rounded-t-2xl">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                          <h2 className="text-xl font-medium">IQ Vault</h2>
                          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                            <select className="bg-[#2a165d] text-white p-2 px-7 rounded-md w-full sm:w-auto">
                              <option>Experience</option>
                              <option>Beginner</option>
                              <option>Advanced</option>
                            </select>
                            <select className="bg-[#2a165d] text-white p-2 px-7 rounded-md w-full sm:w-auto">
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
                            {data?.upcomingCourse?.map((i, idx) => (
                              <div
                                key={i?._id || i?.title}
                                className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/4 border rounded-xl shadow-sm flex-shrink-0 cursor-pointer ${i?._id === id ? `border-primary border-2` : ``} ${idx === 0 ? 'iq-vault-first-course' : ''}`}
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
                                    className="w-full object-cover h-44 rounded-t-xl "
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
                                  <ShowMoreLess
                                    className="text-gray-900 text-sm mt-2 leading-relaxed"
                                    html={i?.description || "No description"}
                                    limit={60}
                                  />
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

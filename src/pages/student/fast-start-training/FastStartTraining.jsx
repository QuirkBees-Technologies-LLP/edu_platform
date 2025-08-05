import { CirclePlay } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useGetAcademyCategoryByMainSectionQuery } from "../../../store/api/client/clientAcademyCategoryApiSlice";
import Loader from "../../../components/ui/loader";
import { useSelector } from "react-redux";
import { selectSelectedLanguage } from "../../../store/reducer/studentLanagugeSlice";

export default function FastStartTraining() {
  const [activeTab, setActiveTab] = useState("");
  const [lecture, setLecture] = useState();
  const [id, setId] = useState();
  const [category, setCategory] = useState();

  const handleClick = (id) => {
    setId(id); // or simply: id, based on your API setup
  };
  const selectedLanguage = useSelector(selectSelectedLanguage);

  console.log("selectedLanguage======>", selectedLanguage);
  const {
    data,
    isLoading: isCategoryLoading,
    isError,
    refetch,
  } = useGetAcademyCategoryByMainSectionQuery({
    mainSection: "fastStartTraining",
    id,
    category: activeTab,
    language: category,
  });

  useEffect(() => {
    if (selectedLanguage) {
      setCategory(selectedLanguage)
    }
  }, [selectedLanguage]);

  const categories = data?.category || [];
  const course = data?.course || [];

  const handleBannerClick = (id) => {
    const lectureData = course.flatMap((c) => c.lectures || []);
    const displayLecture = lectureData.find((lecture) => lecture._id === id);
    setLecture(displayLecture);
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

    if (url.includes("vimeo.com/")) {
      const videoId = url.split("vimeo.com/")[1].split("?")[0];
      return `https://player.vimeo.com/video/${videoId}`;
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

  // if (isError) {
  //   return (
  //     <>
  //       <div className="container-fluid">
  //         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
  //           <div className="col-span-full">
  //             <div className="bg-[url(../media/images/forex.jpg)] text-white py-12 rounded-2xl flex justify-center items-center bg-cover bg-center bg-no-repeat h-72 w-full">
  //               <div className="text-center">
  //                 <h1 className="text-4xl font-bold tracking-wider pb-2">
  //                   No Such category found{" "}
  //                 </h1>
  //                 <p className="text-lg sm:text-xl tracking-widest">ACADEMY</p>
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </>
  //   );
  // }

  // console.log(isError)
  return (
    <>
      <div>
        {isCategoryLoading ? (
          <Loader />
        ) : (
          <div className="container-fluid pb-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Header Banner */}
              <div className="col-span-full">
                <div className="bg-[url(../media/images/forex.jpg)] text-white py-12 rounded-2xl flex justify-center items-center bg-cover bg-center bg-no-repeat h-72 w-full">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-wider pb-2">
                      {data?.ActiveCategory[0]?.categoryName}
                    </h1>

                    <p className="text-lg sm:text-xl tracking-widest">
                      TRAINING
                    </p>
                  </div>
                </div>
              </div>

              {/* Sidebar - Course + Lectures */}

              {activeTab === `${data?.ActiveCategory[0]?.categoryId}` &&
                course?.length > 0 && (
                  <div className="max-h-[690px] overflow-y-auto rounded-xl shadow-md">
                    {course.map((c, index) => (
                      <div key={c._id}>
                        <div className="bg-blue-950 p-5 rounded-t-xl">
                          <h6 className="text-sm text-white font-medium">
                            {index + 1}. {c.title}
                          </h6>
                        </div>
                        {c?.lectures?.map((t) => (
                          <div
                            key={t._id}
                            onClick={() => handleBannerClick(t._id)}
                            className="flex items-center p-4 border-b border-gray-200 cursor-pointer dark:hover:bg-slate-900 hover:bg-gray-50 transition-colors duration-200 ease-in-out"
                          >
                            <CirclePlay className="mr-2 text-gray-400" />
                            <span className="text-gray-800 font-medium text-xs">
                              {t.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}

              {/* Tab + Lecture Display */}
              <div className="md:col-span-2">
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row items-center gap-8">
                    <h2 className="text-lg font-medium text-gray-900">
                      My Academies
                    </h2>
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
                        {/* Dynamic content for "Forex" tab */}
                        {activeTab ===
                          `${data?.ActiveCategory[0]?.categoryId}` &&
                        lecture ? (
                          <div className="card">
                            {lecture.type !== "TEXT" && (
                              // <iframe
                              //     className="w-full aspect-video rounded-t-md"
                              //     src={lecture.content || lecture.VideoUrl}
                              //     title={lecture.title}
                              //     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              //     allowFullScreen
                              // />
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
                              <h3 className="text-sm tracking-widest font-normal text-gray-600 mb-2">
                                {lecture.title}
                              </h3>
                              <div className="flex flex-col sm:flex-row items-start sm:items-center flex-wrap justify-between mb-3 gap-2">
                                <h4 className="sm:text-2xl font-medium text-gray-900">
                                  {lecture.type}
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
                        ) : typeof tab.content === "string" ? (
                          <p className="text-gray-800 text-base leading-relaxed">
                            {tab.content}
                          </p>
                        ) : (
                          tab.content
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* IQ Vault Section */}

              <div className="col-span-full">
                <div className="text-gray-900">
                  <div className="bg-[#1f103f] text-white p-6 rounded-t-2xl">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h2 className="text-xl font-medium">IQ Vault</h2>
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

                  <div className="rounded-b-2xl shadow-md p-6 overflow-x-auto">
                    <div className="flex gap-4 pb-0">
                      {/* Static Course Cards - Optional, not connected to lecture data */}
                      {data?.upcomingCourse?.map((i) => (
                        <div
                          key={i}
                          className={`w-full sm:w-1/2 md:w-1/3 lg:w-1/4 border rounded-xl shadow-sm flex-shrink-0 cursor-pointer ${i?._id === id ? `border-primary border-2` : ``} `}
                          onClick={() => handleClick(i?._id)}
                        >
                          <div className="rounded-t-xl overflow-hidden">
                            <img
                              src={
                                i.imageUrl
                                  ? i.imageUrl
                                  : "public/media/images/video-thumbail.jpg"
                              }
                              alt="Course Title"
                              className="w-full h-36 object-cover"
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

                              {/* <span className="badge badge-sm badge-success badge-outline">
                                Active
                              </span> */}
                            </div>
                            <p className="text-xs text-gray-600 ">
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
          </div>
        )}
      </div>
    </>
  );
}

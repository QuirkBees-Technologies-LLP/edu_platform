// import React, { useState, useEffect } from "react";
// import { useSelector } from "react-redux";
// import { selectSelectedLanguage } from "../../../store/reducer/studentLanagugeSlice";
// import {
//   useGetLearningStrategiesQuery,
//   useGetStrategyContentQuery,
//   useGetStrategyLanguagesQuery,
// } from "../../../store/api/client/clientLearningContentApiSlice";
// import Loader from "../../../components/ui/loader";
// import ResourcesSection from "../../../components/ui/ResourcesSection";
// import StrategyVideoCarousel from "../../../components/ui/StrategyVideoCarousel";
// import { ChevronLeft } from "lucide-react";

// export default function IqStrategies() {
//   const selectedLanguage = useSelector(selectSelectedLanguage);

//   const [selectedStrategy, setSelectedStrategy] = useState(null);
//   const [selectedLang, setSelectedLang] = useState(selectedLanguage || "");

//   // 1. Fetch strategies that have learning content
//   const {
//     data: strategiesData,
//     isLoading: isStrategiesLoading,
//   } = useGetLearningStrategiesQuery();

//   const strategies = strategiesData?.data || [];

//   // 2. Fetch available languages for the selected strategy
//   const {
//     data: strategyLanguagesData,
//     isLoading: isLanguagesLoading,
//   } = useGetStrategyLanguagesQuery(selectedStrategy?._id, {
//     skip: !selectedStrategy,
//   });

//   const availableLanguages = strategyLanguagesData?.data || [];

//   // 3. Fetch strategy content for strategy + language combination
//   const {
//     data: strategyContentData,
//     isLoading: isContentLoading,
//   } = useGetStrategyContentQuery(
//     {
//       strategy: selectedStrategy?._id,
//       language: selectedLang,
//     },
//     {
//       skip: !selectedStrategy || !selectedLang,
//     }
//   );

//   const strategyContent = strategyContentData?.data;

//   // Auto-select the global language when a strategy is selected
//   useEffect(() => {
//     if (selectedStrategy && availableLanguages.length > 0) {
//       // Try to use the globally-selected language; fallback to first available
//       const langExists = availableLanguages.find(
//         (l) => l._id === selectedLanguage
//       );
//       setSelectedLang(langExists ? selectedLanguage : availableLanguages[0]._id);
//     }
//   }, [selectedStrategy, availableLanguages, selectedLanguage]);

//   // When global language changes, update local selection
//   useEffect(() => {
//     if (selectedLanguage) {
//       setSelectedLang(selectedLanguage);
//     }
//   }, [selectedLanguage]);

//   const handleStrategyClick = (strategy) => {
//     setSelectedStrategy(strategy);
//   };

//   const handleBack = () => {
//     setSelectedStrategy(null);
//   };

//   if (isStrategiesLoading) return <Loader />;

//   return (
//     <div className="container-fluid pb-10">
//       {/* Banner */}
//       <div className="relative welcome_image w-full mb-10 rounded-xl overflow-hidden">
//         <div className="relative z-1 flex items-center justify-center h-full p-4">
//           <div className="xl:hidden absolute inset-0 bg-black/40"></div>
//           <div className="text-center z-1">
//             <div className="flex items-center justify-center flex-col sm:flex-row space-x-2 animate-fadeInUp delay-200">
//               <span className="text-2xl text-gray-50 font-medium tracking-widest">
//                 IQ STRATEGIES
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {!selectedStrategy ? (
//         // ── STRATEGY SELECTION VIEW ─────────────────────────────────────
//         <>
//           {strategies.length === 0 ? (
//             <div className="flex flex-col items-center justify-center py-20">
//               <div className="text-4xl mb-3">📊</div>
//               <p className="text-gray-500">No strategies available</p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
//               {strategies.map((strategy) => (
//                 <div
//                   key={strategy._id}
//                   onClick={() => handleStrategyClick(strategy)}
//                   className="border border-gray-200 dark:border-gray-700 px-5 py-5 xl:px-7 xl:py-7 rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition cursor-pointer group"
//                 >
//                   <div className="flex items-center gap-4">
//                     {/* Strategy image or initials */}
//                     <div className="w-16 h-16 bg-[#13122F] flex items-center justify-center rounded-2xl overflow-hidden shrink-0">
//                       {strategy.imageUrl ? (
//                         <img
//                           src={strategy.imageUrl}
//                           alt={strategy.title}
//                           className="w-full h-full object-cover"
//                           onError={(e) => {
//                             e.target.onerror = null;
//                             e.target.style.display = "none";
//                             e.target.parentElement.innerHTML = `<span class="text-lg font-bold text-[#C5C6FF]">${strategy.title
//                               ?.substring(0, 2)
//                               .toUpperCase()}</span>`;
//                           }}
//                         />
//                       ) : (
//                         <span className="text-lg font-bold text-[#C5C6FF]">
//                           {strategy.title?.substring(0, 2).toUpperCase()}
//                         </span>
//                       )}
//                     </div>

//                     {/* Title */}
//                     <div className="min-w-0">
//                       <h5 className="text-sm font-medium text-gray-800 group-hover:text-primary transition truncate">
//                         {strategy.title}
//                       </h5>
//                       {strategy.description && (
//                         <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
//                           {strategy.description}
//                         </p>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </>
//       ) : (
//         // ── STRATEGY DETAIL VIEW ───────────────────────────────────────
//         <>
//           {/* Back + Strategy header + language selector */}
//           <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={handleBack}
//                 className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
//               >
//                 <ChevronLeft size={20} />
//               </button>
//               <div>
//                 <h2 className="text-xl font-semibold text-gray-900">
//                   {selectedStrategy.title}
//                 </h2>
//                 {selectedStrategy.description && (
//                   <p className="text-sm text-gray-500 mt-0.5">
//                     {selectedStrategy.description}
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* Language selector */}
//             {availableLanguages.length > 1 && (
//               <select
//                 value={selectedLang}
//                 onChange={(e) => setSelectedLang(e.target.value)}
//                 className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#1a1c23] text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
//               >
//                 {availableLanguages.map((lang) => (
//                   <option key={lang._id} value={lang._id}>
//                     {lang.name}
//                   </option>
//                 ))}
//               </select>
//             )}
//           </div>

//           {isContentLoading || isLanguagesLoading ? (
//             <Loader />
//           ) : !strategyContent ? (
//             <div className="flex flex-col items-center justify-center py-20">
//               <div className="text-4xl mb-3">📚</div>
//               <p className="text-gray-500">
//                 No content available for this strategy and language
//               </p>
//             </div>
//           ) : (
//             <>
//               {/* Video Carousel */}
//               <StrategyVideoCarousel
//                 videos={strategyContent.videos || []}
//                 title={strategyContent.title || ""}
//                 description={strategyContent.description || ""}
//               />

//               {/* Resources */}
//               {strategyContent.resources?.length > 0 && (
//                 <div className="mt-6">
//                   <ResourcesSection
//                     resources={strategyContent.resources}
//                     viewOnly
//                   />
//                 </div>
//               )}
//             </>
//           )}
//         </>
//       )}

//       {/* Bottom Banner */}
//       <div className="relative welcome_banner w-full mt-10 rounded-xl overflow-hidden">
//         <div className="relative z-1 flex items-center justify-center md:justify-end h-full p-4">
//           <div className="xl:hidden absolute inset-0 bg-black/40"></div>
//           <div className="text-center z-1">
//             <div className="flex items-center justify-center flex-col sm:flex-row space-x-2 animate-fadeInUp delay-200 md:pr-20">
//               <span className="text-xl text-gray-50 font-medium tracking-widest">
//                 RISE ABOVE ORDINARY
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { selectSelectedLanguage } from "../../../store/reducer/studentLanagugeSlice";
import {
  useGetLearningStrategiesQuery,
  useGetStrategyContentQuery,
  useGetStrategyLanguagesQuery,
} from "../../../store/api/client/clientLearningContentApiSlice";
import Loader from "../../../components/ui/loader";
import ResourcesSection from "../../../components/ui/ResourcesSection";
import StrategyVideoCarousel from "../../../components/ui/StrategyVideoCarousel";
import { ChevronLeft } from "lucide-react";
import { useTourStep } from "@/hooks/useTourStep"; // Tour hook import કર્યું

export default function IqStrategies() {
  const selectedLanguage = useSelector(selectSelectedLanguage);
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [selectedLang, setSelectedLang] = useState(selectedLanguage || "");

  // 1. Fetch strategies that have learning content
  const {
    data: strategiesData,
    isLoading: isStrategiesLoading,
  } = useGetLearningStrategiesQuery();

  const strategies = strategiesData?.data || [];

  // 2. Fetch available languages for the selected strategy
  const {
    data: strategyLanguagesData,
    isLoading: isLanguagesLoading,
  } = useGetStrategyLanguagesQuery(selectedStrategy?._id, {
    skip: !selectedStrategy,
  });

  const availableLanguages = strategyLanguagesData?.data || [];

  // 3. Fetch strategy content for strategy + language combination
  const {
    data: strategyContentData,
    isLoading: isContentLoading,
  } = useGetStrategyContentQuery(
    {
      strategy: selectedStrategy?._id,
      language: selectedLang,
    },
    {
      skip: !selectedStrategy || !selectedLang,
    }
  );

  const strategyContent = strategyContentData?.data;

  // Auto-select the global language when a strategy is selected
  useEffect(() => {
    if (selectedStrategy && availableLanguages.length > 0) {
      const langExists = availableLanguages.find(
        (l) => l._id === selectedLanguage
      );
      setSelectedLang(langExists ? selectedLanguage : availableLanguages[0]._id);
    }
  }, [selectedStrategy, availableLanguages, selectedLanguage]);

  // When global language changes, update local selection
  useEffect(() => {
    if (selectedLanguage) {
      setSelectedLang(selectedLanguage);
    }
  }, [selectedLanguage]);

  // ── TOUR STEP CONFIGURATION ───────────────────────────────────────
  useTourStep({
    shouldStart: location?.state?.continueTour === true,
    isReady: !isStrategiesLoading && strategies.length > 0, // ડેટા સંપૂર્ણ લોડ થયા પછી જ ટૂર શરૂ થશે
    getSteps: () => {
      const steps = [];

      const banner = document.querySelector(".iq-banner");
      if (banner) {
        steps.push({
          element: banner,
          title: "💡 IQ Strategies",
          intro: "Explore powerful learning strategies tailored for your trading path.",
          position: "bottom",
        });
      }

      const grid = document.querySelector(".iq-strategy-grid");
      if (grid) {
        steps.push({
          element: grid,
          title: "📚 Available Strategies",
          intro: "Select any strategy card to view videos and resource materials.",
          position: "top",
        });
      }

      const firstCard = document.querySelector(".iq-strategy-card");
      if (firstCard) {
        steps.push({
          element: firstCard,
          title: "🎯 Strategy Details",
          intro: "Click on a card to open step-by-step video tutorials.",
          position: "right",
        });
      }

      return steps;
    },
    onDone: () => {
      // ટૂર પૂર્ણ થાય ત્યારે આગલા રાઉટ પર નેવિગેટ કરવા માટે
      // navigate("/next-page-route", { state: { continueTour: true } });
    },
    delay: 1000,
  });

  const handleStrategyClick = (strategy) => {
    setSelectedStrategy(strategy);
  };

  const handleBack = () => {
    setSelectedStrategy(null);
  };

  if (isStrategiesLoading) return <Loader />;

  return (
    <div className="container-fluid pb-10">
      {/* Banner */}
      <div className="relative welcome_image w-full mb-10 rounded-xl overflow-hidden iq-banner">
        <div className="relative z-1 flex items-center justify-center h-full p-4">
          <div className="xl:hidden absolute inset-0 bg-black/40"></div>
          <div className="text-center z-1">
            <div className="flex items-center justify-center flex-col sm:flex-row space-x-2 animate-fadeInUp delay-200">
              <span className="text-2xl text-gray-50 font-medium tracking-widest">
                IQ STRATEGIES
              </span>
            </div>
          </div>
        </div>
      </div>

      {!selectedStrategy ? (
        // ── STRATEGY SELECTION VIEW ─────────────────────────────────────
        <>
          {strategies.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-4xl mb-3">📊</div>
              <p className="text-gray-500">No strategies available</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 iq-strategy-grid">
              {strategies.map((strategy, index) => (
                <div
                  key={strategy._id}
                  onClick={() => handleStrategyClick(strategy)}
                  className={`border border-gray-200 dark:border-gray-700 px-5 py-5 xl:px-7 xl:py-7 rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition cursor-pointer group ${index === 0 ? "iq-strategy-card" : ""
                    }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Strategy image or initials */}
                    <div className="w-16 h-16 bg-[#13122F] flex items-center justify-center rounded-2xl overflow-hidden shrink-0">
                      {strategy.imageUrl ? (
                        <img
                          src={strategy.imageUrl}
                          alt={strategy.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML = `<span class="text-lg font-bold text-[#C5C6FF]">${strategy.title
                              ?.substring(0, 2)
                              .toUpperCase()}</span>`;
                          }}
                        />
                      ) : (
                        <span className="text-lg font-bold text-[#C5C6FF]">
                          {strategy.title?.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <div className="min-w-0">
                      <h5 className="text-sm font-medium text-gray-800 group-hover:text-primary transition truncate">
                        {strategy.title}
                      </h5>
                      {strategy.description && (
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                          {strategy.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        // ── STRATEGY DETAIL VIEW ───────────────────────────────────────
        <>
          {/* Back + Strategy header + language selector */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={handleBack}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {selectedStrategy.title}
                </h2>
                {selectedStrategy.description && (
                  <p className="text-sm text-gray-500 mt-0.5">
                    {selectedStrategy.description}
                  </p>
                )}
              </div>
            </div>

            {/* Language selector */}
            {availableLanguages.length > 1 && (
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 dark:bg-[#1a1c23] text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              >
                {availableLanguages.map((lang) => (
                  <option key={lang._id} value={lang._id}>
                    {lang.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {isContentLoading || isLanguagesLoading ? (
            <Loader />
          ) : !strategyContent ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-4xl mb-3">📚</div>
              <p className="text-gray-500">
                No content available for this strategy and language
              </p>
            </div>
          ) : (
            <>
              {/* Video Carousel */}
              <StrategyVideoCarousel
                videos={strategyContent.videos || []}
                title={strategyContent.title || ""}
                description={strategyContent.description || ""}
              />

              {/* Resources */}
              {strategyContent.resources?.length > 0 && (
                <div className="mt-6">
                  <ResourcesSection
                    resources={strategyContent.resources}
                    viewOnly
                  />
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* Bottom Banner */}
      <div className="relative welcome_banner w-full mt-10 rounded-xl overflow-hidden">
        <div className="relative z-1 flex items-center justify-center md:justify-end h-full p-4">
          <div className="xl:hidden absolute inset-0 bg-black/40"></div>
          <div className="text-center z-1">
            <div className="flex items-center justify-center flex-col sm:flex-row space-x-2 animate-fadeInUp delay-200 md:pr-20">
              <span className="text-xl text-gray-50 font-medium tracking-widest">
                RISE ABOVE ORDINARY
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
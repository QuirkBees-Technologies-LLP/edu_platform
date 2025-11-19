import React, { useCallback, useEffect, useRef, useState } from "react";
import { toAbsoluteUrl } from "@/utils/Assets";
import { Link } from "react-router-dom";
import { useGetClientTradeIdeasQuery } from "../../../store/api/client/clientTradeIdeasApiSlice";
import { format } from "date-fns";
import ViewClientTradeIdeas from "./ViewClientTradeIdeas";
import ImageLightBox from "./ImageLightBox";
import EducatorImage from "./EducatorImage";
import { ChevronLeft, ChevronRight, Copy, Eye } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../../components/ui/breadcrumb";
import { ArrowDown, ArrowUp, Container, Link2, Link2Icon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";
import Loader from "../../../components/ui/loader";
const LabelMap = {
  active: "Active",
  pending: "Pending",
  win: "Win",
  partialWin: "Partial Win",
  loss: "Loss",
};

const statusColorMap = {
  active: "green",
  pending: "yellow",
  win: "blue",
  partialWin: "violet",
  loss: "red",
  breakEven: "gray",
};
// const TradeCard = ({ trade, ref }) => {
//   const isWin = trade.status === "win";
//   const isLoss = trade.status === "loss";
//   const isActive = trade.status === "active";

//   return (
//     <div className="bg-white dark:bg-[#0F0F1A] border rounded-2xl shadow-md">
//       {/* Chart placeholder */}
//       <div className="relative h-[300px] rounded-t-[20px] overflow-hidden">
//         <img
//           src="/media/images/2600x1600/banner_3.jpg"
//           alt="Academy"
//           className="w-full h-full object-cover"
//         />

//         {/* OVERLAY BLOCK */}
//         <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3">
//           <div className="flex items-center gap-3">
//             <button
//               className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 ${
//                 trade.type === "buy"
//                   ? "bg-emerald-500 hover:bg-emerald-600 text-white"
//                   : "bg-red-500 hover:bg-red-600 text-white"
//               }`}
//             >
//               {trade.type === "buy" ? (
//                 <TrendingUp size={16} />
//               ) : (
//                 <TrendingDown size={16} />
//               )}
//               {trade.type.toUpperCase()}
//             </button>

//             <div className="bg-gray-800 px-4 py-2 rounded-lg font-semibold text-sm text-white">
//               {trade.name}
//             </div>
//           </div>

//           {isActive && (
//             <div className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2">
//               <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
//               ACTIVE
//             </div>
//           )}

//           {isWin && (
//             <div className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2">
//               <span>★</span>
//               WIN +{trade.pips} pips
//             </div>
//           )}

//           {isLoss && (
//             <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2">
//               <span>▲</span>
//               LOSS {trade.pips} pips
//             </div>
//           )}
//         </div>
//       </div>

//       <div className="p-6">
//         {/* Trader Info */}
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-3">
//             <div
//               className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
//                 trade.avatarColor
//               }`}
//             >
//               <img
//                 className="w-12 h-12 rounded-full flex items-center justify-center"
//                 src={`${trade?.educatorDetails?.image}`}
//                 alt=""
//               />
//             </div>
//             <div>
//               <div className="dark:text-white font-semibold">
//                 {trade?.educatorDetails?.first_name}{" "}
//                 {trade?.educatorDetails?.last_name}
//               </div>
//               <div className="text-gray-600 text-sm">
//                 {Array.isArray(trade?.educatorDetails?.categories) &&
//                 trade?.educatorDetails?.categories?.length > 0
//                   ? trade?.educatorDetails?.categories
//                       .map((cat) => cat)
//                       .join(", ")
//                   : "-"}
//               </div>
//             </div>
//           </div>
//           <div className="text-gray-600 text-sm">
//             {trade.createAt ? new Date(trade.createAt).getFullYear() : ""}
//           </div>
//         </div>

//         {/* Trade Details */}
//         <div className="space-y-3 mb-6">
//           <div className="flex justify-between items-center">
//             <span className="text-gray-800">Entry</span>
//             <span className="text-white font-mono">{trade.entry}</span>
//           </div>
//           <div className="flex justify-between items-center">
//             <span className="text-gray-800">Stop Loss</span>
//             <span className="text-red-600 font-mono">{trade.invalidation}</span>
//           </div>
//           {["tp1", "tp2", "tp3"].map((tpField, idx) => {
//             const tpValue = trade?.exits?.[idx] ?? "N/A";
//             const fieldName = `TP ${idx + 1}`;

//             return (
//               <div className="flex justify-between items-center" key={tpField}>
//                 <span className="text-gray-800">{fieldName}</span>
//                 <span className="text-emerald-600 font-mono">{tpValue}</span>
//               </div>
//             );
//           })}
//         </div>

//         {/* View Details Button */}
//         <button className="w-full bg-gray-200 hover:bg-gray-700/50 border dark:text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
//           <Eye size={18} />
//           View Details
//         </button>
//       </div>
//     </div>
//   );
// };
const ClientTradeIdeas = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [tradeIdeas, setTradeIdeas] = useState([]);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState({});
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const observer = useRef();

  const { data, isFetching, isLoading } = useGetClientTradeIdeasQuery({
    page: page,
    limit: limit,
  });

  const totalPages = data?.pagination?.totalPages || 1;

  useEffect(() => {
    if (data?.data) {
      if (page === 1) {
        setTradeIdeas(data.data); // replace data if first page
      } else {
        // Append new unique items only
        setTradeIdeas((prevIdeas) => {
          const newIdeas = data.data.filter(
            (idea) => !prevIdeas.some((prev) => prev._id === idea._id)
          );
          return [...prevIdeas, ...newIdeas];
        });
      }
    }
  }, [data, page]);

  const lastTradeIdeaRef = useCallback(
    (node) => {
      if (isFetching || page >= totalPages) return;

      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prevPage) => prevPage + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isFetching, page, totalPages]
  );

  const handleCloseView = () => {
    setIsViewOpen(false);
  };

  const call = () => {
    window.alert("Link is not provide..!");
  };

  // const handleCopy = async (trade) => {
  //   const textToCopy = [
  //     `Entry: ${trade.entry}`,
  //     `Stop Loss: ${trade.invalidation}`,
  //     `Exit 1: ${trade?.exits?.[0] ?? "N/A"}`,
  //     `Exit 2: ${trade?.exits?.[1] ?? "N/A"}`,
  //     `Exit 3: ${trade?.exits?.[2] ?? "N/A"}`,
  //   ].join("\n"); // newline separated

  //   try {
  //     await navigator.clipboard.writeText(textToCopy);
  //     setCopiedId(trade._id); // Mark as copied
  //     setTimeout(() => setCopiedId(null), 1200); // Hide after 3s
  //   } catch (err) {
  //     console.error("Copy failed", err);
  //     alert("Failed to copy ❌");
  //   }
  // };

  const [copiedField, setCopiedField] = useState({ id: null, field: null });

  const handleCopyField = async (tradeId, fieldName, value) => {
    try {
      await navigator.clipboard.writeText(value ?? "N/A");
      setCopiedField({ id: tradeId, field: fieldName });
      setTimeout(() => setCopiedField({ id: null, field: null }), 1200);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };
  const trades = [
    {
      type: "sell",
      pair: "GBPCHF",
      status: "active",
      name: "Sheriff Aderemi",
      initials: "SA",
      avatarColor: "bg-purple-500",
      market: "Forex",
      year: "2025",
      entry: "1.04732",
      stopLoss: "1.05403",
      tp1: "1.04537",
      tp2: "1.04186",
      tp3: "1.03644",
    },
    {
      type: "sell",
      pair: "GOLD",
      status: "loss",
      pips: "-68",
      name: "Andre Tyson",
      initials: "AT",
      avatarColor: "bg-purple-500",
      market: "Forex",
      year: "2025",
      entry: "1947.32",
      stopLoss: "1954.03",
      tp1: "1945.37",
      tp2: "1941.86",
      tp3: "1936.44",
    },
    {
      type: "buy",
      pair: "GOLD",
      status: "win",
      pips: "+127",
      name: "Ricardo Garcia",
      initials: "RG",
      avatarColor: "bg-pink-500",
      market: "Forex",
      year: "2025",
      entry: "4074.30",
      stopLoss: "4092.27",
      tp1: "4067.14",
      tp2: "4060.31",
      tp3: "4054.40",
    },
    {
      type: "buy",
      pair: "EURUSD",
      status: "win",
      pips: "+64",
      name: "Maria Chen",
      initials: "MC",
      avatarColor: "bg-purple-500",
      market: "Forex",
      year: "2025",
      entry: "1.0856",
      stopLoss: "1.0823",
      tp1: "1.0889",
      tp2: "1.0912",
      tp3: "1.0945",
    },
    {
      type: "sell",
      pair: "BTCUSD",
      status: "active",
      name: "John Miller",
      initials: "JM",
      avatarColor: "bg-purple-500",
      market: "Crypto",
      year: "2025",
      entry: "98,250",
      stopLoss: "99,180",
      tp1: "97,420",
      tp2: "96,850",
      tp3: "95,900",
    },
    {
      type: "buy",
      pair: "GBPJPY",
      status: "loss",
      pips: "-65",
      name: "Alex Kumar",
      initials: "AK",
      avatarColor: "bg-pink-500",
      market: "Forex",
      year: "2025",
      entry: "188.45",
      stopLoss: "187.80",
      tp1: "189.10",
      tp2: "189.75",
      tp3: "190.40",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 pb-10">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="IQ Ideas" />
          <ToolbarDescription>
            {/* Oversee educator profiles, manage their sessions, and ensure quality
            trade and course content across the platform. */}
          </ToolbarDescription>
        </ToolbarHeading>
      </Toolbar>

      {/* {isLoading == false ? (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 text-white">
            <div className="grid grid-cols-12 gap-5 md:gap-6">
              {tradeIdeas?.map((trade, index) => (
                <div
                  key={trade._id}
                  className="col-span-12 sm:col-span-6 xl:col-span-4 card rounded-2xl overflow-hidden"
                  ref={
                    index === tradeIdeas.length - 1 ? lastTradeIdeaRef : null
                  }
                >
                  <div className="relative h-[28vh] w-full overflow-hidden">
                    {trade.image && trade.image.length > 0 && (
                      <>
                        <img
                          src={trade.image[trade.currentIndex ?? 0]}
                          alt={trade.pair}
                          className="w-full h-full object-cover cursor-pointer transition-all duration-500"
                          onClick={() => {
                            setSelectedIdea(trade);
                            setIsViewOpen(true);
                          }}
                        />

                        <button
                          onClick={() => {
                            setSelectedIdea(trade);
                            setIsLightBoxOpen(true);
                          }}
                          className="absolute top-2 right-2 text-primary p-2 bg-white bg-opacity-90 rounded-full shadow"
                        >
                          <Eye size={20} />
                        </button>

                        {trade.image.length > 1 && (
                          <>
                            <button
                              onClick={() => {
                                setTradeIdeas((prev) =>
                                  prev.map((t) =>
                                    t._id === trade._id
                                      ? {
                                          ...t,
                                          currentIndex:
                                            (t.currentIndex ?? 0) === 0
                                              ? t.image.length - 1
                                              : (t.currentIndex ?? 0) - 1,
                                        }
                                      : t
                                  )
                                );
                              }}
                              className="!left-3 z-10 bg-white/70 hover:bg-white text-gray-700 rounded-full p-1 shadow-md absolute top-1/2 -translate-y-1/2"
                            >
                              <ChevronLeft size={20} />
                            </button>

                            <button
                              onClick={() => {
                                setTradeIdeas((prev) =>
                                  prev.map((t) =>
                                    t._id === trade._id
                                      ? {
                                          ...t,
                                          currentIndex:
                                            (t.currentIndex ?? 0) ===
                                            t.image.length - 1
                                              ? 0
                                              : (t.currentIndex ?? 0) + 1,
                                        }
                                      : t
                                  )
                                );
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2!right-3 z-10 bg-white/70 hover:bg-white text-gray-700 rounded-full p-1 shadow-md -translate-y-1/2"
                            >
                              <ChevronRight size={20} />
                            </button>

                            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                              {trade.image.map((_, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setTradeIdeas((prev) =>
                                      prev.map((t) =>
                                        t._id === trade._id
                                          ? { ...t, currentIndex: idx }
                                          : t
                                      )
                                    );
                                  }}
                                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                    (trade.currentIndex ?? 0) === idx
                                      ? "bg-primary"
                                      : "bg-gray-300 hover:bg-gray-400"
                                  }`}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  <div className="p-4">
                    <div className="flex justify-between items-start sm:flex-row flex-col sm:gap-0 gap-3">
                      <div className="flex items-center gap-2">
                        {trade?.type === "sell" ? (
                          <ArrowDown className="text-red-500 w-8 h-8 shrink-0" />
                        ) : (
                          <ArrowUp className="text-green-500 w-8 h-8 shrink-0 " />
                        )}

                        <div>
                          <h3 className="font-medium text-gray-800 text-sm mb-1">
                            {trade?.type.toUpperCase()}
                          </h3>
                          <h3 className="font-medium text-gray-800 text-sm mb-1">
                            {trade?.name.toUpperCase()}
                          </h3>
                          <p className="text-2xs font-normal text-gray-500 line-clamp-1">
                            {format(trade?.createAt, "MMM dd, yyyy, hh:mm a")}
                          </p>
                        </div>
                      </div>
                      <div className="flex sm:flex-col items-end gap-2">
                        <span
                          className={`bg-${statusColorMap[trade.status]}-100 dark:bg-${statusColorMap[trade.status]}-700 text-${statusColorMap[trade.status]}-700 dark:text-${statusColorMap[trade.status]}-300 w-fit text-3xs font-normal px-2 py-2 truncate rounded-lg`}
                        >
                          {trade.status.toUpperCase()}
                        </span>
                        <span
                          className={`bg-gray-100 text-${statusColorMap[trade.status]}-700 w-fit text-3xs font-normal px-2 py-2 truncate rounded-lg`}
                        >
                          {trade.timeFrame}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-normal text-sm">
                          Entry
                        </span>
                        <span className="font-medium text-gray-800">
                          {copiedField.id === trade._id &&
                          copiedField.field === "Entry" ? (
                            <span className="text-dark text-sm mr-2">
                              Copied!
                            </span>
                          ) : (
                            <button
                              onClick={() =>
                                handleCopyField(trade._id, "Entry", trade.entry)
                              }
                              className="text-gray-800 items-center mr-2"
                            >
                              <Copy size={14} />
                            </button>
                          )}
                          {trade.entry}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-normal text-sm">
                          Stop Loss
                        </span>
                        <span className="font-medium text-gray-800">
                          {copiedField.id === trade._id &&
                          copiedField.field === "Stop Loss" ? (
                            <span className="text-dark text-sm mr-2">
                              Copied!
                            </span>
                          ) : (
                            <button
                              onClick={() =>
                                handleCopyField(
                                  trade._id,
                                  "Stop Loss",
                                  trade.invalidation
                                )
                              }
                              className="text-gray-800 items-center mr-2"
                            >
                              <Copy size={14} />
                            </button>
                          )}
                          {trade.invalidation}
                        </span>
                      </div>
                      {[0, 1, 2].map((idx) => {
                        const exitValue = trade?.exits?.[idx] ?? "N/A";
                        const fieldName = `Exit ${idx + 1}`;

                        return (
                          <div
                            key={idx}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-gray-600 font-normal text-sm">
                              {fieldName}
                            </span>
                            <span className="font-medium text-gray-800 flex items-center">
                              {copiedField.id === trade._id &&
                              copiedField.field === fieldName ? (
                                <span className="text-dark text-sm mr-2">
                                  Copied!
                                </span>
                              ) : (
                                exitValue !== "N/A" && (
                                  <button
                                    onClick={() =>
                                      handleCopyField(
                                        trade._id,
                                        fieldName,
                                        exitValue
                                      )
                                    }
                                    className="text-gray-800 items-center mr-2"
                                  >
                                    <Copy size={14} />
                                  </button>
                                )
                              )}
                              {exitValue}
                            </span>
                          </div>
                        );
                      })}
                      <button
                        onClick={() => {
                          setSelectedIdea(trade);
                          setIsViewOpen(true);
                        }}
                        className="btn btn-light btn-sm rounded-lg bg-gray-200 text-xs text-gray-800 font-medium"
                      >
                        Read More...
                      </button>
                    </div>
                  </div>
                  <div className="border-1 border-solid border-current bg-gray-100 px-5 py-3">
                    <div className="flex items-center">
                      <EducatorImage
                        educator={trade?.educatorDetails}
                      />
                      <div className="">
                        <Link
                          to={`/iq-educators/${trade?.educatorDetails?._id}`}
                          className="text-2sm text-gray-800 hover:text-primary mb-px"
                        >
                          {trade?.educatorDetails?.first_name}{" "}
                          {trade?.educatorDetails?.last_name}
                        </Link>
                      </div>
                    </div>
                    <div className="flex mt-2">
                      <div className="text-2sm text-gray-700 mb-px">
                        {trade?.category
                          ? trade?.category?.name
                          : "Category not assigned"}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {isFetching && <p>Loading more...</p>}
            {page >= totalPages && (
              <p className="text-center text-gray-900 my-10">
                No more trade ideas to load.
              </p>
            )}
          </div>

          <ViewClientTradeIdeas
            isViewOpen={isViewOpen}
            setIsLightBoxOpen={setIsLightBoxOpen}
            handleCloseView={handleCloseView}
            selectedIdea={selectedIdea}
          />
          <ImageLightBox
            isLightBoxOpen={isLightBoxOpen}
            setIsLightBoxOpen={setIsLightBoxOpen}
            selectedIdea={selectedIdea}
          />
        </div>
      ) : (
        <Loader />
      )} */}

      {isLoading == false ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tradeIdeas?.map((trade, index) => (
            <div
              key={trade._id}
              className="bg-white dark:bg-[#0F0F1A] border rounded-2xl shadow-md"
              ref={index === tradeIdeas.length - 1 ? lastTradeIdeaRef : null}
            >
              {/* Chart placeholder */}
              <div className="relative h-[300px] rounded-t-[20px] overflow-hidden">
                {/* <img
                  src="/media/images/2600x1600/banner_3.jpg"
                  alt="Academy"
                  className="w-full h-full object-cover"
                /> */}

                {/* <div className="relative h-[28vh] w-full overflow-hidden"> */}
                {trade.image && trade.image.length > 0 && (
                  <>
                    <img
                      src={trade.image[trade.currentIndex ?? 0]}
                      alt={trade.pair}
                      className="w-full h-full object-cover cursor-pointer transition-all duration-500"
                    />

                    {/* <button
                          onClick={() => {
                            setSelectedIdea(trade);
                            setIsLightBoxOpen(true);
                          }}
                          className="absolute top-2 right-2 text-primary p-2 bg-white bg-opacity-90 rounded-full shadow"
                        >
                          <Eye size={20} />
                        </button> */}

                    {trade.image.length > 1 && (
                      <>
                        <button
                          onClick={() => {
                            setTradeIdeas((prev) =>
                              prev.map((t) =>
                                t._id === trade._id
                                  ? {
                                      ...t,
                                      currentIndex:
                                        (t.currentIndex ?? 0) === 0
                                          ? t.image.length - 1
                                          : (t.currentIndex ?? 0) - 1,
                                    }
                                  : t
                              )
                            );
                          }}
                          className="!left-3 z-10 bg-white/70 hover:bg-white text-gray-700 rounded-full p-1 shadow-md absolute top-1/2 -translate-y-1/2"
                        >
                          <ChevronLeft size={20} />
                        </button>

                        <button
                          onClick={() => {
                            setTradeIdeas((prev) =>
                              prev.map((t) =>
                                t._id === trade._id
                                  ? {
                                      ...t,
                                      currentIndex:
                                        (t.currentIndex ?? 0) ===
                                        t.image.length - 1
                                          ? 0
                                          : (t.currentIndex ?? 0) + 1,
                                    }
                                  : t
                              )
                            );
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2!right-3 z-10 bg-white/70 hover:bg-white text-gray-700 rounded-full p-1 shadow-md -translate-y-1/2"
                        >
                          <ChevronRight size={20} />
                        </button>

                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
                          {trade.image.map((_, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setTradeIdeas((prev) =>
                                  prev.map((t) =>
                                    t._id === trade._id
                                      ? { ...t, currentIndex: idx }
                                      : t
                                  )
                                );
                              }}
                              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                (trade.currentIndex ?? 0) === idx
                                  ? "bg-primary"
                                  : "bg-gray-300 hover:bg-gray-400"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </>
                )}
                {/* </div> */}

                {/* OVERLAY BLOCK */}
                <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <button
                      className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 ${
                        trade.type === "buy"
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                          : "bg-red-500 hover:bg-red-600 text-white"
                      }`}
                    >
                      {trade.type === "buy" ? (
                        <TrendingUp size={16} />
                      ) : (
                        <TrendingDown size={16} />
                      )}
                      {trade.type.toUpperCase()}
                    </button>

                    <div className="bg-gray-800 px-4 py-2 rounded-lg font-semibold text-sm text-white">
                      {trade.name}
                    </div>
                  </div>

                  {LabelMap[trade.status] === "Active" && (
                    <div className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      {LabelMap[trade.status]}
                    </div>
                  )}
                  {LabelMap[trade.status] === "Pending" && (
                    <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      {LabelMap[trade.status]}
                    </div>
                  )}

                  {LabelMap[trade.status] === "Win" && (
                    <div className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2">
                      <span>★</span>
                      WIN +{trade.pips} pips
                    </div>
                  )}

                  {LabelMap[trade.status] === "Loss" && (
                    <div className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2">
                      <span>▲</span>
                      LOSS -{trade.pips} pips
                    </div>
                  )}
                  {LabelMap[trade.status] === "Partial Win" && (
                    <div className="bg-purple-500 text-white px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2">
                      <span>▲</span>
                      PARTIAL WIN {trade.pips} pips
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6">
                {/* Trader Info */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white ${
                        trade.avatarColor
                      }`}
                    >
                      <img
                        className="w-12 h-12 rounded-full flex items-center justify-center"
                        src={`${trade?.educatorDetails?.image}`}
                        alt=""
                      />
                    </div>
                    <div>
                      <div className="dark:text-white font-semibold">
                        {trade?.educatorDetails?.first_name}{" "}
                        {trade?.educatorDetails?.last_name}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {Array.isArray(trade?.educatorDetails?.categories) &&
                        trade?.educatorDetails?.categories?.length > 0
                          ? trade?.educatorDetails?.categories
                              .map((cat) => cat)
                              .join(", ")
                          : "-"}
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-600 text-sm">
                    {trade.createAt
                      ? new Date(trade.createAt).getFullYear()
                      : ""}
                  </div>
                </div>

                {/* Trade Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800">Entry</span>
                    <span className="text-white font-mono">{trade.entry}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-800">Stop Loss</span>
                    <span className="text-red-600 font-mono">
                      {trade.invalidation}
                    </span>
                  </div>
                  {["tp1", "tp2", "tp3"].map((tpField, idx) => {
                    const tpValue = trade?.exits?.[idx] ?? "N/A";
                    const fieldName = `TP ${idx + 1}`;

                    return (
                      <div
                        className="flex justify-between items-center"
                        key={tpField}
                      >
                        <span className="text-gray-800">{fieldName}</span>
                        <span className="text-emerald-600 font-mono">
                          {tpValue}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* View Details Button */}
                <button
                  className="w-full bg-gray-200 hover:bg-gray-700/50 border dark:text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  onClick={() => {
                    setSelectedIdea(trade);
                    setIsViewOpen(true);
                  }}
                >
                  <Eye size={18} />
                  View Details
                </button>
              </div>
            </div>
          ))}

          <ViewClientTradeIdeas
            isViewOpen={isViewOpen}
            setIsLightBoxOpen={setIsLightBoxOpen}
            handleCloseView={handleCloseView}
            selectedIdea={selectedIdea}
          />
          <ImageLightBox
            isLightBoxOpen={isLightBoxOpen}
            setIsLightBoxOpen={setIsLightBoxOpen}
            selectedIdea={selectedIdea}
          />
        </div>
      ) : (
        <Loader />
      )}
    </div>
  );
};

export default ClientTradeIdeas;

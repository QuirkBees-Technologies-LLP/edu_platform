import React, { useCallback, useEffect, useRef, useState } from "react";
import { toAbsoluteUrl } from "@/utils/Assets";
import { Link } from "react-router-dom";
import { useGetClientTradeIdeasQuery } from "../../../store/api/client/clientTradeIdeasApiSlice";
import { format } from "date-fns";
import ViewClientTradeIdeas from "./ViewClientTradeIdeas";
import ImageLightBox from "./ImageLightBox";
import EducatorImage from "./EducatorImage";
import { Copy, Eye } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../../components/ui/breadcrumb";
import { ArrowDown, ArrowUp, Container, Link2, Link2Icon } from "lucide-react";
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
};

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
    console.log("called.....", tradeId, fieldName, value);
    try {
      await navigator.clipboard.writeText(value ?? "N/A");
      setCopiedField({ id: tradeId, field: fieldName });
      setTimeout(() => setCopiedField({ id: null, field: null }), 1200);
    } catch (err) {
      console.error("Copy failed", err);
    }
  };

  return (
    <div className="container-fluid">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="IQ Ideas" />
          <ToolbarDescription>
            {/* Oversee educator profiles, manage their sessions, and ensure quality
            trade and course content across the platform. */}
          </ToolbarDescription>
        </ToolbarHeading>
      </Toolbar>

      {isLoading == false ? (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 text-white">
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {tradeIdeas.map((idea, index) => (
              <div
                key={idea._id}
                className="card border-2 hover:bg-gray-200 cursor-pointer overflow-hidden h-fit"
              >
                <div
                  className="h-52 overflow-hidden "
                  onClick={() => {
                    setSelectedIdea(idea);
                    setIsViewOpen(true);
                  }}
                  ref={
                    index === tradeIdeas.length - 1 ? lastTradeIdeaRef : null
                  }
                >
                  <img
                    src={idea?.image?.[0]}
                    className="w-full h-full	 object-cover"
                    alt=""
                  />
                </div>
                <div className="h-[405px] card-border card-rounded-b flex flex-col gap-2 justify-between">
                  <div className="px-5 py-4.5 ">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0 justify-between  mb-3">
                      <div className="text-sm sm:text-xs md:text-sm font-medium mr-3 text-gray-900">
                        {idea?.name.toUpperCase()}/{idea?.type.toUpperCase()}
                      </div>
                      <div className="ideas_link flex items-center md:gap-5 gap-3">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusColorMap[idea?.status] || "bg-gray-50 text-gray-700 ring-gray-600/20"}`}
                        >
                          {LabelMap[idea?.status]}
                        </span>

                        {idea?.url ? (
                          <Link to={idea.url} className="z-9">
                            <div className="link_card bg-primary rounded-lg p-2">
                              <Link2 className="text-gray-100 dark:text-gray-900" />
                            </div>
                          </Link>
                        ) : (
                          <span
                            onClick={() =>
                              window.alert("Link is not provided..!")
                            }
                            className="z-9 cursor-pointer text-blue-500 underline"
                          >
                            <div className="link_card bg-primary rounded-lg p-2">
                              <Link2 className="text-gray-100 dark:text-gray-900" />
                            </div>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className=" flex gap-10 mb-4 text-gray-800">
                      {format(idea?.createAt, "MMM dd, yyyy, hh:mm a")}
                    </div>
                    <div className="flex gap-10 mb-4">
                      <div>
                        <div className="text-2sm text-gray-800 uppercase mb-1">
                          Entry
                        </div>
                        <span class="mt-1 inline-flex items-center rounded-md bg-green-50 dark:bg-green-700 dark:text-green-300 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">
                          {idea?.entry}
                        </span>
                      </div>
                      <div>
                        <div className="text-2sm text-gray-800 uppercase mb-1">
                          Invalidation
                        </div>
                        <span class="mt-1 inline-flex items-center rounded-md bg-red-50 dark:bg-red-700 dark:text-red-300 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-600/10 ring-inset">
                          {idea?.invalidation}
                        </span>
                      </div>
                    </div>
                    <div className="">
                      <div className="text-2sm mb-2   text-gray-800 uppercase ">
                        Exits
                      </div>
                      <div className="flex flex-col  gap-2 mt-2">
                        {idea?.exits?.map((exit, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 mt-1"
                          >
                            <div className="inline-flex items-center justify-center shrink-0 rounded-full border-2 border-primary text-dark text-sm size-5 bg-white">
                              {idx + 1}
                            </div>
                            <div className="text-sm text-gray-900">{exit}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="border-1 border-solid border-current bg-gray-100 px-5 py-3">
                    <div className="flex items-center">
                      <EducatorImage
                        educator={idea?.educatorDetails}
                        defaultImage={toAbsoluteUrl(`/media/avatars/300-6.png`)}
                      />
                      <div className="">
                        <Link
                          to="#"
                          className="text-2sm text-gray-800 hover:text-primary mb-px"
                        >
                          {idea?.educatorDetails?.first_name}{" "}
                          {idea?.educatorDetails?.last_name}
                        </Link>
                      </div>
                    </div>
                    <div className="flex mt-2">
                      <div className="text-2sm mb-2   text-gray-800 ">
                        Category:-
                      </div>
                      <div className="text-2sm text-gray-700 mb-px ml-2">
                        {idea?.category
                          ? idea?.category?.name
                          : "Category not assigned"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div> */}
            <div className="grid grid-cols-12 gap-5 md:gap-6">
              {tradeIdeas?.map((trade, index) => (
                <div
                  key={trade._id}
                  className="col-span-12 sm:col-span-6 xl:col-span-4 card rounded-2xl overflow-hidden"
                >
                  <div className="relative w-full">
                    <img
                      src={trade?.image[0]}
                      alt={trade.pair}
                      className="w-full object-cover cursor-pointer h-[220px]"
                      onClick={() => {
                        setSelectedIdea(trade);
                        setIsLightBoxOpen(true);
                      }}
                    />
                    <button onClick={() => {
                      setSelectedIdea(trade);
                      setIsViewOpen(true);
                    }} className="absolute top-2 right-2 text-primary p-2 bg-white bg-opacity-90 rounded-full shadow">
                      <Eye  size={20} />
                    </button>
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
                      {/* <span
                        className={`bg-${statusColorMap[trade.status]}-100 dark:bg-${statusColorMap[trade.status]}-700 text-${statusColorMap[trade.status]}-700 dark:text-${statusColorMap[trade.status]}-300 text-3xs font-normal px-2 py-2 truncate rounded-lg`}
                      >
                        {trade.status.toUpperCase()}
                      </span> */}
                      {/* {copiedId === trade._id ? (
                      <span className="text-dark text-sm">
                        Copied!
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCopy(trade)}
                        className="text-gray-800 items-center"
                      >
                       <Copy />
                      </button>
                    )} */}
                      <div className="flex sm:flex-col items-end gap-2">
                        <span
                          className={`bg-${statusColorMap[trade.status]}-100 dark:bg-${statusColorMap[trade.status]}-700 text-${statusColorMap[trade.status]}-700 dark:text-${statusColorMap[trade.status]}-300 w-fit text-3xs font-normal px-2 py-2 truncate rounded-lg`}
                        >
                          {trade.status.toUpperCase()}
                        </span>
                        <span
                          className={`bg-gray-100 text-${statusColorMap[trade.status]}-700 w-fit text-3xs font-normal px-2 py-2 truncate rounded-lg`}
                          // className={`bg-${statusColorMap[trade.status]}-100 dark:bg-${statusColorMap[trade.status]}-700 text-${statusColorMap[trade.status]}-700 dark:text-${statusColorMap[trade.status]}-300 text-3xs font-normal px-2 py-2 truncate rounded-lg`}
                        >
                          {trade.timeFrame}
                        </span>
                        {/* {copiedId === trade._id ? (
                      <span className="text-dark text-sm">
                        Copied!
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCopy(trade)}
                        className="text-gray-800 items-center"
                      >
                       <Copy />
                      </button>
                    )} */}
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
                      {/* {[0, 1, 2].map((idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-600 font-normal text-sm">
                            {`Exit ${idx + 1}`}
                          </span>
                          <span className="font-medium text-gray-800">
                            {copiedField.id === trade._id &&
                            copiedField.field === `Exit ${idx + 1}` ? (
                              <span className="text-dark text-sm mr-2">
                                Copied!
                              </span>
                            ) : (
                              <button
                                onClick={() =>
                                  handleCopyField(
                                    trade._id,
                                    `Exit ${idx + 1}`,
                                    trade?.exits?.[idx] ?? "N/A"
                                  )
                                }
                                className="text-gray-800 items-center mr-2"
                              >
                                <Copy size={14} />
                              </button>
                            )}
                            {trade?.exits?.[idx] ?? "N/A"}
                          </span>
                        </div>
                      ))} */}
                      {/* <div className="flex justify-between text-sm">
                        <span className="text-gray-600 font-normal text-sm">
                          Exit 2
                        </span>
                        <span className="font-medium text-gray-800">
                          {trade.exit2}
                        </span>
                      </div> */}
                    </div>
                  </div>
                  <div className="border-1 border-solid border-current bg-gray-100 px-5 py-3">
                    <div className="flex items-center">
                      <EducatorImage
                        educator={trade?.educatorDetails}
                        // defaultImage={toAbsoluteUrl(`/media/avatars/300-6.png`)}
                      />
                      <div className="">
                        <Link
                          to={`/iq-educators/${trade?.educatorDetails?._id}`}
                          // to="#"
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
      )}
    </div>
  );
};

export default ClientTradeIdeas;

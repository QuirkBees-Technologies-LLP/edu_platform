import React, { useCallback, useEffect, useRef, useState } from "react";
import { toAbsoluteUrl } from "@/utils/Assets";
import { Link } from "react-router-dom";
import { useGetClientTradeIdeasQuery } from "../../../store/api/client/clientTradeIdeasApiSlice";
import { format } from "date-fns";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../../../components/ui/breadcrumb";
import { ArrowDown, ArrowUp, Container } from "lucide-react";
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";
import ViewAdminTradeIdeas from "./ViewAdminTradeIdeas";
import AdminCardImage from "./AdminCardImage";
import { useGetAdminWithoutTradeIdeasQuery } from "../../../store/api/admin/adminTradeIdeasApiSlice";
import EducatorImage from "../../student/client-trade-ideas/EducatorImage";
import ImageLightBox from "./ImageLightBox";

const statusColorMap = {
  active: "green",
  pending: "yellow",
  win: "blue",
  partialWin: "violet",
  loss: "red",
};
const TradeUserView = [
  {
    _id: "687e23fae13aa9e329fad8ec",
    name: "BTC/USD",
    image: [
      "https://edulms.blob.core.windows.net/trade-ideas-images/738dcdad-dd77-4351-a81d-54295a85bd7a-BTCUSDT.ecn_2025-07-21_13-26-25.png",
    ],
    type: "buy",
    educatorDetails: {
      first_name: "Filipe",
      last_name: "Forner",
      image: null,
    },
    status: "pending",
    entry: "118250",
    invalidation: 118105,
    exits: ["118780", "119450", "120450"],
    createAt: "2025-07-21T11:26:50.746Z",
  },
  {
    _id: "d7f3e8c5d928d5a42d98d9a2",
    name: "ETH/USD",
    image: [
      "https://edulms.blob.core.windows.net/trade-ideas-images/738dcdad-dd77-4351-a81d-54295a85bd7a-BTCUSDT.ecn_2025-07-21_13-26-25.png",
    ],
    type: "sell",
    educatorDetails: {
      first_name: "John",
      last_name: "Doe",
      image: null,
    },
    status: "pending",
    entry: "1900",
    invalidation: 1850,
    exits: ["1950", "2000", "2050"],
    createAt: "2025-07-21T11:30:10.746Z",
  },
  {
    _id: "23e234ae23b8df9485f7f9a7",
    name: "XRP/USD",
    image: [
      "https://edulms.blob.core.windows.net/trade-ideas-images/738dcdad-dd77-4351-a81d-54295a85bd7a-BTCUSDT.ecn_2025-07-21_13-26-25.png",
    ],
    type: "buy",
    educatorDetails: {
      first_name: "Anna",
      last_name: "Smith",
      image: null,
    },
    status: "active",
    entry: "0.85",
    invalidation: 0.8,
    exits: ["0.90", "0.95", "1.00"],
    createAt: "2025-07-21T11:35:25.746Z",
  },
  {
    _id: "a4f3c0db7a2f6b7d98a6a5bb",
    name: "SOL/USD",
    image: [
      "https://edulms.blob.core.windows.net/trade-ideas-images/738dcdad-dd77-4351-a81d-54295a85bd7a-BTCUSDT.ecn_2025-07-21_13-26-25.png",
    ],
    type: "sell",
    educatorDetails: {
      first_name: "Mike",
      last_name: "Jordan",
      image: null,
    },
    status: "pending",
    entry: "35",
    invalidation: 33,
    exits: ["38", "40", "42"],
    createAt: "2025-07-21T11:40:30.746Z",
  },
];
const AdminTradeCards = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [tradeIdeas, setTradeIdeas] = useState([]);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState({});
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);

  const observer = useRef();

  // const { data, isFetching } = useGetClientTradeIdeasQuery({
  //   page: page,
  //   limit: limit,
  // });
  
  const { data: fetchData, isFetching } = useGetAdminWithoutTradeIdeasQuery({
    isview: false,
  });

  // const totalPages = fetchData?.pagination?.totalPages || 1;

  // useEffect(() => {
  //   if (fetchData?.data) {
  //     if (page === 1) {
  //       setTradeIdeas(fetchData.data); // replace data if first page
  //     } else {
  //       // Append new unique items only
  //       setTradeIdeas((prevIdeas) => {
  //         const newIdeas = fetchData.data.filter(
  //           (idea) => !prevIdeas.some((prev) => prev._id === idea._id)
  //         );
  //         return [...prevIdeas, ...newIdeas];
  //       });
  //     }
  //   }
  // }, [fetchData, page]);

  // const lastTradeIdeaRef = useCallback(
  // (node) => {
  //     if (isFetching || page >= totalPages) return;

  //     if (observer.current) observer.current.disconnect();
  //     observer.current = new IntersectionObserver((entries) => {
  //     if (entries[0].isIntersecting) {
  //         setPage((prevPage) => prevPage + 1);
  //     }
  //     });

  //     if (node) observer.current.observe(node);
  // },
  // [isFetching, page, totalPages]
  // );

  const handleCloseView = () => {
    setIsViewOpen(false);
  };

  return (
    <div className="container-fluid p-0">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="IQ Ideas" />
          <ToolbarDescription>
            Oversee educator profiles, manage their sessions, and ensure quality
            trade and course content across the platform.
          </ToolbarDescription>
        </ToolbarHeading>
      </Toolbar>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 text-white">
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {fetchData?.data?.map((idea, index) => (
              <div
                key={idea._id}
                className="card border-2 hover:bg-gray-200 cursor-pointer overflow-hidden h-fit" onClick={() => { setSelectedIdea(idea); setIsViewOpen(true); }} ref={index === tradeIdeas.length - 1 ? lastTradeIdeaRef : null} >
                <div className="h-52 overflow-hidden">
                  <img
                    src={idea?.image?.[0]}
                    className="w-full h-full	 object-cover"
                    alt=""
                  />
                </div>
                <div className="card-border card-rounded-b flex flex-col gap-2 justify-between">
                  <div className="px-5 py-4.5 min-h-64 ">
                    <div className="font-bold mr-3 text-gray-900 mb-3">{idea?.name.toUpperCase()}/{idea?.type.toUpperCase()}</div>
                    <div className="flex gap-10 mb-3">
                      <div>
                        <div className="text-2sm text-gray-800 uppercase">Entry</div>
                        <span class="mt-1 inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-green-600/20 ring-inset">{idea?.entry}</span>
                      </div>
                      <div>
                        <div className="text-2sm text-gray-800 uppercase">
                          Invalidation
                        </div>
                        <span class="mt-1 inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-red-600/10 ring-inset">{idea?.invalidation}</span>
                      </div>
                    </div>
                    <div className="">
                      <div className="text-2sm mb-2   text-gray-800 uppercase ">Exits</div>
                      <div className="flex items-center flex-wrap gap-2">
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
                  
                      <AdminCardImage educator={idea?.educatorDetails} defaultImage={toAbsoluteUrl(`/media/avatars/300-6.png`)} />
                      <div>
                        <Link
                          to="/public-profile/profiles/nft"
                          className="text-2sm text-gray-800 hover:text-primary mb-px"
                        >
                          {idea?.educatorDetails?.first_name} {idea?.educatorDetails?.last_name}
                        </Link>
                        <div className="text-2sm text-gray-700 mb-px">
                          {format(idea?.createdAt, "MMM dd, yyyy, hh:mm a")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            ))}
          </div> */}

          <div className="grid grid-cols-12 gap-5 md:gap-6">
            {fetchData?.data?.map((trade, index) => (
              <div
                key={trade._id}
                className="col-span-12 sm:col-span-6 xl:col-span-4 card rounded-2xl overflow-hidden"
              >
                <div className="relative w-full">
                  <img
                    src={trade?.image[0]}
                    alt={trade.pair}
                    className="w-full object-cover cursor-pointer"
                    onClick={() => {
                      setSelectedIdea(trade);
                      setIsLightBoxOpen(true);
                    }}
                  />
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
                          {format(trade?.createdAt, "MMM dd, yyyy, hh:mm a")}
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
                        {trade.entry}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 font-normal text-sm">
                        Stop Loss
                      </span>
                      <span className="font-medium text-gray-800">
                        {trade.invalidation}
                      </span>
                    </div>
                    {[0, 1, 2].map((idx) => {
                      const exitValue = trade?.exits?.[idx] ?? "N/A";
                      const fieldName = `Exit ${idx + 1}`;

                      return (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-600 font-normal text-sm">
                            {fieldName}
                          </span>
                          <span className="font-medium text-gray-800 flex items-center">
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
                        to="#"
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
          {/* {page >= totalPages && (
            <p className="text-center my-10">No more IQ Ideas to load.</p>
          )} */}
        </div>

        <ViewAdminTradeIdeas
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
    </div>
  );
};

export default AdminTradeCards;

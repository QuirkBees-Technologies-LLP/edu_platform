import React, { useCallback, useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { ArrowDown, ArrowUp } from "lucide-react";
import { Toolbar, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import ViewEducatorTradeIdeas from "./ViewEducatorTradeIdeas";
import { useGetEducatorWithoutTradeIdeasQuery } from "../../../store/api/educator/educatorTradeIdeasApiSlice";
import EducatorImage from "../../student/client-trade-ideas/EducatorImage";
import ImageLightBox from "./ImageLightBox";
import { Link } from "react-router-dom";
import { useGetEducatorLiveTradeIdeasQuery, useLazyGetEducatorLiveTradeIdeasQuery } from "../../../store/api/educator/educatorLiveTradeIdeasApiSlice";

const statusColorMap = {
  active: "green",
  pending: "yellow",
  win: "blue",
  partialWin: "violet",
  loss: "red",
  breakEven: "gray"
};


const EducatorTradeCards = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [tradeIdeas, setTradeIdeas] = useState([]);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState({});
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);

  const { data: ListRecord } =
    useGetEducatorWithoutTradeIdeasQuery({ isview: false });

  const observer = useRef();

  const { data, isFetching } = useGetEducatorLiveTradeIdeasQuery({
    page: page,
    limit: limit,
    isview: true,
    category: ""
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
  return (
    <div className="container-fluid p-0">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text=" Live IQ Ideas" />
          <ToolbarDescription>
            Oversee educator profiles, manage their sessions, and ensure quality trade and course content across the platform.
          </ToolbarDescription>
        </ToolbarHeading>
      </Toolbar>


      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 text-white">


          <div className="grid grid-cols-12 gap-5 md:gap-6">
            {data?.data?.map((trade, index) => (
              <div
                key={trade._id}
                className="col-span-12 sm:col-span-6 xl:col-span-4 card rounded-2xl overflow-hidden"
              >
                <div className="relative h-[28vh] w-full">
                  <img
                    src={trade?.image[0]}
                    alt={trade.pair}
                    className="w-full object-cover h-full cursor-pointer"
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

                    </div>
                  </div>

                  {/* <div className="mt-6 space-y-4">
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
                        <div
                          key={idx}
                          className="flex justify-between text-sm"
                        >
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

                  </div> */}
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

        </div>

        <ViewEducatorTradeIdeas
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
}

export default EducatorTradeCards
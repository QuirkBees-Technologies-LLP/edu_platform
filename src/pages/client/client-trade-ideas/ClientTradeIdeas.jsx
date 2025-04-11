import React, { useCallback, useEffect, useRef, useState } from "react";
import { toAbsoluteUrl } from "@/utils/Assets";
import { Link } from "react-router-dom";
import { useGetClientTradeIdeasQuery } from "../../../store/api/client/clientTradeIdeasApiSlice";
import { format } from "date-fns";
import ViewClientTradeIdeas from "./ViewClientTradeIdeas";
import ImageLightBox from "./ImageLightBox";

const ClientTradeIdeas = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [tradeIdeas, setTradeIdeas] = useState([]);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState({});
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);

  const observer = useRef();
  const { data, error, isLoading, isFetching } = useGetClientTradeIdeasQuery({
    page: page,
    limit: limit,
  });

  useEffect(() => {
    setTradeIdeas([]);
  }, []);

  React.useEffect(() => {
    if (data?.data) {
      setTradeIdeas((prevIdeas) => [...prevIdeas, ...data.data]);
    }
  }, [data]);

  const totalPages = data?.pagination?.totalPages || 1;

  // Ref for the last item in the list
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
  }

  return (
    <div className="container-fluid">
      <div className="grid grid-cols-12 gap-4">
        {/* Left Section (10 Columns) */}
        <div className="col-span-12 text-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tradeIdeas.map((idea, index) => (
              <div key={index} className="card border-2 hover:bg-gray-200 cursor-pointer" onClick={() => {
                setSelectedIdea(idea);
                setIsViewOpen(true);
              }} ref={index === tradeIdeas.length - 1 ? lastTradeIdeaRef : null}>
                <div className="flex items-center px-4 pt-3">
                  <div className="mr-3 mb-3 text-gray-900">{idea?.name}</div>
                </div>
                <img
                  src={idea?.image?.[0]}
                  className="w-full h-44 object-cover"
                  alt=""
                />
                <div className="card-border card-rounded-b flex flex-col gap-2 px-5 py-4.5">
                  <div className="flex gap-10">
                    <div>
                      <div className="text-2sm text-gray-800 uppercase">
                        Entry
                      </div>
                      <div className="text-sm text-gray-900">{idea?.entry}</div>
                    </div>
                    <div>
                      <div className="text-2sm text-gray-800 uppercase">
                        Invalidation
                      </div>
                      <div className="text-sm text-gray-900">{idea?.invalidation}</div>
                    </div>
                  </div>
                  <div>
                    <div className="text-2sm text-gray-800 uppercase">
                      Exits
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                      {idea?.exits?.map((exit, index) => (
                        <div key={index} className="flex items-center gap-2 mt-1">
                          <div className="inline-flex items-center justify-center shrink-0 rounded-full border-2 border-primary text-dark text-sm size-5 bg-white">
                            {index + 1}
                          </div>
                          <div className="text-sm text-gray-900">{exit}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center  pt-4">
                    <img
                      src={toAbsoluteUrl(`/media/avatars/300-6.png`)}
                      className="rounded-full size-7 me-2"
                      alt=""
                    />
                    <div>
                      <Link
                        to="/public-profile/profiles/nft"
                        className="text-2sm text-gray-800 hover:text-primary mb-px"
                      >
                        {idea?.educatorDetails?.name}
                      </Link>
                      <div className="text-2sm text-gray-700 mb-px">
                        {format(idea?.createAt, "MMM dd, yyyy, hh:mm a")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {isFetching && <p>Loading more...</p>}
          {page >= totalPages && <p>No more trade ideas to load.</p>}
        </div>
        <ViewClientTradeIdeas isViewOpen={isViewOpen} setIsLightBoxOpen={setIsLightBoxOpen} handleCloseView={handleCloseView} selectedIdea={selectedIdea} />
        <ImageLightBox isLightBoxOpen={isLightBoxOpen} setIsLightBoxOpen={setIsLightBoxOpen} selectedIdea={selectedIdea} />
      </div>
    </div>
  );
}

export default ClientTradeIdeas
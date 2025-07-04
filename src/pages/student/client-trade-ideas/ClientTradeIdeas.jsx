import React, { useCallback, useEffect, useRef, useState } from "react";
import { toAbsoluteUrl } from "@/utils/Assets";
import { Link } from "react-router-dom";
import { useGetClientTradeIdeasQuery } from "../../../store/api/client/clientTradeIdeasApiSlice";
import { format } from "date-fns";
import ViewClientTradeIdeas from "./ViewClientTradeIdeas";
import ImageLightBox from "./ImageLightBox";
import EducatorImage from "./EducatorImage";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../components/ui/breadcrumb';
import { Container } from "lucide-react";
import { Toolbar, ToolbarActions, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';

const ClientTradeIdeas = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [tradeIdeas, setTradeIdeas] = useState([]);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState({});
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);

  const observer = useRef();

  const { data, isFetching } = useGetClientTradeIdeasQuery({
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

  return (
    <div className="container-fluid">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Trade Ideas" />
          <ToolbarDescription>
            Oversee educator profiles, manage their sessions, and ensure quality trade and course content across the platform.
          </ToolbarDescription>
        </ToolbarHeading>
      </Toolbar>


      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 text-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tradeIdeas.map((idea, index) => (
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
                    <div className="font-bold mr-3 text-gray-900 mb-3">{idea?.name}</div>
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
                      <EducatorImage educator={idea?.educatorDetails} defaultImage={toAbsoluteUrl(`/media/avatars/300-6.png`)} />
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

              </div>
            ))}
          </div>

          {isFetching && <p>Loading more...</p>}
          {page >= totalPages && <p>No more trade ideas to load.</p>}
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
    </div>
  );
};

export default ClientTradeIdeas;

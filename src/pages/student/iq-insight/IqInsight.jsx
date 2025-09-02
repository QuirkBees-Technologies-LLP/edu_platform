import { useCallback, useEffect, useRef, useState } from "react";
import { toAbsoluteUrl } from "@/utils/Assets";
import { Link } from "react-router-dom";
import { useGetClientTradeAnalysisQuery, useGetClientTradeIdeasQuery } from "../../../store/api/client/clientTradeIdeasApiSlice";
import { format } from "date-fns";
import ImageLightBox from "./ImageLightBox";
// import EducatorImage from "./EducatorImage";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../components/ui/breadcrumb';
import { Container, ShieldAlert, Videotape } from "lucide-react";
import { Toolbar, ToolbarActions, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import ViewInsightTradeIdeas from "./ViewInsightTradeIdeas";
import EducatorImage from "../client-trade-ideas/EducatorImage";
import ShowMoreLess from "../../../components/ui/showmoreless";
import Loader from "../../../components/ui/loader";


const LabelMap = {
  active: "Active",
  pending: "Pending",
  win: "Win",
  partialWin: "Partial Win",
  loss: "Loss",
};

const statusColorMap = {
  active: "bg-green-50 text-green-700 ring-green-600/20",
  pending: "bg-yellow-50 text-yellow-700 ring-yellow-600/20",
  win: "bg-blue-50 text-blue-700 ring-blue-600/20",
  partialWin: "bg-violet-50 text-violet-700 ring-violet-600/20",
  loss: "bg-red-50 text-red-700 ring-red-600/20",
};

const IqInsight = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [tradeIdeas, setTradeIdeas] = useState([]);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState({});
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);

  const observer = useRef();

  const { data, isFetching, isLoading } = useGetClientTradeAnalysisQuery({
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
    <div className="container-fluid pb-5">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="IQ Insight" />
          <ToolbarDescription>
            {/* Oversee educator profiles, manage their sessions, and ensure quality trade and course content across the platform. */}
          </ToolbarDescription>
        </ToolbarHeading>
      </Toolbar>


      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 text-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {isLoading ? <Loader /> : tradeIdeas.length > 0 ? tradeIdeas.map((idea, index) => (
              <div
                key={idea._id}
                className="card border-2 hover:bg-gray-200 overflow-hidden h-fit">
                <div className="overflow-hidden cursor-pointer" onClick={() => { setSelectedIdea(idea); setIsViewOpen(true); }} ref={index === tradeIdeas.length - 1 ? lastTradeIdeaRef : null}>
                  <img
                    src={idea?.image?.[0]}
                    className="w-full h-full object-cover"
                    alt=""
                  />
                </div>
                <div className="card-border card-rounded-b flex flex-col gap-2 justify-between min-h-[210px]">
                  <div className="px-5 py-4.5 ">
                    <div className="flex item-center justify-between  mb-2">
                      <div className="font-bold mr-3 text-gray-900">{idea?.name}</div>
                      {/* <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${statusColorMap[idea?.status] || "bg-gray-50 text-gray-700 ring-gray-600/20"}`}>{LabelMap[idea?.status]}</span> */}
                    </div>
                    {/* <p className="text-gray-800 line-clamp-3 text-sm font-normal">Oversee educator profiles, manage their sessions, and ensure quality trade and course content across the platform.</p> */}
                    <ShowMoreLess className="text-gray-900 text-sm mt-2 leading-relaxed" html={idea?.description || 'No description'} limit={95} />
                    {/* <div className="flex gap-10 mb-3">
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
                    </div> */}
                    {/* <div className="">
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
                    </div> */}
                  </div>
                  <div className="border-1 border-solid border-current bg-gray-100 px-5 py-3">
                    <div className="flex items-center">
                      <EducatorImage educator={idea?.educatorDetails}  />
                      <div>
                        <Link
                          to={`/iq-educators/${idea?.educatorDetails?._id}`}
                          className="text-2sm text-gray-800 hover:text-primary mb-px"
                        >
                          {idea?.educatorDetails?.first_name}{" "}
                          {idea?.educatorDetails?.last_name}                        </Link>
                        <div className="text-2sm text-gray-700 mb-px">
                          {format(idea?.createAt, "MMM dd, yyyy, hh:mm a")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )) : <div className="text-center text-gray-900 my-10">No IQ Ideas to load.</div>}
          </div>
        </div>

        <ViewInsightTradeIdeas
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
  )
}

export default IqInsight
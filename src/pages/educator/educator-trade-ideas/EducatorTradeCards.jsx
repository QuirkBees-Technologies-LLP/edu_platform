import React, { useCallback, useEffect, useRef, useState } from "react";
import { toAbsoluteUrl } from "@/utils/Assets";
import { Link } from "react-router-dom";
import { useGetClientTradeIdeasQuery } from "../../../store/api/client/clientTradeIdeasApiSlice";
import { format } from "date-fns";
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '../../../components/ui/breadcrumb';
import { Container } from "lucide-react";
import { Toolbar, ToolbarActions, ToolbarDescription, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import ViewEducatorTradeIdeas from "./ViewEducatorTradeIdeas";
import EducatorCardImage from "./EducatorCardImage";
const TradeUserView = [
  {
    "_id": "687e23fae13aa9e329fad8ec",
    "name": "BTC/USD",
    "image": [
      "https://edulms.blob.core.windows.net/trade-ideas-images/738dcdad-dd77-4351-a81d-54295a85bd7a-BTCUSDT.ecn_2025-07-21_13-26-25.png"
    ],
    "type": "buy",
    "educatorDetails": {
      "first_name": "Filipe",
      "last_name": "Forner",
      "image": null
    },
    "status": "pending",
    "entry": "118250",
    "invalidation": 118105,
    "exits": [
      "118780",
      "119450",
      "120450"
    ],
    "createAt": "2025-07-21T11:26:50.746Z"
  },
  {
    "_id": "d7f3e8c5d928d5a42d98d9a2",
    "name": "ETH/USD",
    "image": [
      "https://edulms.blob.core.windows.net/trade-ideas-images/738dcdad-dd77-4351-a81d-54295a85bd7a-BTCUSDT.ecn_2025-07-21_13-26-25.png"
    ],
    "type": "sell",
    "educatorDetails": {
      "first_name": "John",
      "last_name": "Doe",
      "image": null
    },
    "status": "pending",
    "entry": "1900",
    "invalidation": 1850,
    "exits": [
      "1950",
      "2000",
      "2050"
    ],
    "createAt": "2025-07-21T11:30:10.746Z"
  },
  {
    "_id": "23e234ae23b8df9485f7f9a7",
    "name": "XRP/USD",
    "image": [
      "https://edulms.blob.core.windows.net/trade-ideas-images/738dcdad-dd77-4351-a81d-54295a85bd7a-BTCUSDT.ecn_2025-07-21_13-26-25.png"
    ],
    "type": "buy",
    "educatorDetails": {
      "first_name": "Anna",
      "last_name": "Smith",
      "image": null
    },
    "status": "active",
    "entry": "0.85",
    "invalidation": 0.80,
    "exits": [
      "0.90",
      "0.95",
      "1.00"
    ],
    "createAt": "2025-07-21T11:35:25.746Z"
  },
  {
    "_id": "a4f3c0db7a2f6b7d98a6a5bb",
    "name": "SOL/USD",
    "image": [
      "https://edulms.blob.core.windows.net/trade-ideas-images/738dcdad-dd77-4351-a81d-54295a85bd7a-BTCUSDT.ecn_2025-07-21_13-26-25.png"
    ],
    "type": "sell",
    "educatorDetails": {
      "first_name": "Mike",
      "last_name": "Jordan",
      "image": null
    },
    "status": "pending",
    "entry": "35",
    "invalidation": 33,
    "exits": [
      "38",
      "40",
      "42"
    ],
    "createAt": "2025-07-21T11:40:30.746Z"
  }
];

const EducatorTradeCards = () => {
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
    <div className="container-fluid p-0">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
            {TradeUserView.map((idea, index) => (
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
                        {/* <img src="/media/avatars/300-6.png" alt="" /> */}
                      <EducatorCardImage educator={idea?.educatorDetails} defaultImage={toAbsoluteUrl(`/media/avatars/300-6.png`)} />
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
          {page >= totalPages && <p className="text-center my-10">No more trade ideas to load.</p>}
        </div>

        <ViewEducatorTradeIdeas
          isViewOpen={isViewOpen}
          setIsLightBoxOpen={setIsLightBoxOpen}
          handleCloseView={handleCloseView}
          selectedIdea={selectedIdea}
        />
      </div>
    </div>
  );
}

export default EducatorTradeCards
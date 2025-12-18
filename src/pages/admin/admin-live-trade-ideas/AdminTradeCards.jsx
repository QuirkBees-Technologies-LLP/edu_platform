import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { ArrowDown, ArrowUp, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Toolbar,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle
} from "@/partials/toolbar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import SearchFilterInput from "../../../components/SearchFilterInput";
import EducatorImage from "../../student/client-trade-ideas/EducatorImage";
import ViewAdminTradeIdeas from "./ViewAdminTradeIdeas";
import ImageLightBox from "./ImageLightBox";
import { debounce } from "lodash";
import { useGetAdminLiveTradeIdeasQuery } from "../../../store/api/admin/adminLiveTradeIdeasApiSlice";
import { useGetEducatorsQuery } from "../../../store/api/admin/adminEducatorsApiSlice";
import { useGetEducatorAcademyCategoryQuery } from "../../../store/api/educator/educatorAcademyCategoryApiSlice";

const STATUS_BADGE_CLASS = {
  active: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  win: "bg-green-100 text-green-700",
  partialWin: "bg-green-100 text-green-700",
  breakEven: "bg-gray-100 text-gray-700",
  loss: "bg-red-100 text-red-700"
};

const AdminTradeCards = () => {
  const limit = 10;
  const [page, setPage] = useState(1);
  const [tradeIdeas, setTradeIdeas] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [educator, setEducator] = useState(undefined);
  const [category, setCategory] = useState(undefined);
  const [status, setStatus] = useState(undefined);

  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState({});
  const [isLightBoxOpen, setIsLightBoxOpen] = useState(false);

  const observerRef = useRef(null);

  const { data, isLoading, isFetching } =
    useGetAdminLiveTradeIdeasQuery({
      isview: false,
      page,
      limit,
      search: searchText || "",
      educator: educator || "",
      category: category || "",
      status: status || ""
    });

  const totalPages = data?.pagination?.totalPages || 1;

  /* ---------------------------
     APPEND / RESET DATA
  ----------------------------*/
  useEffect(() => {
    if (!data?.data) return;

    if (page === 1) {
      setTradeIdeas(data?.data);
    } else {
      setTradeIdeas(prev => {
        const newItems = data?.data.filter(
          item => !prev.some(p => p._id === item._id)
        );
        return [...prev, ...newItems];
      });
    }

    setHasMore(page < totalPages);
  }, [data, page, totalPages]);

  /* ---------------------------
     INFINITE SCROLL
  ----------------------------*/
  const lastCardRef = useCallback(
    node => {
      if (isFetching || !hasMore) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
          setPage(prev => prev + 1);
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isFetching, hasMore]
  );

  /* ---------------------------
     SEARCH (DEBOUNCED)
  ----------------------------*/
  const debouncedSearch = useMemo(
    () =>
      debounce(value => {
        setSearchText(value);
        setPage(1);
      }, 500),
    []
  );

  const handleSearchChange = e => {
    setSearchText(e.target.value);
    debouncedSearch(e.target.value);
  };

  const resetAndSet = setter => value => {
    setter(value || undefined);
    setPage(1);
  };

  const { data: educators } = useGetEducatorsQuery({ page: 1, limit: 100 });
  const { data: categoryList } = useGetEducatorAcademyCategoryQuery();

  return (
    <div className="container-fluid p-0">
      {/* HEADER */}
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="Live IQ Ideas" />
          <ToolbarDescription>
            Oversee educator profiles and their trade ideas.
          </ToolbarDescription>
        </ToolbarHeading>
      </Toolbar>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-2 mb-4 ">
        <div>
          <SearchFilterInput
            searchText={searchText}
            handleSearchChange={handleSearchChange}
          />
        </div>
        <div className="flex items-center gap-2 relative">
          <Select
            value={educator}
            onValueChange={(value) => {
              setEducator(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Educator" />
            </SelectTrigger>
            <SelectContent>
              {educators?.data?.map((e) => (
                <SelectItem key={e._id} value={e._id}>
                  {e.first_name} {e.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {educator && (
            <button
              type="button"
              onClick={() => {
                setEducator("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              ✖
            </button>
          )}
        </div>
        <div className="flex items-center gap-2  relative">
          <Select
            value={category}
            onValueChange={(value) => {
              setCategory(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categoryList?.data?.map((e) => (
                <SelectItem key={e._id} value={e._id}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {category && (
            <button
              type="button"
              onClick={() => {
                setCategory("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              ✖
            </button>
          )}
        </div>
        <div className="flex items-center gap-2  relative">
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="win">Win</SelectItem>
              <SelectItem value="partialWin">Partial Win</SelectItem>
              <SelectItem value="breakEven">Break Even</SelectItem>
              <SelectItem value="loss">Loss</SelectItem>
            </SelectContent>
          </Select>

          {status && (
            <button
              type="button"
              onClick={() => {
                setStatus("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              ✖
            </button>
          )}
        </div>
      </div>

      {/* CARDS */}
      <div className="grid grid-cols-12 gap-6">
        {tradeIdeas?.map((trade, index) => {
          const isLast = index === tradeIdeas?.length - 1;
          return (
            <div
              key={trade?._id}
              ref={isLast ? lastCardRef : null}
              className="col-span-12 sm:col-span-6 xl:col-span-4 card rounded-2xl overflow-hidden"
            >
              <div className="relative h-[28vh]">
                <img
                  src={trade?.image?.[0] || "/placeholder.jpg"}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => {
                    setSelectedIdea(trade);
                    setIsLightBoxOpen(true);
                  }}
                />
              </div>

              <div className="p-4">
                <div className="flex justify-between">
                  <div className="flex gap-2">
                    {trade?.type === "sell" ? (
                      <ArrowDown className="text-red-500" />
                    ) : (
                      <ArrowUp className="text-green-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium">{trade?.name}</p>
                      <p className="text-xs text-gray-500">
                        {format(new Date(trade?.createdAt), "MMM dd, yyyy")}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs px-2 py-2 rounded ${STATUS_BADGE_CLASS[trade?.status]
                      }`}
                  >
                    {trade?.status}
                  </span>
                </div>

                <button
                  className="btn btn-light btn-sm mt-4"
                  onClick={() => {
                    setSelectedIdea(trade);
                    setIsViewOpen(true);
                  }}
                >
                  Read More
                </button>
              </div>

              <div className="bg-gray-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <EducatorImage educator={trade?.educatorDetails} />
                  <Link to="#" className="text-sm">
                    {trade?.educatorDetails?.first_name}{" "}
                    {trade?.educatorDetails?.last_name}
                  </Link>
                </div>
              </div>
            </div>
          );
        })}

        {/* INITIAL LOADER */}
        {isLoading && page === 1 && (
          <div className="col-span-12 flex justify-center py-20">
            <Loader2 className="animate-spin" />
          </div>
        )}

        {/* NO DATA */}
        {!isLoading && tradeIdeas?.length === 0 && (
          <div className="col-span-12 text-center py-20 text-gray-500">
            No trades found.
          </div>
        )}

        {/* SCROLL LOADER */}
        {isFetching && page > 1 && (
          <div className="col-span-12 flex justify-center py-10">
            <Loader2 className="animate-spin text-gray-400" />
          </div>
        )}
      </div>

      <ViewAdminTradeIdeas
        isViewOpen={isViewOpen}
        selectedIdea={selectedIdea}
        handleCloseView={() => setIsViewOpen(false)}
      />

      <ImageLightBox
        isLightBoxOpen={isLightBoxOpen}
        setIsLightBoxOpen={setIsLightBoxOpen}
        selectedIdea={selectedIdea}
      />
    </div>
  );
};

export default AdminTradeCards;

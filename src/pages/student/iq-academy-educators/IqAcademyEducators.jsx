import React, {
  useState,
  useMemo,
  useEffect,
  useCallback,
  useRef,
} from "react";
import debounce from "lodash.debounce";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import {
  useGetClientEducatorAcademyCategoryQuery,
  useGetEducatorsListQuery,
  useToggleFollowMutation,
} from "../../../store/api/client/clientEductorApiSlice";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import SearchFilterInput from "../../../components/SearchFilterInput";
import { toAbsoluteUrl } from "@/utils/Assets";

const safeArray = (val) => (Array.isArray(val) ? val : []);

const EducatorCardSkeleton = () => {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#0F0F1A] shadow-lg border overflow-hidden animate-pulse">
      <div className="relative h-[200px] bg-gray-300 dark:bg-gray-700" />

      <div className="p-5 relative">
        <div className="absolute -top-10 left-5">
          <div className="w-20 h-20 rounded-full bg-gray-300 dark:bg-gray-700" />
          <div className="w-6 h-6 rounded-full bg-gray-400 dark:bg-gray-600 absolute -bottom-1 right-0" />
        </div>

        <div className="mt-8 space-y-4">
          <div className="h-4 w-40 bg-gray-300 dark:bg-gray-700 rounded" />

          <div className="flex justify-between mt-6">
            <div className="text-center space-y-2">
              <div className="h-4 w-10 bg-gray-300 dark:bg-gray-700 rounded" />
              <div className="h-3 w-14 bg-gray-300 dark:bg-gray-700 rounded" />
            </div>

            <div className="text-center space-y-2">
              <div className="h-4 w-10 bg-gray-300 dark:bg-gray-700 rounded" />
              <div className="h-3 w-14 bg-gray-300 dark:bg-gray-700 rounded" />
            </div>

            <div className="text-center space-y-2">
              <div className="h-4 w-10 bg-gray-300 dark:bg-gray-700 rounded" />
              <div className="h-3 w-14 bg-gray-300 dark:bg-gray-700 rounded" />
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <div className="h-10 flex-1 bg-gray-300 dark:bg-gray-700 rounded-xl" />
            <div className="h-10 flex-1 bg-gray-300 dark:bg-gray-700 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

const IqAcademyEducators = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [category, setCategory] = useState(null);
  const [followLoadingId, setFollowLoadingId] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(9);
  const [educatorList, setEducatorList] = useState([]);

  const observer = useRef(null);

  const { data, isLoading, isFetching, refetch } = useGetEducatorsListQuery({
    search: searchText,
    tab: activeTab,
    category: category?._id || "",
    page,
    limit,
  });

  const totalPages = data?.pagination?.totalPages || 1;
  const totalRecords = data?.pagination?.totalRecords || 0;

  const { data: categoryList } = useGetClientEducatorAcademyCategoryQuery();
  const categories = safeArray(categoryList?.data);

  const [toggleFollowData] = useToggleFollowMutation();

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        setSearchText(value);
        setPage(1);
      }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    debouncedSearch(value);
  };

  useEffect(() => {
    const list = safeArray(data?.data);

    if (page === 1) {
      setEducatorList(list);
    } else {
      setEducatorList((prev) => {
        const newItems = list.filter(
          (item) => !prev.some((p) => p._id === item._id)
        );
        return [...prev, ...newItems];
      });
    }
  }, [data, page]);

  const lastEducatorRef = useCallback(
    (node) => {
      if (isFetching || page >= totalPages) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0]?.isIntersecting) {
          setPage((prev) => prev + 1);
        }
      });

      if (node) observer.current.observe(node);
    },
    [isFetching, page, totalPages]
  );

  const handleToggle = async (educator) => {
    const eduId = educator._id;
    const previousList = [...educatorList];

    setEducatorList((prev) =>
      prev.map((item) =>
        item._id === eduId
          ? {
              ...item,
              isFollowing: !item.isFollowing,
              followingCount: item.isFollowing
                ? Math.max(0, (item.followingCount || 0) - 1)
                : (item.followingCount || 0) + 1,
            }
          : item
      )
    );

    setFollowLoadingId(eduId);

    try {
      const res = await toggleFollowData(eduId).unwrap();

      setEducatorList((prev) =>
        prev.map((item) =>
          item._id === eduId
            ? {
                ...item,
                isFollowing: res.isFollowing,
                followingCount: res.isFollowing
                  ? (item.followingCount || 0) + 1
                  : Math.max(0, (item.followingCount || 0) - 1),
              }
            : item
        )
      );

      toast.success(
        res.isFollowing
          ? `You are now following ${educator.first_name}`
          : `You unfollowed ${educator.first_name}`
      );
    } catch (err) {
      setEducatorList(previousList);
      toast.error(err?.data?.message || "Failed to update follow status");
    } finally {
      setFollowLoadingId(null);
    }
  };

  useEffect(() => {
    setPage(1);
    // setEducatorList([]);
    refetch();
  }, [activeTab, category, searchText]);

  //   const filteredEducators = useMemo(() => {
  //   if (activeTab === "following") {
  //     return safeArray(educatorList).filter((e) => e.isFollowing === true);
  //   }
  //   return educatorList;
  // }, [activeTab, educatorList]);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="flex items-start justify-between mb-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Educators
          </h2>

          <div className="px-4 py-2 bg-gray-900/50 text-white rounded-xl shadow border border-white/10">
            {totalRecords} Educators
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
          <div className="flex gap-3 sm:gap-6 pb-2 flex-wrap">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <button
                onClick={() => {
                  setActiveTab("all");
                  setPage(1);
                }}
                className={`px-4 h-[40px] flex items-center rounded-lg text-sm font-medium transition-all ${
                  activeTab === "all"
                    ? "bg-[#4F46E5] text-white shadow"
                    : "border border-gray-400 dark:border-gray-600 text-gray-700"
                }`}
              >
                All
              </button>

              <button
                onClick={() => {
                  setActiveTab("following");
                  setPage(1);
                }}
                className={`px-4 h-[40px] flex items-center rounded-lg text-sm font-medium transition-all ${
                  activeTab === "following"
                    ? "bg-[#4F46E5] text-white shadow"
                    : "border border-gray-400 dark:border-gray-600 text-gray-700"
                }`}
              >
                Following
              </button>

              <div className="flex items-center gap-2 relative">
                <Select
                  value={category?._id || ""}
                  onValueChange={(value) => {
                    const selected = categories.find((c) => c._id === value);
                    setCategory(selected || null);
                    setPage(1);
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Category">
                      {category ? category.name : "Select Category"}
                    </SelectValue>
                  </SelectTrigger>

                  <SelectContent>
                    {categories.map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {category && (
                  <button
                    type="button"
                    onClick={() => {
                      setCategory(null);
                      setPage(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    ✖
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-3 sm:gap-6 pb-4 flex-wrap">
            <SearchFilterInput
              searchText={searchText}
              handleSearchChange={handleSearchChange}
              className="mt-[-4px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {(isLoading || (isFetching && page === 1)) &&
            Array.from({ length: 6 }).map((_, i) => (
              <EducatorCardSkeleton key={i} />
            ))}

          {!isLoading &&
            !isFetching &&
            safeArray(educatorList).length === 0 && (
              <div className="col-span-full py-10 text-center text-gray-500 text-lg">
                No educators found
              </div>
            )}

          {safeArray(educatorList).map((n, index) => (
            <div
              key={n._id}
              ref={
                index === educatorList.length - 1 ? lastEducatorRef : undefined
              }
              className="rounded-2xl bg-white dark:bg-[#0F0F1A] shadow-lg border overflow-hidden hover:shadow-xl transition-all"
            >
              <div className="relative h-[200px] bg-gray-300 dark:bg-gray-700 overflow-hidden">
                <img
                  src={
                    n.bannerImage
                      ? n.bannerImage
                      : toAbsoluteUrl("/media/images/2600x1600/live_banner.jpg")
                  }
                  onError={(e) =>
                    (e.currentTarget.src = toAbsoluteUrl(
                      "/media/images/2600x1600/live_banner.jpg"
                    ))
                  }
                  className="w-full h-full object-cover"
                  alt="banner"
                />

                {Array.isArray(n.categories) && n.categories.length > 0 && (
                  <span className="absolute top-3 left-3 bg-blue-600 text-white text-xs px-3 py-1 rounded-lg">
                    {n.categories.map((c) => c?.name).join(", ")}
                  </span>
                )}
              </div>

              <div className="p-5 relative">
                <div className="absolute -top-10 left-5">
                  <img
                    src={
                      n.image
                        ? n.image
                        : toAbsoluteUrl(
                            "/media/images/2600x1600/live_banner.jpg"
                          )
                    }
                    onError={(e) =>
                      (e.currentTarget.src = toAbsoluteUrl(
                        "/media/images/2600x1600/live_banner.jpg"
                      ))
                    }
                    alt="profile"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div className="w-6 h-6 bg-[#4F46E5] text-white rounded-full absolute -bottom-1 right-0 flex items-center justify-center text-xs font-bold shadow">
                    {n.isFollowing ? "✓" : "+"}
                  </div>
                </div>

                <div className="mt-8">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {n.first_name} {n.last_name}
                  </h2>
                  {/* <p className="text-sm text-purple-500 font-medium">
                    Senior Trader
                  </p> */}

                  {/* <p className="text-sm text-gray-600 dark:text-gray-800 mt-2 leading-relaxed">
                    15+ years trading forex markets. Specializing in major
                    currency pairs and risk management.
                  </p> */}

                  <div className="flex justify-between text-gray-700 dark:text-gray-300 mt-6">
                    {/* <div className="text-center">
                      <p className="font-semibold dark:text-gray-800">
                        {n.followingCount || 0}
                      </p>
                      <p className="text-xs dark:text-gray-700">Followers</p>
                    </div> */}
                    {/* <div className="text-center">
                      <p className="font-semibold dark:text-gray-800">⭐ 4.9</p>
                      <p className="text-xs dark:text-gray-700">Rating</p>
                    </div> */}
                    <div className="text-center">
                      <p className="font-semibold dark:text-gray-800">
                        {n?.courseCount || 0}
                      </p>
                      <p className="text-xs dark:text-gray-700">Courses</p>
                    </div>

                    <div className="text-center">
                      <p className="font-semibold dark:text-gray-800">
                        {n?.ideaCount || 0}
                      </p>
                      <p className="text-xs dark:text-gray-700">Trade ideas</p>
                    </div>

                    <div className="text-center">
                      <p className="font-semibold dark:text-gray-800">
                        {n?.insightCount || 0}
                      </p>
                      <p className="text-xs dark:text-gray-700">Insights</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-6">
                    <button
                      onClick={() => handleToggle(n)}
                      disabled={followLoadingId === n._id}
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all w-full ${
                        n.isFollowing
                          ? "bg-[#4F46E5] text-white border border-[#4F46E5]"
                          : "bg-[#4F46E5]/10 text-[#4F46E5] border border-[#4F46E5] dark:text-gray-900"
                      } ${
                        followLoadingId === n._id
                          ? "opacity-60 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {followLoadingId === n._id ? (
                        <Loader2 className="animate-spin" size={18} />
                      ) : n.isFollowing ? (
                        <>
                          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-white text-[#4F46E5] text-xs">
                            ✓
                          </span>
                          Following
                        </>
                      ) : (
                        <>
                          <span className="flex items-center justify-center w-4 h-4 rounded-full bg-[#4F46E5] text-white text-xs">
                            +
                          </span>
                          Follow
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => navigate(`/iq-educators/${n._id}`)}
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border bg-transparent text-gray-800 dark:text-gray-900 border-gray-400 w-full"
                    >
                      <svg
                        width="18"
                        height="18"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        className="text-gray-600 dark:text-gray-900"
                      >
                        <path
                          d="M12 5c-7.633 0-11 7-11 7s3.367 7 11 7 11-7 11-7-3.367-7-11-7zm0 12c-2.761 0-5-2.239-5-5s2.239-5 5-5 
                        5 2.239 5 5-2.239 5-5 5zm0-8c-1.657 0-3 1.343-3 3s1.343 3 3 3 
                        3-1.343 3-3-1.343-3-3-3z"
                        />
                      </svg>
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {isFetching && page > 1 && (
          <div className="text-center py-6 text-gray-500">Loading more...</div>
        )}
      </div>

      {/* {page >= totalPages && educatorList.length > 0 && (
        <p className="text-center text-gray-500 my-8">No more educators.</p>
      )} */}
    </div>
  );
};

export default IqAcademyEducators;

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
import { Loader2, BookOpen, ArrowRight } from "lucide-react";
import {
  useGetClientEducatorAcademyCategoryQuery,
  useGetEducatorsListQuery,
  useToggleFollowMutation,
} from "../../../store/api/client/clientEductorApiSlice";
import { useNavigate, useLocation } from "react-router";
import { toast } from "sonner";
import SearchFilterInput from "../../../components/SearchFilterInput";
import { toAbsoluteUrl } from "@/utils/Assets";
import { useAuthContext } from "@/auth";
import { useTourStep } from "@/hooks/useTourStep";

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
  const location = useLocation();
  const { auth } = useAuthContext();

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
  }, [activeTab, category, searchText]);

  useTourStep({
    shouldStart: location?.state?.continueTour === true,
    isReady: !isLoading && !isFetching && educatorList.length > 0,
    getSteps: () => {
      const steps = [];
      const heading = document.querySelector('.educators-heading');
      if (heading) steps.push({ element: heading, title: '🎓 Educators', intro: 'Meet the professional traders and educators on the platform. Browse their profiles, follow the ones you like, and access their courses and sessions.', position: 'bottom' });
      const tabFilters = document.querySelector('.educators-tab-filters');
      if (tabFilters) steps.push({ element: tabFilters, title: '🔍 Filter & Browse', intro: 'Use the <strong>All / Following</strong> tabs to switch views, and the category dropdown to filter educators by subject (Forex, Crypto, Digital Marketing, etc.).', position: 'bottom' });
      const searchBox = document.querySelector('.educators-search');
      if (searchBox) steps.push({ element: searchBox, title: '🔎 Search Educators', intro: "Type an educator's name to find them instantly. Results update as you type.", position: 'bottom' });
      const firstCard = document.querySelector('.educator-card-first');
      if (firstCard) steps.push({ element: firstCard, title: '👤 Educator Card', intro: "Each card displays the educator's name, specialisation, bio, and key stats like the number of courses and trade ideas they've published.", position: 'bottom' });
      const actionButtons = document.querySelector('.educator-action-buttons');
      if (actionButtons) steps.push({ element: actionButtons, title: '👍 Follow or View Profile', intro: 'Click <strong>Follow</strong> to subscribe and get updates from this educator. Click <strong>View Profile</strong> to explore all their content and sessions.', position: 'top' });
      const masterclassBtn = document.querySelector('.educator-masterclass-btn');
      if (masterclassBtn) steps.push({ element: masterclassBtn, title: '🎯 Go to MasterClass', intro: "Click this to jump directly into this educator's MasterClass and start learning their courses.", position: 'top' });
      return steps;
    },
    onDone: () => navigate('/ideas', { state: { continueTour: true } }),
    delay: 800,
  });

  const getMasterClassButtonStyle = (categories) => {
    const firstCategory = categories?.[0];
    const categoryName = firstCategory?.name?.toLowerCase() || "";

    if (categoryName.includes("crypto")) {
      return "bg-[#7C3AED]/20 hover:bg-[#7C3AED]/30 border-[#7C3AED]/50 hover:shadow-[#7C3AED]/30";
    } else if (
      categoryName.includes("digital marketing") ||
      categoryName.includes("digitalmarketing")
    ) {
      return "bg-[#38BDF8]/20 hover:bg-[#38BDF8]/30 border-[#38BDF8]/50 hover:shadow-[#38BDF8]/30";
    } else if (
      categoryName.includes("e-commerce") ||
      categoryName.includes("ecommerce") ||
      categoryName.includes("e commerce")
    ) {
      return "bg-[#10B981]/20 hover:bg-[#10B981]/30 border-[#10B981]/50 hover:shadow-[#10B981]/30";
    } else {
      return "bg-[#2B44D3]/20 hover:bg-[#2B44D3]/30 border-[#2B44D3]/50 hover:shadow-[#2B44D3]/30";
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="flex items-start justify-between mb-10">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white educators-heading">
            Educators
          </h2>

          <div className="px-4 py-2 bg-gray-900/50 dark:text-white text-gray-900 rounded-xl shadow border border-white/10">
            {totalRecords} Educators
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
          <div className="flex gap-3 sm:gap-6 pb-2 flex-wrap">
            <div className="flex flex-wrap items-center gap-3 mb-2 educators-tab-filters">
              <button
                onClick={() => {
                  setActiveTab("all");
                  setPage(1);
                }}
                className={`px-4 h-[40px] flex items-center rounded-lg text-sm font-medium transition-all ${activeTab === "all"
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
                className={`px-4 h-[40px] flex items-center rounded-lg text-sm font-medium transition-all ${activeTab === "following"
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

          <div className="flex gap-3 sm:gap-6 pb-4 flex-wrap educators-search">
            <SearchFilterInput
              searchText={searchText}
              handleSearchChange={handleSearchChange}
              className="mt-[-4px]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {(isLoading || (isFetching && page === 1)) &&
            Array.from({ length: 9 }).map((_, i) => (
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
              className={`rounded-2xl bg-white dark:bg-[#0F0F1A] shadow-lg border overflow-hidden hover:shadow-xl transition-all ${index === 0 ? 'educator-card-first' : ''}`}
            >
              <div className="relative h-[170px] bg-gray-300 dark:bg-gray-700 overflow-hidden">
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

                <div className="mt-6">
                  <h2
                    className="text-lg font-semibold text-gray-900 truncate"
                    title={`${n.first_name} ${n.last_name}`}
                  >
                    {n.first_name} {n.last_name}
                  </h2>

                  <p className="text-[14px] text-[#5b1deb] dark:text-[#8B5CF6] leading-relaxed line-clamp-1 h-[18px] overflow-hidden">
                    {n?.educatorRole ? n?.educatorRole : ""}
                  </p>

                  <p className="text-[12px] text-gray-800 dark:text-gray-700 mt-2 leading-relaxed  h-16 overflow-hidden">
                    {n?.bio ? n?.bio : ""}
                  </p>

                  <div className="flex justify-between text-gray-700 dark:text-gray-300 mt-">
                    <div className="text-center">
                      <p className="font-semibold dark:text-gray-800 text-gray-700">
                        {n?.courseCount || 0}
                      </p>
                      <p className="text-xs dark:text-gray-700 text-gray-700">Courses</p>
                    </div>

                    <div className="text-center">
                      <p className="font-semibold dark:text-gray-700 text-gray-700">
                        {n?.ideaCount || 0}
                      </p>
                      <p className="text-xs dark:text-gray-700 text-gray-700">Trade ideas</p>
                    </div>

                    <div className="text-center">
                      <p className="font-semibold dark:text-gray-800 text-gray-700">
                        {n?.insightCount || 0}
                      </p>
                      <p className="text-xs dark:text-gray-700 text-gray-700">Insights</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-6 educator-action-buttons">
                    <button
                      onClick={() => handleToggle(n)}
                      disabled={followLoadingId === n._id}
                      className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all w-full ${n.isFollowing
                        ? "bg-[#4F46E5] text-white border border-[#4F46E5]"
                        : "bg-[#4F46E5]/10 text-[#4F46E5] border border-[#4F46E5] dark:text-gray-900"
                        } ${followLoadingId === n._id
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

                  <button
                    onClick={() => navigate(`/master-class/${n?._id}`)}
                    className={`group relative inline-flex items-center justify-center gap-2 px-6 py-2.5 mt-3 w-full ${getMasterClassButtonStyle(
                      n?.categories
                    )} text-gray-800 dark:text-white border rounded-full text-sm font-medium overflow-hidden educator-masterclass-btn`}
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <BookOpen
                      size={18}
                      className="text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform duration-300"
                    />
                    <span className="relative">Go to My MasterClass</span>
                    <ArrowRight
                      size={16}
                      className="text-gray-600 dark:text-white/70 group-hover:text-gray-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all duration-300"
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {isFetching && page > 1 && (
          <div className="text-center py-6 text-gray-500">Loading more...</div>
        )}
      </div>

    </div>
  );
};

export default IqAcademyEducators;

import React, { useEffect, useMemo, useRef, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useGetEducatorPostsQuery } from "../../../store/api/client/clientSocialApiSlilce";
import {
  useGetEducatorIdeasQuery,
  useGetEducatorInsightsQuery,
  useGetLiveTradeIdeaQuery,
} from "../../../store/api/client/clientTradeIdeasApiSlice";

const PAGE_SIZE = 10;

// Tab definitions — order controls default render order of the tab row.
const TABS = [
  { key: "posts", label: "Posts" },
  { key: "ideas", label: "Ideas" },
  { key: "insights", label: "Insights" },
  { key: "liveIdeas", label: "Live ideas" },
];

const TYPE_LABELS = {
  posts: "Post",
  ideas: "Idea",
  insights: "Insight",
  liveIdeas: "Live Idea",
};

// Same relative-time convention already used elsewhere in IqEducators.jsx for Live Ideas
// (kept local here since that helper isn't exported from the parent file).
const getRelativeTime = (date) => {
  if (!date) return "";

  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now - past) / 1000);

  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (diffInSeconds < 60) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  if (hours < 24) return `${hours} hr ago`;
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

// Same HTML-stripping convention already used for the bio in IqEducators.jsx.
const stripHtml = (html) => (html ? html.replace(/<[^>]+>/g, " ").trim() : "");

const EducatorFeed = ({
  educatorId,
  educatorName,
  educatorAvatar,
  headerGradient,
}) => {
  // "posts" doubles as the combined/all-content view (the default); selecting
  // any other tab exclusively filters the feed down to just that content type.
  const [selectedTab, setSelectedTab] = useState("posts");

  // Every tab fetches its own data from its own real, paginated backend API — 10 items
  // initially, 10 more each time the user scrolls to the bottom of that tab, independent
  // of the other tabs. Each tab gets its own { page, items } pair below (posts already
  // worked this way; ideas/insights/liveIdeas are now built to match it exactly).
  const [postsPage, setPostsPage] = useState(1);
  const [allPosts, setAllPosts] = useState([]);

  const [ideasPage, setIdeasPage] = useState(1);
  const [allIdeas, setAllIdeas] = useState([]);

  const [insightsPage, setInsightsPage] = useState(1);
  const [allInsights, setAllInsights] = useState([]);

  const [liveIdeasPage, setLiveIdeasPage] = useState(1);
  const [allLiveIdeas, setAllLiveIdeas] = useState([]);

  // All 4 hooks are called unconditionally (hooks can't be conditional) with skip tied only
  // to educatorId — this eagerly fetches every tab's FIRST page in the background so
  // switching tabs feels instant, but page only ever advances past 1 for whichever tab is
  // currently selected and has been scrolled to its bottom (see loadMore below).
  const { data: postsResponse, isFetching: isFetchingPosts } =
    useGetEducatorPostsQuery(
      { educatorId, page: postsPage, limit: PAGE_SIZE },
      { skip: !educatorId }
    );

  const { data: ideasResponse, isFetching: isFetchingIdeas } =
    useGetEducatorIdeasQuery(
      { educatorId, page: ideasPage, limit: PAGE_SIZE },
      { skip: !educatorId }
    );

  const { data: insightsResponse, isFetching: isFetchingInsights } =
    useGetEducatorInsightsQuery(
      { educatorId, page: insightsPage, limit: PAGE_SIZE },
      { skip: !educatorId }
    );

  // Reuses the existing live-idea-by-educator hook/endpoint as-is (already used elsewhere
  // in IqEducators.jsx) — note its response has no hasNext/hasPrev, only
  // currentPage/totalPages, so "hasMore" is derived below.
  const { data: liveIdeasResponse, isFetching: isFetchingLiveIdeas } =
    useGetLiveTradeIdeaQuery(
      { id: educatorId, page: liveIdeasPage, limit: PAGE_SIZE },
      { skip: !educatorId }
    );

  // Append each newly-fetched page, de-duping by _id in case of any overlap.
  useEffect(() => {
    if (!postsResponse?.posts) return;
    setAllPosts((prev) => {
      const seen = new Set(prev.map((p) => p._id));
      const fresh = postsResponse.posts.filter((p) => !seen.has(p._id));
      return fresh.length ? [...prev, ...fresh] : prev;
    });
  }, [postsResponse]);

  useEffect(() => {
    if (!ideasResponse?.ideas) return;
    setAllIdeas((prev) => {
      const seen = new Set(prev.map((p) => p._id));
      const fresh = ideasResponse.ideas.filter((p) => !seen.has(p._id));
      return fresh.length ? [...prev, ...fresh] : prev;
    });
  }, [ideasResponse]);

  useEffect(() => {
    if (!insightsResponse?.insights) return;
    setAllInsights((prev) => {
      const seen = new Set(prev.map((p) => p._id));
      const fresh = insightsResponse.insights.filter((p) => !seen.has(p._id));
      return fresh.length ? [...prev, ...fresh] : prev;
    });
  }, [insightsResponse]);

  useEffect(() => {
    if (!liveIdeasResponse?.data) return;
    setAllLiveIdeas((prev) => {
      const seen = new Set(prev.map((p) => p._id));
      const fresh = liveIdeasResponse.data.filter((p) => !seen.has(p._id));
      return fresh.length ? [...prev, ...fresh] : prev;
    });
  }, [liveIdeasResponse]);

  const hasMorePosts = postsResponse?.pagination?.hasNext ?? false;
  const hasMoreIdeas = ideasResponse?.pagination?.hasNext ?? false;
  const hasMoreInsights = insightsResponse?.pagination?.hasNext ?? false;
  // liveIdeasResponse's pagination has no hasNext field — derive it from currentPage/totalPages.
  const hasMoreLiveIdeas = liveIdeasResponse?.pagination
    ? liveIdeasResponse.pagination.currentPage <
      liveIdeasResponse.pagination.totalPages
    : false;

  // Per-tab pagination state, keyed identically to `selectedTab` / TABS[].key, so the
  // scroll/load-more handlers below can stay generic instead of branching per tab.
  const tabState = {
    posts: {
      page: postsPage,
      setPage: setPostsPage,
      hasNext: hasMorePosts,
      isFetching: isFetchingPosts,
    },
    ideas: {
      page: ideasPage,
      setPage: setIdeasPage,
      hasNext: hasMoreIdeas,
      isFetching: isFetchingIdeas,
    },
    insights: {
      page: insightsPage,
      setPage: setInsightsPage,
      hasNext: hasMoreInsights,
      isFetching: isFetchingInsights,
    },
    liveIdeas: {
      page: liveIdeasPage,
      setPage: setLiveIdeasPage,
      hasNext: hasMoreLiveIdeas,
      isFetching: isFetchingLiveIdeas,
    },
  };

  const feedScrollRef = useRef(null);
  const selectTab = (key) => {
    setSelectedTab(key);
    if (feedScrollRef.current) feedScrollRef.current.scrollTop = 0;
  };

  // Normalize each source type into a single common card shape.
  const normalized = useMemo(() => {
    const posts = allPosts.map((p) => ({
      id: `posts-${p._id}`,
      type: "posts",
      avatar: p?.author?.image,
      name: [p?.author?.first_name, p?.author?.last_name]
        .filter(Boolean)
        .join(" ") || "Educator",
      createdAt: p?.createdAt,
      text: stripHtml(p?.content),
      image: p?.tradingViewImages?.[0]?.url || p?.images?.[0]?.url || null,
    }));

    const ideasList = allIdeas.map((it) => ({
      id: `ideas-${it._id}`,
      type: "ideas",
      avatar: it?.educatorId?.image || educatorAvatar,
      name:
        [it?.educatorId?.first_name, it?.educatorId?.last_name]
          .filter(Boolean)
          .join(" ") ||
        educatorName ||
        "Educator",
      createdAt: it?.createdAt,
      text: it?.name,
      image: it?.image?.[0] || null,
    }));

    const insightsList = allInsights.map((it) => ({
      id: `insights-${it._id}`,
      type: "insights",
      avatar: it?.createdBy?.image || educatorAvatar,
      name:
        [it?.createdBy?.first_name, it?.createdBy?.last_name]
          .filter(Boolean)
          .join(" ") ||
        educatorName ||
        "Educator",
      createdAt: it?.createdAt,
      text: it?.title,
      image: it?.photos?.[0] || null,
    }));

    const liveIdeasList = allLiveIdeas.map((it) => ({
      id: `liveIdeas-${it._id}`,
      type: "liveIdeas",
      avatar: it?.educatorId?.image || educatorAvatar,
      name:
        [it?.educatorId?.first_name, it?.educatorId?.last_name]
          .filter(Boolean)
          .join(" ") ||
        educatorName ||
        "Educator",
      createdAt: it?.createdAt,
      text: it?.name,
      image: it?.image?.[0] || null,
      tradeType: it?.type, // "buy" | "sell"
    }));

    return { posts, ideas: ideasList, insights: insightsList, liveIdeas: liveIdeasList };
  }, [allPosts, allIdeas, allInsights, allLiveIdeas, educatorAvatar, educatorName]);

  // Full sorted list for the active tab — this is everything currently loaded into memory
  // for that tab (or, for "posts", everything loaded across all 4 tabs merged). Unlike the
  // old prop-driven version, there's no separate "loaded but not yet revealed" slice anymore:
  // each tab only ever holds exactly what's been fetched from its own paginated endpoint,
  // so what's loaded is what's shown.
  const fullFeed = useMemo(() => {
    const merged =
      selectedTab === "posts"
        ? [
          ...normalized.posts,
          ...normalized.ideas,
          ...normalized.insights,
          ...normalized.liveIdeas,
        ]
        : normalized[selectedTab] || [];
    return merged.sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
  }, [normalized, selectedTab]);

  // All 4 tabs' first pages load eagerly in the background (so switching tabs feels
  // instant), but that means the merged "posts" pool already has up to 40 items in memory
  // after the very first fetch (10 per type). The combined view must still only ever
  // *display* 10 initially, growing by 10 per scroll — so it gets its own display cap,
  // independent of how much raw data happens to already be sitting in memory. The other
  // 3 tabs don't need this: what's fetched from their own single-source API IS what's shown.
  const [postsVisibleCount, setPostsVisibleCount] = useState(PAGE_SIZE);
  const combinedFeed =
    selectedTab === "posts" ? fullFeed.slice(0, postsVisibleCount) : fullFeed;

  const activeTabState = tabState[selectedTab];
  const canLoadMore =
    selectedTab === "posts"
      ? fullFeed.length > postsVisibleCount || hasMorePosts
      : activeTabState?.hasNext ?? false;
  const isFetchingMore =
    !!activeTabState?.isFetching && activeTabState.page > 1;

  const loadMoreTriggeredRef = useRef(false);
  const loadMore = () => {
    if (loadMoreTriggeredRef.current || !canLoadMore) return;
    loadMoreTriggeredRef.current = true;

    if (selectedTab === "posts") {
      const nextCount = postsVisibleCount + PAGE_SIZE;
      setPostsVisibleCount(nextCount);
      // Only fetch another page of posts if revealing the next batch would run past
      // what's currently loaded across all 4 sources combined.
      if (fullFeed.length < nextCount && hasMorePosts && !isFetchingPosts) {
        setPostsPage((p) => p + 1);
      }
      return;
    }

    const state = tabState[selectedTab];
    if (!state || !state.hasNext || state.isFetching) return;
    state.setPage((p) => p + 1);
  };

  useEffect(() => {
    loadMoreTriggeredRef.current = false;
  }, [selectedTab, allPosts, allIdeas, allInsights, allLiveIdeas, postsVisibleCount]);

  const handleScroll = (e) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 80;
    if (nearBottom) loadMore();
  };

  // Combined "posts" tab is loading if nothing's rendered yet and any of its 4 underlying
  // sources is still fetching its first page; every other tab just watches its own source.
  const isLoading =
    fullFeed.length === 0 &&
    (selectedTab === "posts"
      ? (isFetchingPosts && postsPage === 1) ||
      (isFetchingIdeas && ideasPage === 1) ||
      (isFetchingInsights && insightsPage === 1) ||
      (isFetchingLiveIdeas && liveIdeasPage === 1)
      : !!activeTabState?.isFetching && activeTabState.page === 1);

  return (
    <div className="rounded-2xl shadow-md overflow-hidden h-full flex flex-col bg-[#151320]">
      {/* Title */}
      <div className="pt-3 pb-2 px-4 select-none flex-shrink-0">
        <h3 className="text-white font-bold text-sm sm:text-base text-center">
          Educator feed
        </h3>
      </div>

      {/* Tabs — "Posts" is the combined/all view; the others exclusively filter to one type */}
      <div
        className={`relative flex items-center h-9 px-3 flex-shrink-0 ${headerGradient || "bg-gradient-to-r from-[#2B44D3] to-[#0D0D21]"
          }`}
      >
        <div className="flex-1 flex items-center justify-center gap-2">
          {TABS.map((tab, i) => {
            const isActive = selectedTab === tab.key;
            return (
              <React.Fragment key={tab.key}>
                {i > 0 && <span className="text-white/25 select-none text-xs leading-none">|</span>}
                <button
                  type="button"
                  onClick={() => selectTab(tab.key)}
                  aria-pressed={isActive}
                  className={`select-none inline-flex items-center justify-center h-7 px-2 text-[11px] sm:text-xs leading-none whitespace-nowrap border-b-2 outline-none focus-visible:ring-2 focus-visible:ring-white/60 rounded-sm transition-colors ${isActive
                    ? "font-bold text-white border-amber-400"
                    : "font-medium text-white/50 hover:text-white/80 border-transparent"
                    }`}
                >
                  {tab.label}
                </button>
              </React.Fragment>
            );
          })}
        </div>
        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
      </div>

      {/* Feed: combined when "Posts" is selected, filtered to one type otherwise.
          min-h-0 is required here — without it a flex child with overflow-y-auto
          won't actually clip/scroll, it'll just keep growing with its content. */}
      <div
        ref={feedScrollRef}
        className="flex-1 min-h-0 p-3 overflow-y-auto space-y-3"
        onScroll={handleScroll}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[150px]">
            <span className="text-xs text-white/50">Loading feed...</span>
          </div>
        ) : combinedFeed.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full min-h-[150px]">
            <span className="text-xs text-white/50 text-center">
              🚀 No updates available right now. Stay tuned for fresh content!
            </span>
          </div>
        ) : (
          combinedFeed.map((item) => (
            <div key={item.id} className="bg-white/[0.05] border border-white/[0.06] rounded-xl p-3">
              {/* Avatar */}
              {item.avatar ? (
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-8 h-8 rounded-full object-cover mb-1.5"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-1.5" />
              )}

              {/* Name */}
              <p className="text-white font-semibold text-xs">{item.name}</p>

              {/* Timestamp */}
              <div
                className="text-[11px] text-white/40 mb-1.5"
                title={item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
              >
                {getRelativeTime(item.createdAt)}
                {item.type === "liveIdeas" && item.tradeType && (
                  <span className="inline-flex items-center ml-1.5 align-middle">
                    {item.tradeType === "buy" ? (
                      <TrendingUp size={10} className="text-emerald-400" />
                    ) : (
                      <TrendingDown size={10} className="text-red-400" />
                    )}
                  </span>
                )}
              </div>

              {/* Text/content line */}
              {item.text && (
                <p className="text-white/90 text-xs leading-relaxed whitespace-pre-wrap break-words mb-2">
                  {item.text}
                </p>
              )}

              {/* Chart/image */}
              <div className="rounded-lg overflow-hidden bg-black min-h-[100px] flex items-center justify-center border border-white/[0.06]">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.text || TYPE_LABELS[item.type]}
                    className="w-full max-h-40 object-cover"
                  />
                ) : (
                  <span className="text-white/25 text-xs">chart image</span>
                )}
              </div>
            </div>
          ))
        )}

        {!isLoading && combinedFeed.length > 0 && (isFetchingMore || canLoadMore) && (
          <div className="flex items-center justify-center py-2">
            {isFetchingMore ? (
              <span className="text-[11px] text-white/40">Loading more...</span>
            ) : (
              <button
                type="button"
                onClick={loadMore}
                className="text-[11px] text-white/40 hover:text-white/70 transition-colors"
              >
                Load more
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EducatorFeed;

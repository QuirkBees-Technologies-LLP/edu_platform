import React, { useEffect, useMemo, useRef, useState } from "react";
import { useGetEducatorPostsQuery } from "../../../store/api/client/clientSocialApiSlilce";
import {
  useGetEducatorIdeasQuery,
  useGetEducatorInsightsQuery,
  useGetLiveTradeIdeaQuery,
} from "../../../store/api/client/clientTradeIdeasApiSlice";
import SocialPostCard from "../iq-social/SocialPostCard";
import IdeaFeedCard from "./IdeaFeedCard";
import InsightFeedCard from "./InsightFeedCard";
import LiveIdeaFeedCard from "./LiveIdeaFeedCard";

const PAGE_SIZE = 10;

// Tab definitions — order controls default render order of the tab row.
const TABS = [
  { key: "posts", label: "Posts" },
  { key: "ideas", label: "Ideas" },
  { key: "insights", label: "Insights" },
  { key: "liveIdeas", label: "Live ideas" },
];
const ALL_TYPES = TABS.map((t) => t.key);

const EducatorFeed = ({ educatorId, headerGradient, className = "" }) => {
  // Genuine multi-select: nothing selected (the default) shows every content type merged
  // together; selecting one or more narrows the feed to just those types.
  const [selectedTypes, setSelectedTypes] = useState([]);

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

  // Merge each newly-fetched page into local state: update any item already loaded
  // (e.g. edited since it was first fetched) with its fresh copy, in place, and append
  // genuinely new ones. A plain "skip if already present" filter was silently keeping
  // stale data forever — a refetch would fetch fresh data into postsResponse/
  // ideasResponse/etc, but every already-seen item would just get discarded here
  // instead of updating the matching item already in local state.
  useEffect(() => {
    if (!postsResponse?.posts) return;
    setAllPosts((prev) => {
      const merged = new Map(prev.map((p) => [p._id, p]));
      postsResponse.posts.forEach((p) => merged.set(p._id, p));
      return Array.from(merged.values());
    });
  }, [postsResponse]);

  useEffect(() => {
    if (!ideasResponse?.ideas) return;
    setAllIdeas((prev) => {
      const merged = new Map(prev.map((p) => [p._id, p]));
      ideasResponse.ideas.forEach((p) => merged.set(p._id, p));
      return Array.from(merged.values());
    });
  }, [ideasResponse]);

  useEffect(() => {
    if (!insightsResponse?.insights) return;
    setAllInsights((prev) => {
      const merged = new Map(prev.map((p) => [p._id, p]));
      insightsResponse.insights.forEach((p) => merged.set(p._id, p));
      return Array.from(merged.values());
    });
  }, [insightsResponse]);

  useEffect(() => {
    if (!liveIdeasResponse?.data) return;
    setAllLiveIdeas((prev) => {
      const merged = new Map(prev.map((p) => [p._id, p]));
      liveIdeasResponse.data.forEach((p) => merged.set(p._id, p));
      return Array.from(merged.values());
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

  // Per-tab pagination state, keyed identically to TABS[].key, so the
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
  const toggleType = (key) => {
    setSelectedTypes((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
    if (feedScrollRef.current) feedScrollRef.current.scrollTop = 0;
  };
  const clearTypes = () => {
    setSelectedTypes([]);
    if (feedScrollRef.current) feedScrollRef.current.scrollTop = 0;
  };

  // No normalization — each source's raw API documents are kept exactly as returned
  // (original fields, original structure). Combining is just deciding WHICH raw items
  // are in play and in WHAT order; each one still carries its own real shape through to
  // render, where it's handed to its own real card component (SocialPostCard, IdeaFeedCard,
  // InsightFeedCard, LiveIdeaFeedCard) — never a shared/generic one.
  const rawListsByType = {
    posts: allPosts,
    ideas: allIdeas,
    insights: allInsights,
    liveIdeas: allLiveIdeas,
  };

  const activeTypes = selectedTypes.length ? selectedTypes : ALL_TYPES;
  const isSingle = activeTypes.length === 1;
  const activeTypesKey = activeTypes.join(",");

  // Full sorted list for the active selection — a thin {type, raw} wrapper per item, used
  // only so the list knows which real card component to render each entry with. `raw` is
  // the literal, untouched document from that type's own API response.
  const fullFeed = useMemo(() => {
    const merged = activeTypes.flatMap((t) =>
      (rawListsByType[t] || []).map((raw) => ({
        id: `${t}-${raw._id}`,
        type: t,
        raw,
      }))
    );
    return merged.sort(
      (a, b) => new Date(b.raw?.createdAt || 0) - new Date(a.raw?.createdAt || 0)
    );
  }, [allPosts, allIdeas, allInsights, allLiveIdeas, activeTypesKey]);

  // All 4 types' first pages load eagerly in the background (so toggling filters feels
  // instant), but that means the merged pool can already hold up to 40 items in memory
  // after the very first fetch (10 per type). When more than one type is active (including
  // the default "nothing selected" combined view), the display must still only ever *show*
  // 10 initially, growing by 10 per scroll — so it gets its own display window, independent
  // of how much raw data happens to already be sitting in memory. A single selected type
  // doesn't need this: what's fetched from its own single-source API IS what's shown.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeTypesKey]);

  const combinedFeed = isSingle ? fullFeed : fullFeed.slice(0, visibleCount);

  const activeTabState = tabState[activeTypes[0]];
  const canLoadMore = isSingle
    ? activeTabState?.hasNext ?? false
    : fullFeed.length > visibleCount || activeTypes.some((t) => tabState[t].hasNext);
  const isFetchingMore = isSingle
    ? !!activeTabState?.isFetching && activeTabState.page > 1
    : activeTypes.some((t) => tabState[t].isFetching && tabState[t].page > 1);

  const loadMoreTriggeredRef = useRef(false);
  const loadMore = () => {
    if (loadMoreTriggeredRef.current || !canLoadMore) return;
    loadMoreTriggeredRef.current = true;

    if (isSingle) {
      const state = tabState[activeTypes[0]];
      if (!state || !state.hasNext || state.isFetching) return;
      state.setPage((p) => p + 1);
      return;
    }

    const nextCount = visibleCount + PAGE_SIZE;
    setVisibleCount(nextCount);
    // Only fetch more from a type if revealing the next batch would run past what's
    // currently loaded for it.
    if (fullFeed.length < nextCount) {
      activeTypes.forEach((t) => {
        const state = tabState[t];
        if (state.hasNext && !state.isFetching) state.setPage((p) => p + 1);
      });
    }
  };

  useEffect(() => {
    loadMoreTriggeredRef.current = false;
  }, [activeTypesKey, allPosts, allIdeas, allInsights, allLiveIdeas, visibleCount]);

  const handleScroll = (e) => {
    const el = e.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 80;
    if (nearBottom) loadMore();
  };

  // Loading if nothing's rendered yet and any of the currently-active types is still
  // fetching its first page.
  const isLoading =
    fullFeed.length === 0 &&
    activeTypes.some((t) => tabState[t].isFetching && tabState[t].page === 1);

  return (
    <div className={`rounded-2xl shadow-md overflow-hidden h-full flex flex-col bg-[#151320] ${className}`}>
      {/* Title */}
      <div className="pt-3 pb-2 px-4 select-none flex-shrink-0">
        <h3 className="text-white font-bold text-sm sm:text-base text-center">
          Educator feed
        </h3>
      </div>

      {/* Tabs — genuine multi-select: nothing selected shows everything combined; selecting
          one or more narrows the feed down to just those types. */}
      <div
        className={`relative flex items-center h-9 px-3 flex-shrink-0 ${headerGradient || "bg-gradient-to-r from-[#2B44D3] to-[#0D0D21]"
          }`}
      >
        <div className="flex-1 flex items-center justify-center gap-2">
          {TABS.map((tab, i) => {
            const isActive = selectedTypes.includes(tab.key);
            return (
              <React.Fragment key={tab.key}>
                {i > 0 && <span className="text-white/25 select-none text-xs leading-none">|</span>}
                <button
                  type="button"
                  onClick={() => toggleType(tab.key)}
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
          {selectedTypes.length > 0 && (
            <>
              <span className="text-white/25 select-none text-xs leading-none">|</span>
              <button
                type="button"
                onClick={clearTypes}
                className="select-none inline-flex items-center justify-center h-7 px-2 text-[11px] sm:text-xs leading-none whitespace-nowrap text-white/60 hover:text-white transition-colors"
              >
                Clear
              </button>
            </>
          )}
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
          combinedFeed.map((entry) => {
            switch (entry.type) {
              case "posts":
                return (
                  <SocialPostCard
                    key={entry.id}
                    post={entry.raw}
                    showTypeBadge
                    showAuthorName={false}
                  />
                );
              case "ideas":
                return <IdeaFeedCard key={entry.id} idea={entry.raw} />;
              case "insights":
                return <InsightFeedCard key={entry.id} insight={entry.raw} />;
              case "liveIdeas":
                return <LiveIdeaFeedCard key={entry.id} liveIdea={entry.raw} />;
              default:
                return null;
            }
          })
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

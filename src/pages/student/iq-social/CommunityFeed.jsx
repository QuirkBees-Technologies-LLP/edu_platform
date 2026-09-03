import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useTourStep } from "@/hooks/useTourStep";
import InfiniteScroll from "react-infinite-scroll-component";
import { usePostQuery } from "../../../store/api/client/clientSocialApiSlilce";
import {
  useGetClientTradeIdeasQuery,
  useGetClientTradeAnalysisQuery,
  useGetClientLiveIdeasQuery,
} from "../../../store/api/client/clientTradeIdeasApiSlice";
import SocialPostCard from "./SocialPostCard";
import SocialIdeaCard from "./SocialIdeaCard";
import SocialInsightCard from "./SocialInsightCard";
import SocialLiveIdeaCard from "./SocialLiveIdeaCard";
import SocialSideBanner from "./SocialSideBanner";
import { Rss } from "lucide-react";
import {
  ToolbarHeading,
  ToolbarPageTitle,
  ToolbarDescription,
} from "@/partials/toolbar";

const PAGE_SIZE = 10;

// Tabs — same selection model as the Educator Feed: nothing selected (the default) shows
// every content type merged together; selecting one or more narrows the feed down to just
// those types.
const FILTERS = [
  { key: "posts", label: "Posts" },
  { key: "ideas", label: "Ideas" },
  { key: "insights", label: "Insights" },
  { key: "liveIdeas", label: "Live Ideas" },
];
const ALL_TYPES = FILTERS.map((f) => f.key);

// Task 2.2 — left/right rail banners. Marketing hasn't delivered assets yet, so these
// stay null and SocialSideBanner renders nothing; drop the real URLs in here once
// they're available and it'll switch over automatically, reserved column and all.
const LEFT_BANNER_IMAGE = null;
const RIGHT_BANNER_IMAGE = null;
const HAS_SIDE_BANNERS = !!(LEFT_BANNER_IMAGE || RIGHT_BANNER_IMAGE);

const CommunityFeed = () => {
  // Genuine multi-select (task 2.6): nothing selected (the default) shows every content
  // type merged together; selecting one or more narrows the feed to just those types.
  const [selectedTypes, setSelectedTypes] = useState([]);
  const location = useLocation();

  // The side banners stick below this bar, but its height isn't a fixed constant (it can
  // wrap taller on narrower widths) — so its real rendered height is measured and handed
  // to SocialSideBanner as its sticky offset, instead of guessing a fixed pixel value that
  // would drift out of sync and let the banner stick too early, underneath this bar.
  const toolbarRef = useRef(null);
  const [toolbarHeight, setToolbarHeight] = useState(64);

  // This bar's natural (unstuck) resting position sits below its sticky "top" offset,
  // because <main> (shared by every page) adds its own padding above it. A hand-calculated
  // negative margin to cancel that out is fragile — if the real rendered gap is even a few
  // px off from the assumption, it overshoots and pulls the bar up into the fixed app
  // header above it. So instead this measures the ACTUAL gap directly off the live DOM
  // (rect.top vs the real --tw-header-height value) on mount, while the page is still at
  // scrollY 0, and applies exactly that as marginTop — it can't overshoot because it's
  // reading reality, not assuming it.
  const [toolbarMarginTop, setToolbarMarginTop] = useState(0);
  const toolbarMarginTopRef = useRef(0);
  useLayoutEffect(() => {
    const el = toolbarRef.current;
    if (!el) return;

    const remeasure = () => {
      if (window.scrollY > 0) return;
      const headerHeight =
        parseFloat(getComputedStyle(el).getPropertyValue("--tw-header-height")) || 0;
      // Undo whatever margin is currently applied to recover the box's true natural
      // (unadjusted) position, using a ref rather than the state value — a plain closure
      // over the state here would go stale after the first correction, since this effect
      // only runs once and never re-subscribes to the updated value.
      const naturalTop = el.getBoundingClientRect().top - toolbarMarginTopRef.current;
      const gap = naturalTop - headerHeight;
      const next = gap > 0 ? -gap : 0;
      toolbarMarginTopRef.current = next;
      setToolbarMarginTop(next);
    };

    // Deferred one frame rather than run synchronously: on first mount, the shared LMS
    // layout applies its "demo1"/"header-fixed" body classes — the classes that make
    // --tw-header-height resolve to anything at all — inside its own plain useEffect in
    // an ANCESTOR component. React fires a child's effects before its parent's, so this
    // component's effects run before that one; measuring immediately here would read
    // --tw-header-height as an unset empty string (-> falls back to 0) and under-correct,
    // leaving exactly the kind of small leftover gap this was supposed to remove.
    // requestAnimationFrame guarantees this runs after every effect from that commit has
    // flushed, once the classes (and therefore the real header height) are actually in place.
    const raf = requestAnimationFrame(remeasure);
    // Re-measure on resize too — --tw-header-height switches between its mobile/desktop
    // values at the lg breakpoint, which changes the correct offset.
    window.addEventListener("resize", remeasure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", remeasure);
    };
  }, []);

  useEffect(() => {
    const el = toolbarRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    // Deliberately read el.offsetHeight (border-box, includes the toolbar's own padding)
    // rather than entries[0].contentRect (content-box only, EXCLUDES padding). The toolbar
    // has real vertical padding (pt-2/pb-6), so contentRect was undershooting its true
    // occupied height by that padding amount — which meant the banner's computed sticky
    // offset sat above its actual natural resting position, and it had to visibly scroll
    // through that gap before locking. Reading offsetHeight instead of contentRect.height
    // is the actual fix; ResizeObserver is still used just to know *when* to re-measure.
    const observer = new ResizeObserver(() => {
      const height = el.offsetHeight;
      if (height) setToolbarHeight(height);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  // No added buffer here — the grid holding the banners starts immediately after the
  // toolbar's own box with zero margin/padding between them, so the banner's natural
  // (unstuck) resting position is exactly header-height + toolbarHeight already. Adding
  // any extra px on top of that would make the sticky "top" threshold sit lower than that
  // natural position, leaving a real gap the element has to travel through on every
  // scroll before it locks — the same class of bug that was causing the header to visibly
  // move. Matching the two numbers exactly removes that gap entirely.
  const bannerStickyTop = `calc(var(--tw-header-height) + ${toolbarHeight}px)`;

  // Every content type fetches from its own real, paginated backend API — 10 items
  // initially, 10 more per scroll — independent of the other types.
  const [postsPage, setPostsPage] = useState(1);
  const [allPosts, setAllPosts] = useState([]);
  const [ideasPage, setIdeasPage] = useState(1);
  const [allIdeas, setAllIdeas] = useState([]);
  const [insightsPage, setInsightsPage] = useState(1);
  const [allInsights, setAllInsights] = useState([]);
  const [liveIdeasPage, setLiveIdeasPage] = useState(1);
  const [allLiveIdeas, setAllLiveIdeas] = useState([]);

  // socialType is always "all" now — the Social/Corporate split is gone, corporate
  // updates blend into the unified feed alongside educator updates (backend enforces this).
  const {
    data: postsResponse,
    isFetching: isFetchingPosts,
    isError: isErrorPosts,
  } = usePostQuery({ page: postsPage, limit: PAGE_SIZE, socialType: "all" });

  const { data: ideasResponse, isFetching: isFetchingIdeas } =
    useGetClientTradeIdeasQuery({ page: ideasPage, limit: PAGE_SIZE });

  const { data: insightsResponse, isFetching: isFetchingInsights } =
    useGetClientTradeAnalysisQuery({ page: insightsPage, limit: PAGE_SIZE });

  const { data: liveIdeasResponse, isFetching: isFetchingLiveIdeas } =
    useGetClientLiveIdeasQuery({ page: liveIdeasPage, limit: PAGE_SIZE });

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
    if (!ideasResponse?.data) return;
    setAllIdeas((prev) => {
      const seen = new Set(prev.map((p) => p._id));
      const fresh = ideasResponse.data.filter((p) => !seen.has(p._id));
      return fresh.length ? [...prev, ...fresh] : prev;
    });
  }, [ideasResponse]);

  useEffect(() => {
    if (!insightsResponse?.data) return;
    setAllInsights((prev) => {
      const seen = new Set(prev.map((p) => p._id));
      const fresh = insightsResponse.data.filter((p) => !seen.has(p._id));
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
  // Ideas/Insights/Live Ideas' pagination has no hasNext field — derive it.
  const hasMoreIdeas = ideasResponse?.pagination
    ? ideasResponse.pagination.currentPage < ideasResponse.pagination.totalPages
    : false;
  const hasMoreInsights = insightsResponse?.pagination
    ? insightsResponse.pagination.currentPage <
      insightsResponse.pagination.totalPages
    : false;
  const hasMoreLiveIdeas = liveIdeasResponse?.pagination
    ? liveIdeasResponse.pagination.currentPage <
      liveIdeasResponse.pagination.totalPages
    : false;

  // Per-type pagination state, keyed identically to FILTERS[].key.
  const tabState = {
    posts: { page: postsPage, setPage: setPostsPage, hasNext: hasMorePosts, isFetching: isFetchingPosts },
    ideas: { page: ideasPage, setPage: setIdeasPage, hasNext: hasMoreIdeas, isFetching: isFetchingIdeas },
    insights: { page: insightsPage, setPage: setInsightsPage, hasNext: hasMoreInsights, isFetching: isFetchingInsights },
    liveIdeas: { page: liveIdeasPage, setPage: setLiveIdeasPage, hasNext: hasMoreLiveIdeas, isFetching: isFetchingLiveIdeas },
  };

  // No normalization — each source's raw API documents are kept exactly as returned
  // (original fields, original structure, same as their own dedicated pages: /ideas,
  // /iq-insight, /live-ideas). Combining is just deciding WHICH raw items are in play and
  // in WHAT order; each one still carries its own real shape through to render, where it's
  // handed to its own real card component (SocialPostCard, SocialIdeaCard,
  // SocialInsightCard, SocialLiveIdeaCard) — never a shared/generic one.
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
    // webTradeAnalysis (insights) returns the timestamp under "createAt" (typo upstream),
    // not "createdAt" — every other type uses the real "createdAt".
    return merged.sort(
      (a, b) =>
        new Date(b.raw?.createdAt || b.raw?.createAt || 0) -
        new Date(a.raw?.createdAt || a.raw?.createAt || 0)
    );
  }, [allPosts, allIdeas, allInsights, allLiveIdeas, activeTypesKey]);

  // When exactly one type is active, its own accumulated array IS what's shown (no cap
  // needed — its own API pagination already governs it). When several types are combined
  // (including the "nothing selected" default of all four), the merged pool can already
  // hold up to 40 eagerly-fetched items after the first render, so the combined view gets
  // its own display window that only grows 10 at a time as the user scrolls.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeTypesKey]);

  const display = isSingle ? fullFeed : fullFeed.slice(0, visibleCount);

  const canLoadMore = isSingle
    ? tabState[activeTypes[0]]?.hasNext ?? false
    : fullFeed.length > visibleCount ||
      activeTypes.some((t) => tabState[t].hasNext);

  const loadMoreTriggeredRef = useRef(false);
  const loadMore = () => {
    if (loadMoreTriggeredRef.current || !canLoadMore) return;
    loadMoreTriggeredRef.current = true;

    if (isSingle) {
      const state = tabState[activeTypes[0]];
      if (state?.hasNext && !state.isFetching) state.setPage((p) => p + 1);
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

  const toggleType = (key) => {
    setSelectedTypes((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const clearTypes = () => {
    setSelectedTypes([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isInitialLoading =
    fullFeed.length === 0 &&
    activeTypes.some((t) => tabState[t].isFetching && tabState[t].page === 1);

  // ─── IQ Social Tour (ABSOLUTE FINAL STOP) ──────────────────────────────────────────
  useTourStep({
    shouldStart: location?.state?.continueTour === true,
    isReady: !isInitialLoading,
    getSteps: () => {
      const steps = [];
      const toolbar = document.querySelector('.social-toolbar');
      if (toolbar) steps.push({ element: toolbar, title: '📰 IQ Social', intro: 'Welcome to IQ Social the community hub where educators and students share real-time market insights, updates, and announcements.', position: 'bottom' });
      const filterRow = document.querySelector('.social-type-filter');
      if (filterRow) steps.push({ element: filterRow, title: '🏷️ Filter Feed', intro: 'Everything is shown by default. Select one or more of <strong>Posts</strong>, <strong>Ideas</strong>, <strong>Insights</strong>, and <strong>Live Ideas</strong> to narrow the feed down to just those types.', position: 'bottom' });
      const firstPost = document.querySelector('.social-first-post');
      if (firstPost) steps.push({ element: firstPost, title: '💬 Community Post', intro: 'Each card shows the educator or team member, the content, and its type. You can like and comment to interact with the community.', position: 'bottom' });
      return steps;
    },
    onDone: () => { }, // Final stop — no next page
    isFinalStep: true, // ✔ Triggers markTourComplete in onexit
    doneLabel: 'Finish Tour ✓',
    delay: 1000,
  });
  // ─────────────────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto pb-8 px-4 sm:px-6 lg:px-8">
      <div
        ref={toolbarRef}
        // marginTop is the measured (not guessed) gap between this bar's natural resting
        // position and the fixed app header's bottom edge — see the effect above. Cancelling
        // it removes the "settle" motion on the first/last bit of scroll without risking an
        // overshoot into the header, since it's derived from the real rendered DOM rather
        // than an assumed pixel value.
        style={{ marginTop: toolbarMarginTop }}
        className="social-toolbar sticky top-[--tw-header-height] z-20 bg-[--tw-page-bg] dark:bg-[--tw-page-bg-dark] grid grid-cols-1 md:grid-cols-3 items-center gap-2 pt-2 pb-6"
      >
        <ToolbarHeading>
          <ToolbarPageTitle text="IQ Social" />
          <ToolbarDescription>Latest community posts</ToolbarDescription>
        </ToolbarHeading>

        <div className="flex justify-center overflow-x-auto">
          <div className="relative flex items-center h-9 px-3 rounded-lg bg-gradient-to-r from-[#2B44D3] to-[#5f5fad] social-type-filter">
            <div className="flex items-center justify-center gap-2">
              {FILTERS.map((tab, i) => {
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
          </div>
        </div>

        <div className="hidden md:block" />
      </div>

      <div
        className={`grid grid-cols-1 gap-3 items-start ${
          HAS_SIDE_BANNERS ? "lg:grid-cols-[220px_minmax(0,1fr)_220px]" : ""
        }`}
      >
        {HAS_SIDE_BANNERS && (
          <SocialSideBanner position="left" image={LEFT_BANNER_IMAGE} alt="IQ Social left banner" stickyTop={bannerStickyTop} />
        )}

        <div className="max-w-full sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto w-full">
        {isInitialLoading ? (
          <div className="space-y-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-gray-200 dark:border-[#22242A] bg-white dark:bg-[#16181D] p-6 animate-pulse">
                <div className="flex items-center mb-4 gap-3">
                  <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-[#2C2F36]" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-200 dark:bg-[#2C2F36] rounded w-1/3" />
                    <div className="h-2 bg-gray-100 dark:bg-[#22242A] rounded w-1/4" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 dark:bg-[#2C2F36] rounded w-full" />
                  <div className="h-3 bg-gray-200 dark:bg-[#2C2F36] rounded w-5/6" />
                  <div className="h-3 bg-gray-200 dark:bg-[#2C2F36] rounded w-4/6" />
                </div>
              </div>
            ))}
          </div>
        ) : isErrorPosts && display.length === 0 ? (
          <div className="text-center text-red-500">Error loading feed</div>
        ) : display.length === 0 ? (
          <div className="card rounded-lg shadow-md p-8 text-center">
            <Rss size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-700">No posts yet</h3>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={display.length}
            next={loadMore}
            hasMore={canLoadMore}
            loader={
              <div className="text-center py-4 text-gray-500 animate-pulse">
                Loading more…
              </div>
            }
            scrollThreshold={0.9}
          >
            {display.map((item, index) => {
              const card = (() => {
                switch (item.type) {
                  case "posts":
                    return <SocialPostCard post={item.raw} showTypeBadge />;
                  case "ideas":
                    return <SocialIdeaCard idea={item.raw} />;
                  case "insights":
                    return <SocialInsightCard insight={item.raw} />;
                  case "liveIdeas":
                    return <SocialLiveIdeaCard liveIdea={item.raw} />;
                  default:
                    return null;
                }
              })();
              return index === 0 ? (
                <div key={item.id} className="social-first-post">
                  {card}
                </div>
              ) : (
                <React.Fragment key={item.id}>{card}</React.Fragment>
              );
            })}
          </InfiniteScroll>
        )}
        </div>

        {HAS_SIDE_BANNERS && (
          <SocialSideBanner position="right" image={RIGHT_BANNER_IMAGE} alt="IQ Social right banner" stickyTop={bannerStickyTop} />
        )}
      </div>
    </div>
  );
};

export default CommunityFeed;

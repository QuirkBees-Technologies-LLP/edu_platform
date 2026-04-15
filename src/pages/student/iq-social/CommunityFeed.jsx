import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import introJs from "intro.js";
import "intro.js/introjs.css";
import { useAuthContext } from "@/auth";
import { useCompleteTourMutation } from "../../../store/api/client/clientProfileApiSlice";
import InfiniteScroll from "react-infinite-scroll-component";
import { usePostQuery } from "../../../store/api/client/clientSocialApiSlilce";
import SocialPostCard from "./SocialPostCard";
import { Rss } from "lucide-react";
import {
  Toolbar,
  ToolbarHeading,
  ToolbarPageTitle,
  ToolbarDescription,
} from "@/partials/toolbar";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSearchParams } from "react-router-dom";

const CommunityFeed = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get("socialType") || "all";
  const [socialType, setSocialType] = useState(initialType);
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [hasMore, setHasMore] = useState(true);
  const [isSwitching, setIsSwitching] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const socialTourStartedRef = useRef(false);
  const { auth, saveAuth } = useAuthContext();
  const [completeTour] = useCompleteTourMutation();

  const markTourComplete = async () => {
    try {
      await completeTour().unwrap();
      if (auth) saveAuth({ ...auth, user: { ...auth.user, hasSeenTour: true } });
    } catch (err) {
      console.error('Failed to mark tour complete:', err);
    }
  };

  const { data, isLoading, isFetching, isError } = usePostQuery(
    { page, limit, socialType }
  );

  useEffect(() => {
    setPosts([]);
    setHasMore(true);
    setPage(1);
    setIsSwitching(true);
  }, [socialType]);

  useEffect(() => {
    if (data?.posts) {
      setPosts((prev) => {
        const existingIds = new Set(prev.map((p) => p._id));
        const newPosts = data.posts.filter((p) => !existingIds.has(p._id));
        return [...prev, ...newPosts];
      });

      if (data.posts.length < limit) {
        setHasMore(false);
      }
      setIsSwitching(false);
    }
  }, [data]);

  // ─── IQ Social Tour (ABSOLUTE FINAL STOP) ─────────────────────────────────────────────────────
  useEffect(() => {
    const shouldStart = location?.state?.continueTour === true;
    if (!shouldStart) return;
    if (auth?.user?.hasSeenTour) return; // Tour already completed — don't restart
    if (socialTourStartedRef.current) return;
    if (isLoading) return;

    socialTourStartedRef.current = true;

    // Detect Skip button clicks
    let tourDone = false;
    let userClickedSkip = false;
    const handleSkipClick = (e) => {
      if (e.target.closest?.('.introjs-skipbutton')) {
        userClickedSkip = true;
      }
    };

    const timer = setTimeout(() => {
      const steps = [];

      // Step 1: Page title/toolbar
      const toolbar = document.querySelector('.social-toolbar');
      if (toolbar) {
        steps.push({
          element: toolbar,
          title: '📰 IQ Social',
          intro: 'Welcome to IQ Social! This is the community hub where educators and students share insights, trading updates, and market commentary in real time.',
          position: 'bottom',
        });
      }

      // Step 2: Post type filter
      const filterSelect = document.querySelector('.social-type-filter');
      if (filterSelect) {
        steps.push({
          element: filterSelect,
          title: '🏷️ Filter by Type',
          intro: 'Filter posts by type: Social posts from educators, or Corporate announcements from the platform. Switch between them to find what matters to you.',
          position: 'bottom',
        });
      }

      // Step 3: First post card
      const firstPost = document.querySelector('.social-first-post');
      if (firstPost) {
        steps.push({
          element: firstPost,
          title: '💬 Community Post',
          intro: 'Each post shows the educator or team member, the content, and engagement options. Like, comment, and engage with the community directly from here.',
          position: 'bottom',
        });
      }

      if (steps.length === 0) {
        markTourComplete();
        socialTourStartedRef.current = false;
        return;
      }

      const tour = introJs.tour().setOptions({
        steps,
        hidePrev: true,
        nextLabel: 'Next →',
        prevLabel: '← Back',
        skipLabel: 'Skip',
        doneLabel: 'Finish Tour ✓',
        showProgress: true,
        showBullets: false,
        overlayOpacity: 0.8,
        exitOnOverlayClick: false,
        exitOnEsc: true,
        scrollToElement: true,
        tooltipClass: 'custom-intro-tooltip',
      });

      tour.oncomplete(() => {
        document.removeEventListener('click', handleSkipClick, true);
        if (!userClickedSkip) {
          tourDone = true;
        }
        socialTourStartedRef.current = false;
        markTourComplete(); // ✅ ABSOLUTE FINAL STOP
      });
      tour.onexit(() => {
        document.removeEventListener('click', handleSkipClick, true);
        if (!tourDone) {
          // User clicked Skip — do NOT reset ref (prevents restart during API call)
          markTourComplete();
        }
      });

      document.addEventListener('click', handleSkipClick, true); // capture phase
      tour.start();
    }, 1000);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleSkipClick, true);
      // ❌ Do NOT reset ref here — StrictMode double-invoke would re-trigger the tour
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.state?.continueTour, isLoading]);
  // ──────────────────────────────────────────────────────────────────────────────



  const loadMore = () => {
    if (!isFetching && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="container mx-auto pb-8 px-4">
      <Toolbar className="social-toolbar">
        <ToolbarHeading>
          <ToolbarPageTitle text="IQ Social" />
          <ToolbarDescription>Latest community posts</ToolbarDescription>
        </ToolbarHeading>
        <div className="flex items-center gap-2 relative social-type-filter">
          <Select
            className="w-[180px] text-sm font-medium"
            value={socialType}
            onValueChange={(value) => {
              setSocialType(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Type">
                {socialType === "social"
                  ? "Social"
                  : socialType === "company"
                    ? "Corporate"
                    : "Select "}
              </SelectValue>
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="company">corporate</SelectItem>
            </SelectContent>
          </Select>

          {socialType !== "all" && (
            <button
              type="button"
              onClick={() => {
                setSocialType("all");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            >
              ✖
            </button>
          )}
        </div>
      </Toolbar>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
        <div className="col-span-1 sm:col-span-2 lg:col-span-3">
          {(isLoading || isSwitching || (isFetching && posts.length === 0)) ? (
            <div className="container max-w-full sm:max-w-2xl mx-auto pb-8 space-y-6">
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
          ) : isError ? (
            <div className="text-center text-red-500">Error loading posts</div>
          ) : posts.length === 0 && !isLoading && !isSwitching && !isFetching ? (
            <div className="card rounded-lg shadow-md p-8 text-center">
              <Rss size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">
                No posts yet
              </h3>
            </div>
          ) : (
            <InfiniteScroll
              dataLength={posts.length}
              next={loadMore}
              hasMore={hasMore}
              loader={
                <div className="text-center py-4 text-gray-500 animate-pulse">
                  Loading more…
                </div>
              }
              scrollableTarget="scrollableDiv"
              scrollThreshold={0.9}
            >
              <div className="container max-w-full sm:max-w-2xl mx-auto pb-8">
                {posts.map((post, index) => (
                  index === 0
                    ? <div key={post._id} className="social-first-post"><SocialPostCard post={post} /></div>
                    : <SocialPostCard key={post._id} post={post} />
                ))}
              </div>
            </InfiniteScroll>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityFeed;

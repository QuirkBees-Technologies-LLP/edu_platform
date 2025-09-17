import React, { useEffect, useState } from "react";
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

const CommunityFeed = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [hasMore, setHasMore] = useState(true);

  const { data, isLoading, isFetching, isError } = usePostQuery({
    page,
    limit,
    // optionally: timestamp: Date.now()
  });

  useEffect(() => {
    // console.log to debug
    console.log("New data", data, "page", page);

    if (data?.posts) {
      if (page === 1) {
        // first page, fresh
        setPosts(data.posts);
      } else {
        // append new pages
        setPosts(prev => {
          // avoid duplicate items (if backend sends repeats)
          const existingIds = new Set(prev.map(p => p._id));
          const newOnes = data.posts.filter(p => !existingIds.has(p._id));
          return [...prev, ...newOnes];
        });
      }

      if (data.posts.length < limit) {
        setHasMore(false);
      }
    } else {
      setHasMore(false);
    }
  }, [data]);

  const loadMore = () => {
    console.log("loadMore called", { page, hasMore, isFetching });
    if (!isFetching && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <div className="container-fluid pb-8">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="IQ Social" />
          <ToolbarDescription>Latest community posts</ToolbarDescription>
        </ToolbarHeading>
      </Toolbar>

      <div className="grid grid-cols-18 gap-4 mt-6">
        <div className="col-span-18 lg:col-span-8">
          {isLoading && posts.length === 0 ? (
            <div className="card rounded-lg shadow-md p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto" />
              <p className="mt-4 text-gray-600">Loading posts…</p>
            </div>
          ) : isError ? (
            <div className="text-center text-red-500">Error loading posts</div>
          ) : posts.length === 0 ? (
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
              scrollThreshold={0.8}
            >
              {posts.map(post => (
                <SocialPostCard key={post._id} post={post} showActions={false} />
              ))}
            </InfiniteScroll>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityFeed;

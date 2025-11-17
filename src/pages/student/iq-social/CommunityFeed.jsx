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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CommunityFeed = () => {
  const [socialType, setSocialType] = useState("social");
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [hasMore, setHasMore] = useState(true);

  const { data, isLoading, isFetching, isError } = usePostQuery(
    { page, limit, socialType },
    { refetchOnMountOrArgChange: true }
  );

  useEffect(() => {
    setPosts([]);
    setHasMore(true);
    setPage(1);
    console.log(posts, "posts");
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
    }
  }, [data]);

  console.log(posts, "posts");

  const loadMore = () => {
    if (!isFetching && hasMore) {
      setPage((prev) => prev + 1);
    }
  };

  return (
    <div className="container mx-auto pb-8 px-4">
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle text="IQ Social" />
          <ToolbarDescription>Latest community posts</ToolbarDescription>
        </ToolbarHeading>
        <div className="flex items-center gap-2 relative">
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
                    ? "Company"
                    : "Select Type"}
              </SelectValue>
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="social">Social</SelectItem>
              <SelectItem value="company">Company</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Toolbar>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ">
        <div className="col-span-1 sm:col-span-2 lg:col-span-3">
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
              scrollableTarget="scrollableDiv"
              scrollThreshold={0.9}
            >
              <div className="container max-w-full sm:max-w-2xl mx-auto pb-8">
                {posts.map((post) => (
                  <SocialPostCard key={post._id} post={post} />
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

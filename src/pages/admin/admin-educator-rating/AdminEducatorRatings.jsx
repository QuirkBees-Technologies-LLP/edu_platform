import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Loader2, Star, StarHalf } from "lucide-react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { format } from "date-fns";
import { useGetMyRatingsQuery } from "../../../store/api/admin/adminRatingApiSlice";
import {
  Toolbar,
  ToolbarHeading,
  ToolbarPageTitle,
  ToolbarDescription,
  ToolbarActions,
} from "@/partials/toolbar";

const FallbackAvatar = ({ name, size = 64 }) => {
  const initials = (name || "NA")
    .split(" ")
    .map((s) => s?.[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold text-lg"
    >
      {initials || "NA"}
    </div>
  );
};

export default function AdminEducatorRatings() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [page, setPage] = useState(1);

  const limit = 10;
  const params = useParams();

  const educatorId = params.educatorId || state?.educator?._id || null;
  const [allRatings, setAllRatings] = useState([]);

  const {
    data: ratingsRes,
    isLoading,
    isFetching,
    isError,
    error,
  } = useGetMyRatingsQuery({
    educatorId,
    page,
    limit,
    search: "",
    sort: "-createdAt",
  });
  const loadMoreRef = useRef(null);
  const hasMore = ratingsRes?.pagination?.hasMore;

  const ratings = ratingsRes?.data || [];

  const educatorFromState = state?.educator;
  const educatorName =
    educatorFromState?.name ||
    `${educatorFromState?.first_name || ""} ${educatorFromState?.last_name || ""}`.trim() ||
    (ratingsRes?.data?.length ? ratingsRes.data[0]?.user?.name : "Educator");
  const educatorEmail = educatorFromState?.email || "";
  const educatorCategories =
    educatorFromState?.categoryDetails?.map((c) => c.name).join(", ") ||
    state?.category ||
    "";

  const computed = useMemo(() => {
    if (!ratings || ratings.length === 0) return { avg: 0, total: 0 };
    const total = ratings.length;
    const sum = ratings.reduce((s, r) => s + (Number(r.rating) || 0), 0);
    const avg = sum / total;
    return { avg, total };
  }, [ratings]);

  const avgRating =
    ratingsRes?.meta?.avgRating ?? ratingsRes?.avgRating ?? computed.avg;
  const totalReviews = ratingsRes?.pagination?.total ?? computed.total;

  const renderStars = (rating, size = 20) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;

    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => {
          if (i < fullStars) {
            return (
              <Star
                key={i}
                className={`w-${Math.round(size / 4)} h-${Math.round(
                  size / 4
                )} text-yellow-400 fill-yellow-400`}
              />
            );
          }

          if (i === fullStars && halfStar) {
            return (
              <StarHalf
                key={i}
                className={`w-${Math.round(size / 4)} h-${Math.round(
                  size / 4
                )} text-yellow-400 fill-yellow-400`}
              />
            );
          }

          return (
            <Star
              key={i}
              className={`w-${Math.round(size / 4)} h-${Math.round(
                size / 4
              )} text-gray-300`}
            />
          );
        })}
      </div>
    );
  };

  useEffect(() => {
    if (ratingsRes?.data) {
      if (page === 1) {
        setAllRatings(ratingsRes.data);
      } else {
        setAllRatings((prev) => [...prev, ...ratingsRes.data]);
      }
    }
  }, [ratingsRes]);

  useEffect(() => {
    if (!hasMore || isFetching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => prev + 1);
        }
      },
      { rootMargin: "200px" }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, isFetching]);

  return (
    <div className="max-w-7xl mx-auto px-4 pb-10">
      <div className="">
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle
              text={`${educatorName} Ratings` || "Educator Ratings"}
            />
            <ToolbarDescription>{`View all ratings for ${educatorName}`}</ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions></ToolbarActions>
        </Toolbar>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-purple-600 font-medium hover:underline mb-6 mt-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to all educators
        </button>

        <div className="border dark:bg-gray-200 shadow-md rounded-xl px-6 py-20 mb-8 ">
          <div className="flex items-center justify-between flex-col md:flex-row gap-2 md:gap-6">
            <div className="flex items-center gap-6 flex-col md:flex-row">
              {educatorFromState?.image ? (
                <img
                  src={educatorFromState.image}
                  alt={educatorName}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <FallbackAvatar name={educatorName} size={80} />
              )}

              <div className="text-center md:text-start">
                <h2 className="text-xl font-bold text-gray-900">
                  {educatorName}
                </h2>
                <p className="text-gray-600 mt-2">
                  {educatorEmail} - {educatorCategories}
                </p>
              </div>
            </div>
            <div className="md:text-right text-center md:w-auto w-full">
              <div className="flex md:flex-row flex-col items-center md:justify-end justify-center gap-2 md:gap-3">
                <div className="flex items-center gap-2">
                  {renderStars(Number(avgRating) || 0, 20)}
                  <span className="text-lg font-semibold text-gray-900">
                    {(Number(avgRating) || 0).toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="text-sm text-gray-500 mt-1">
                ({totalReviews} total reviews)
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Written Feedback
        </h3>

        {/* Initial load */}
        {isLoading && (
          <div className="py-4 flex justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
          </div>
        )}

        {isError && (
          <div className="py-6 text-center text-red-600">
            Failed to load ratings. {error?.data?.message || ""}
          </div>
        )}

        {!isLoading && !isError && ratings.length === 0 && (
          <div className="py-6 text-center text-gray-600">No reviews yet.</div>
        )}

        <div className="space-y-6">
          {allRatings.map((fb) => {
            const user = fb.user || {};
            const userName = user.name || "Student";
            const userImage = user.image;
            const date = fb.createdAt
              ? format(new Date(fb.createdAt), "yyyy-MM-dd")
              : "";

            return (
              <div
                key={fb._id}
                className="border dark:bg-gray-200 shadow-md rounded-xl p-5 flex items-start justify-between gap-4"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {userImage ? (
                    <img
                      src={userImage}
                      alt={userName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
                      {userName
                        .split(" ")
                        .map((s) => s?.[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase() || "S"}
                    </div>
                  )}

                  <div className="w-full">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-6 h-5 ${i < Math.floor(fb.rating || 0)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                                }`}
                            />
                          ))}
                        </div>
                        <span className="font-semibold text-gray-900">
                          {fb.rating}
                        </span>
                      </div>
                      <span className="text-gray-600 text-sm whitespace-nowrap">
                        {date}
                      </span>
                    </div>

                    {fb.comment ? (
                      <p className="text-gray-800 mt-2">{fb.comment}</p>
                    ) : (
                      <p className="text-gray-500 mt-2 italic">
                        No comment provided
                      </p>
                    )}

                    <p className="text-sm text-gray-600 mt-1">— {userName}</p>
                  </div>
                </div>
              </div>
            );
          })}
          <div
            ref={loadMoreRef}
            className="h-10 flex items-center justify-center"
          >
            {isFetching && (
              <span className="text-gray-500 text-sm">Loading more...</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

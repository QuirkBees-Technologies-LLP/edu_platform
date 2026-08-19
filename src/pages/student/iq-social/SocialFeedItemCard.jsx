import React from "react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { TrendingDown, TrendingUp } from "lucide-react";

// Unified card for the non-"posts" content types (Ideas, Insights, Live Ideas) inside the
// merged IQ Social feed. Kept deliberately lean — full write-ups live on each content
// type's own detail page — while matching the page's existing light/dark card styling
// (SocialPostCard's container conventions) rather than introducing a new visual language.
const TYPE_META = {
  posts: { label: "Post", className: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300" },
  ideas: { label: "Idea", className: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300" },
  insights: { label: "Insight", className: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300" },
  liveIdeas: { label: "Live Idea", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300" },
};

const SocialFeedItemCard = ({ item }) => {
  const navigate = useNavigate();
  const meta = TYPE_META[item.type] || TYPE_META.posts;
  const educatorId = item?.raw?.educatorDetails?._id || item?.raw?.author?._id;

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-[#22242A] bg-white dark:bg-[#16181D] p-6 mb-6 transition-all duration-300 w-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <img
            onClick={() => educatorId && navigate(`/iq-educators/${educatorId}`)}
            src={
              item.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                item.name || "User"
              )}&background=random&color=fff&size=80`
            }
            alt={item.name}
            className="w-12 h-12 rounded-full object-cover border border-gray-300 dark:border-[#2C2F36] cursor-pointer hover:opacity-90 transition-all"
          />
          <div className="ml-3">
            <p
              onClick={() => educatorId && navigate(`/iq-educators/${educatorId}`)}
              className="font-medium text-gray-900 dark:text-[#EDEDED] hover:text-blue-600 dark:hover:text-[#8B5CF6] cursor-pointer transition-colors"
            >
              {item.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-[#9CA3AF] flex items-center gap-1">
              {item.createdAt
                ? formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })
                : ""}
              {item.tradeType && (
                <span className="inline-flex items-center ml-1">
                  {item.tradeType === "buy" ? (
                    <TrendingUp size={12} className="text-emerald-500" />
                  ) : (
                    <TrendingDown size={12} className="text-red-500" />
                  )}
                </span>
              )}
            </p>
          </div>
        </div>
        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${meta.className}`}>
          {meta.label}
        </span>
      </div>

      {item.text && (
        <p className="text-sm text-gray-800 dark:text-[#EDEDED] leading-relaxed mb-3">
          {item.text}
        </p>
      )}

      {item.image && (
        <div className="relative w-full overflow-hidden rounded-xl bg-black/5 dark:bg-white/5">
          <img
            src={item.image}
            alt={item.text || meta.label}
            loading="lazy"
            className="w-full aspect-video object-contain"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
      )}
    </div>
  );
};

export default SocialFeedItemCard;

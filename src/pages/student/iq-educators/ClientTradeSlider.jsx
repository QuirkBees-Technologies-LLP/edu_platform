import { format } from "date-fns";
import ShowMoreLess from "../../../components/ui/showmoreless";
import { TrendingDown, TrendingUp } from "lucide-react";

export default function ClientTradeSlider({
  sliderImages,
  setIsLightBoxOpen,
  selectedIdea,
}) {
  const LabelMap = {
    active: "Active",
    pending: "Pending",
    win: "Win",
    partialWin: "Partial Win",
    loss: "Loss",
    breakEven: "Break Even",
  };


  return (
    <>
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12">
          {sliderImages?.map((image, index) => (
            <div
              key={index}
              onClick={() => setIsLightBoxOpen(true)}
              className="cursor-pointer relative mb-3"
            >
              {/* IMAGE */}
              <img
                className="w-full rounded-lg object-cover"
                src={image}
                alt={`Trade image ${index}`}
              />

              {/* 🔥 OVERLAY */}
              <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
                <div className="flex items-center gap-2">
                  <div
                    className={`px-2 py-1 rounded-lg font-semibold text-xs flex items-center gap-2 ${selectedIdea?.type === "buy"
                      ? "bg-emerald-500 text-white"
                      : "bg-red-500 text-white"
                      }`}
                  >
                    {selectedIdea?.type === "buy" ? (
                      <TrendingUp size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    {selectedIdea?.type?.toUpperCase()}
                  </div>

                  <div className="bg-gray-800 px-2 py-1 rounded-lg font-semibold text-xs text-white">
                    {selectedIdea?.name}
                  </div>
                </div>

                {LabelMap?.[selectedIdea?.status] === "Active" && (
                  <div className="bg-cyan-700 text-white px-2 py-1 rounded-lg font-semibold text-xs flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Active
                  </div>
                )}

                {LabelMap?.[selectedIdea?.status] === "Pending" && (
                  <div className="bg-purple-700 text-white px-2 py-1 rounded-lg font-semibold text-xs flex items-center gap-2">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    Pending
                  </div>
                )}

                {LabelMap?.[selectedIdea?.status] === "Win" && (
                  <div className="bg-emerald-500 text-white px-2 py-1 rounded-lg font-semibold text-xs">
                    ★ WIN +{selectedIdea?.pips} pips
                  </div>
                )}

                {LabelMap?.[selectedIdea?.status] === "Loss" && (
                  <div className="bg-red-500 text-white px-2 py-1 rounded-lg font-semibold text-xs">
                    ▲ LOSS -{selectedIdea?.pips} pips
                  </div>
                )}

                {LabelMap?.[selectedIdea?.status] === "Partial Win" && (
                  <div className="bg-purple-500 text-white px-2 py-1 rounded-lg font-semibold text-xs">
                    ▲ PARTIAL WIN {selectedIdea?.pips} pips
                  </div>
                )}

                {LabelMap?.[selectedIdea?.status] === "Break Even" && (
                  <div className="bg-blue-500 text-white px-2 py-1 rounded-lg font-semibold text-xs">
                    Break Even
                  </div>
                )}
              </div>
              {/* 🔥 OVERLAY END */}
            </div>
          ))}

        </div>

      </div>
    </>
  );
}

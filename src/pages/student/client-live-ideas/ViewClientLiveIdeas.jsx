import React, { forwardRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ClientTradeSlider from "./ClientLiveIdeaSlider";
import { format } from "date-fns";
import EducatorImage from "./EducatorImage";
import { Link } from "react-router-dom";

const LabelMap = {
  active: "Active",
  pending: "Pending",
  win: "Win",
  partialWin: "Partial Win",
  loss: "Loss",
  breakEven: "Break Even",
};

const ViewClientLiveIdeas = forwardRef(
  ({ isViewOpen, handleCloseView, selectedIdea, setIsLightBoxOpen }, ref) => {
    return (
      <Dialog
        asChild
        open={isViewOpen}
        onOpenChange={() => {
          handleCloseView();
        }}
      >
        <DialogContent forceMount className="max-w-[600px]" ref={ref}>
          <DialogHeader className="sr-only">
            <DialogTitle className="sr-only">text</DialogTitle>
          </DialogHeader>
          <div className="grid gap-5 px-0">
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12">
                <div className="flex items-center justify-between px-4 pb-3 pt-3">
                  <div className="mr-2 text-lg text-gray-900 font-semibold">
                    {selectedIdea?.name}
                  </div>
                  {selectedIdea?.status && (
                    <span
                      className={`inline-block px-3 py-1 rounded-xl text-[11px] font-extrabold uppercase tracking-wider flex-shrink-0 ${LabelMap[selectedIdea.status] === "Active"
                        ? "bg-cyan-500/15 text-cyan-600 dark:text-cyan-400"
                        : LabelMap[selectedIdea.status] === "Pending"
                          ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                          : LabelMap[selectedIdea.status] === "Win"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : LabelMap[selectedIdea.status] === "Partial Win"
                              ? "bg-emerald-400/15 text-emerald-500 dark:text-emerald-400"
                              : LabelMap[selectedIdea.status] === "Loss"
                                ? "bg-red-500/15 text-red-600 dark:text-red-400"
                                : "bg-slate-500/15 text-slate-600 dark:text-slate-400"
                        }`}
                    >
                      {LabelMap[selectedIdea.status] === "Win" && selectedIdea.pips
                        ? `WIN +${selectedIdea.pips} pips`
                        : LabelMap[selectedIdea.status] === "Loss" && selectedIdea.pips
                          ? `LOSS -${selectedIdea.pips} pips`
                          : LabelMap[selectedIdea.status]}
                    </span>
                  )}
                </div>

                <div className="">
                  <ClientTradeSlider
                    sliderImages={selectedIdea?.image}
                    setIsLightBoxOpen={setIsLightBoxOpen}
                    selectedIdea={selectedIdea}
                  />
                </div>

                <div className="flex items-center mt-5 px-4">
                  <Link to={`/iq-educators/${selectedIdea?.educatorDetails?._id}`}>
                    <EducatorImage
                      educator={selectedIdea?.educatorDetails}
                    // defaultImage={toAbsoluteUrl(`/media/avatars/300-6.png`)}
                    />
                  </Link>
                  <div className="">
                    <Link
                      to={`/iq-educators/${selectedIdea?.educatorDetails?._id}`}
                      className="text-2sm text-gray-800 hover:text-primary mb-px"
                    >
                      {selectedIdea?.educatorDetails?.first_name}{" "}
                      {selectedIdea?.educatorDetails?.last_name}
                    </Link>
                  </div>
                </div>
                <div className="flex mt-2 px-4">
                  <div className="text-2sm text-gray-700 mb-px">
                    {/* {selectedIdea?.educatorDetails?.categories
                          ? selectedIdea?.categories?.name
                          : "Category not assigned"} */}
                    {Array.isArray(selectedIdea?.educatorDetails?.categories) &&
                      selectedIdea?.educatorDetails?.categories?.length > 0
                      ? selectedIdea?.educatorDetails?.categories
                        .map((cat) => cat)
                        .join(", ")
                      : selectedIdea?.category?.name || "Category not assigned"}
                  </div>
                </div>

                {/* Description — the copy entered on the update form, shown as the post's caption */}
                {selectedIdea?.description && (
                  <div className="px-4 mt-4">
                    <div
                      className="text-2sm text-gray-800"
                      dangerouslySetInnerHTML={{ __html: selectedIdea.description }}
                    />
                  </div>
                )}

                {/* TradingView links */}
                {selectedIdea?.tradingViewLinks?.length > 0 &&
                  selectedIdea.tradingViewLinks.some((l) => l && l.trim()) && (
                    <div className="px-4 mt-4">
                      <div className="text-2sm font-semibold text-gray-800 mb-1">
                        TradingView Charts
                      </div>
                      <div className="flex flex-col gap-1">
                        {selectedIdea.tradingViewLinks
                          .filter((l) => l && l.trim())
                          .map((link, idx) => (
                            <a
                              key={idx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-2sm text-primary hover:underline truncate"
                            >
                              📈 {link}
                            </a>
                          ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

export default ViewClientLiveIdeas;

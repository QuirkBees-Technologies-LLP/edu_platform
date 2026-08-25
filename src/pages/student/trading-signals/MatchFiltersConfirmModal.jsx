import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogBody,
} from "@/components/ui/dialog";
import {
  AlertTriangle,
  CheckCircle2,
  SlidersHorizontal,
  Loader2,
  X,
} from "lucide-react";

// ── Match Filters Confirmation Modal ────────────────────────────────
// Branded confirmation dialog shown before replacing notification
// preferences with the current filter selections.

const MatchFiltersConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  summary,
}) => {
  if (!isOpen) return null;

  const {
    strategies = [],
    symbols = [],
    timeframes = [],
    sessions = [],
    alertTypes,
    symbolsOverflow,
    selectedCount = 0,
    totalCount = 0,
  } = summary || {};

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2.5 text-base">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <SlidersHorizontal size={16} className="text-primary" />
            </div>
            Match Filters to Notification Preferences
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="pt-2 pb-1">
          {/* Warning Banner */}
          <div className="flex items-start gap-3 px-4 py-3 mb-5 rounded-xl bg-primary/10 border border-primary/20">
            <AlertTriangle size={16} className="text-primary shrink-0 mt-0.5" />
            <p className="text-xs text-primary leading-relaxed">
              This will <strong>replace ALL</strong> your existing notification preferences
              and set them to match only your current filter selections.
              This action cannot be undone.
            </p>
          </div>




          {/* Result Preview */}
          {/* <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-5">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-500" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Result
              </span>
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white">
              {selectedCount}
              <span className="text-xs font-normal text-slate-400 dark:text-slate-500">
                {" "}/ {totalCount} notification pairs will be active
              </span>
            </span>
          </div> */}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors disabled:opacity-50"
            >
              <X size={14} />
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Applying…
                </>
              ) : (
                <>
                  <SlidersHorizontal size={14} />
                  Apply & Replace Preferences
                </>
              )}
            </button>
          </div>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

// ── Summary Row Sub-Component ───────────────────────────────────────

const SummaryRow = ({ label, values, emptyText, overflow }) => (
  <div className="flex items-start gap-3">
    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider min-w-[80px] pt-1 shrink-0">
      {label}
    </span>
    <div className="flex flex-wrap gap-1.5">
      {values.length === 0 ? (
        <span className="text-xs text-slate-400 dark:text-slate-500 italic">
          {emptyText}
        </span>
      ) : (
        <>
          {values.map((v) => (
            <span
              key={v}
              className="px-2 py-1 rounded-md text-[11px] font-medium bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10"
            >
              {v}
            </span>
          ))}
          {overflow && (
            <span className="px-2 py-1 text-[11px] text-slate-400 dark:text-slate-500 italic">
              and more…
            </span>
          )}
        </>
      )}
    </div>
  </div>
);

export default MatchFiltersConfirmModal;

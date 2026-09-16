import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useLazyGetAdminLiveTradeIdeaThreadQuery,
  useDeleteAdminLiveTradeIdeaMutation,
} from "../../../store/api/admin/adminLiveTradeIdeasApiSlice";

const LabelMap = {
  active: "Active",
  pending: "Pending",
  win: "Win",
  partialWin: "Partial Win",
  loss: "Loss",
  breakEven: "Break Even",
  buy: "Buy",
  sell: "Sell",
};

const statusColorMap = {
  active: "badge-success",
  pending: "badge-warning",
  win: "badge-primary",
  partialWin: "badge-info",
  loss: "badge-danger",
  breakEven: "badge-secondary",
};

// Shows the full self-referencing update chain (root live idea + every chained
// "Update"/Follow-Up), so Admin/Educator can see the whole thread instead of hunting
// through separate table rows. See AdminTradeIdeas.jsx's "Follow Up" action. The chain
// is strictly linear — a new Follow-Up can only ever be added to the current latest
// item (the single "Add Follow-Up" button below), never to an earlier one — so each
// item's parent is resolved by matching previousLiveIdea against the thread's own ids
// (not by list position) purely for correctness, not to support branching.
const FollowUpThreadModal = ({ isOpen, onClose, rootId, onEditItem, onAddFollowUp, onDeleted }) => {
  const [fetchThread, { data, isFetching }] = useLazyGetAdminLiveTradeIdeaThreadQuery();
  const [deleteAdminLiveTradeIdea, { isLoading: isDeleting }] = useDeleteAdminLiveTradeIdeaMutation();
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    if (isOpen && rootId) {
      fetchThread(rootId);
    }
  }, [isOpen, rootId, fetchThread]);

  const thread = data?.data || [];
  const latest = thread[thread.length - 1];
  const findParent = (item) =>
    item.previousLiveIdea ? thread.find((t) => String(t._id) === String(item.previousLiveIdea)) : null;
  const hasChildren = (item) =>
    thread.some((t) => String(t.previousLiveIdea) === String(item._id));
  // Display newest first — chronological order is still used for the Original/Follow-Up
  // N labels below, just not for render order.
  const displayThread = thread
    .map((item, originalIndex) => ({ item, originalIndex }))
    .reverse();

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAdminLiveTradeIdea(deleteTarget._id).unwrap();
      toast.success("Follow-up deleted successfully!");
      setDeleteTarget(null);
      fetchThread(rootId);
      onDeleted?.();
    } catch (err) {
      toast.error(err?.data?.message || "Failed to delete follow-up.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="p-5 max-w-2xl">
        <DialogHeader>
          <DialogTitle>Follow-Up Thread</DialogTitle>
          {thread[0]?.name && (
            <p className="text-xs text-gray-500 mt-1">{thread[0].name}</p>
          )}
        </DialogHeader>

        <div className="py-3 max-h-[60vh] overflow-y-auto">
          {isFetching && (
            <div className="flex items-center justify-center gap-2 py-10 text-gray-500">
              <Loader2 className="size-4 animate-spin" />
              Loading thread...
            </div>
          )}

          {!isFetching && thread.length === 0 && (
            <div className="text-center text-sm text-gray-500 py-10">
              No records found for this thread.
            </div>
          )}

          {!isFetching && thread.length > 0 && (
            <div className="flex flex-col">
              {displayThread.map(({ item, originalIndex }, dispIndex) => {
                const parent = findParent(item);
                const canDelete = originalIndex > 0 && !hasChildren(item);
                return (
                  <div key={item._id} className="relative pl-6">
                    {dispIndex > 0 && (
                      <span className="absolute left-[7px] top-0 h-4 w-px bg-slate-300 dark:bg-slate-600" />
                    )}
                    {dispIndex < displayThread.length - 1 && (
                      <span className="absolute left-[7px] top-4 bottom-0 w-px bg-slate-300 dark:bg-slate-600" />
                    )}
                    <span className="absolute left-0.5 top-4 size-3 rounded-full border-2 border-primary bg-white dark:bg-slate-900" />

                    <div className="mb-4 rounded-lg border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-800/40 p-3">
                      <div className="mb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
                              {originalIndex === 0 ? "Original" : `Follow-Up ${originalIndex}`}
                            </span>
                            <span
                              className={`badge badge-sm badge-outline capitalize ${statusColorMap[item.status] || "badge-secondary"}`}
                            >
                              {LabelMap[item.status] || item.status}
                            </span>
                          </div>
                          {/* Edit/Delete always sit in the card's top-right corner,
                              regardless of screen size. */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              className="inline-flex items-center justify-center size-7 rounded-md text-slate-500 dark:text-slate-400 hover:bg-slate-200/70 hover:text-primary dark:hover:bg-slate-700/60 dark:hover:text-primary transition-colors"
                              onClick={() => onEditItem(item, parent)}
                              title="Edit this entry"
                            >
                              <Pencil className="size-3.5" />
                            </button>
                            {originalIndex > 0 && (
                              <button
                                type="button"
                                disabled={!canDelete}
                                className="inline-flex items-center justify-center size-7 rounded-md text-slate-500 dark:text-slate-400 hover:bg-danger/10 hover:text-danger dark:hover:bg-danger/10 dark:hover:text-danger transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-500"
                                onClick={() => canDelete && setDeleteTarget(item)}
                                title={canDelete ? "Delete this follow-up" : "Delete its own follow-up(s) first"}
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                        <span className="block mt-1 text-[11px] text-gray-500 whitespace-nowrap">
                          {item.createdAt ? new Date(item.createdAt).toLocaleString() : "—"}
                        </span>
                      </div>

                      {parent && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                          Replying to{" "}
                          <span className="font-medium">
                            {parent.previousLiveIdea === null
                              ? "Original"
                              : `Follow-Up (${LabelMap[parent.status] || parent.status})`}
                          </span>{" "}
                          · {parent.createdAt ? new Date(parent.createdAt).toLocaleDateString() : ""}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                        <span className="flex flex-col gap-0.5">
                          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Direction</span>
                          <span className="text-xs font-medium text-slate-800 dark:text-slate-100 capitalize">{item.type || "—"}</span>
                        </span>
                        {item.invalidation !== undefined && item.invalidation !== null && (
                          <span className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Invalidation</span>
                            <span className="text-xs font-medium text-slate-800 dark:text-slate-100">{item.invalidation}</span>
                          </span>
                        )}
                        {item.exits && item.exits.length > 0 && (
                          <span className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Exits</span>
                            <span className="text-xs font-medium text-slate-800 dark:text-slate-100">{item.exits.join(", ")}</span>
                          </span>
                        )}
                        {item.category?.name && (
                          <span className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Category</span>
                            <span className="text-xs font-medium text-slate-800 dark:text-slate-100">{item.category.name}</span>
                          </span>
                        )}
                        {!!item.pips && (
                          <span className="flex flex-col gap-0.5">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Pips</span>
                            <span className="text-xs font-medium text-slate-800 dark:text-slate-100">{item.pips}</span>
                          </span>
                        )}
                        {item.description && (
                          <span className="flex flex-col gap-0.5 w-full">
                            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Description</span>
                            <div
                              className="text-xs text-slate-700 dark:text-slate-200 [&_p]:m-0"
                              dangerouslySetInnerHTML={{ __html: item.description }}
                            />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {!isFetching && latest && (
          <div className="flex justify-end border-t border-slate-200 dark:border-slate-700/60 pt-3">
            <button
              type="button"
              className="btn btn-primary btn-sm flex items-center gap-1.5"
              onClick={() => onAddFollowUp(latest)}
            >
              <Plus className="size-4" /> Add Follow-Up
            </button>
          </div>
        )}
      </DialogContent>

      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="p-6 max-w-[420px]">
          <div className="flex flex-col items-center text-center gap-3">
            <span className="flex items-center justify-center size-12 rounded-full bg-danger/10">
              <Trash2 className="size-5 text-danger" />
            </span>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Delete this follow-up?
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                It will be removed from the admin, educator, and student sides —
                including the Educator Feed and IQ Social.
              </p>
            </div>
          </div>
          <div className="flex justify-center items-center gap-3 mt-6">
            <button className="btn btn-light" onClick={() => setDeleteTarget(null)}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-danger"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
            >
              {isDeleting ? "Deleting..." : "Yes, delete it"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default FollowUpThreadModal;

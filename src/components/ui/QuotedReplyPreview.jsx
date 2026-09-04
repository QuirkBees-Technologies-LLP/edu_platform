import React from "react";
import { Link2, Loader2 } from "lucide-react";

// Telegram/WhatsApp-style quote-reply preview for a follow-up post: a condensed preview
// of the ORIGINAL message it's replying to (thumbnail + "Follow Up To <title>"), rather
// than just a "Follow-up to X" text link — so the reply's context is visible inline.
// Clicking anywhere on it navigates to the original, same as the old link did. No
// enclosing background/box — just the left accent bar, so it reads as part of the card
// rather than a bordered box sitting inside it.
//
// isLoading: true while the click's fetch-and-open (or fetch-and-navigate-deeper) is in
// flight — swaps the icon for a spinner, dims the row, and disables further clicks so a
// second click can't fire a duplicate fetch while the first is still resolving.
//
// The thumbnail slot is always reserved at a fixed size, whether or not this particular
// follow-up actually has one, and even when there's no follow-up at all (reserveSpace).
// Without this, a card whose follow-up happens to include a thumbnail renders a taller
// block than one that doesn't — or than a card with no follow-up at all — pushing the
// header/image below it down by a few pixels and breaking row alignment across
// otherwise-identical cards.
//
// reserveSpace: when there's no follow-up, render an invisible placeholder of the same
// shape instead of nothing — used on grid/slider layouts (e.g. the educator profile's
// card grid) where cards without a follow-up would otherwise sit shorter and misalign
// with cards that have one.
const QuotedReplyPreview = ({ title, thumbnail, onClick, reserveSpace = false, isLoading = false }) => {
  const hasFollowUp = !!title;
  if (!hasFollowUp && !reserveSpace) return null;

  const clickable = hasFollowUp && !isLoading;

  return (
    <div
      role={hasFollowUp ? "button" : undefined}
      tabIndex={hasFollowUp ? 0 : undefined}
      aria-hidden={hasFollowUp ? undefined : true}
      aria-busy={isLoading || undefined}
      onClick={clickable ? onClick : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick?.(e);
              }
            }
          : undefined
      }
      className={`mb-2 flex items-stretch gap-2 border-l-[3px] pl-2.5 py-1.5 w-full text-left ${
        hasFollowUp
          ? `border-primary rounded-r-lg transition-colors ${isLoading ? "opacity-60 cursor-wait" : "hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
          }`
          : "invisible"
      }`}
    >
      {/* Thumbnail slot — always this exact size, image or not, so the row's height (and
          everything stacked below it) never shifts depending on whether a given follow-up
          happens to have one. */}
      <div className="w-9 h-9 rounded flex-shrink-0 overflow-hidden">
        {thumbnail && !isLoading && (
          <img src={thumbnail} alt="" className="w-9 h-9 rounded object-cover" />
        )}
      </div>
      <div className="min-w-0 flex-1 flex items-center">
        <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
          {isLoading ? (
            <Loader2 size={10} className="flex-shrink-0 animate-spin" />
          ) : (
            <Link2 size={10} className="flex-shrink-0" />
          )}
          <span className="truncate">{title ? `Follow Up To ${title}` : " "}</span>
        </div>
      </div>
    </div>
  );
};

export default QuotedReplyPreview;

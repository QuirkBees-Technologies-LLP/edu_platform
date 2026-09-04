import React from "react";
import { Link2 } from "lucide-react";

// Strips HTML so the quote snippet reads as plain text (descriptions are stored/rendered
// as rich HTML elsewhere via dangerouslySetInnerHTML) — a DOM parse is more reliable than
// a tag-stripping regex for things like &amp; entities and nested tags.
const stripHtml = (html) => {
  if (!html) return "";
  try {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return (doc.body.textContent || "").trim();
  } catch {
    return String(html).replace(/<[^>]+>/g, "").trim();
  }
};

// Telegram/WhatsApp-style quote-reply preview for a follow-up post: a condensed preview
// of the ORIGINAL message it's replying to (thumbnail + title + a text snippet), rather
// than just a "Follow-up to X" text link — so the reply's context is visible inline.
// Clicking anywhere on it navigates to the original, same as the old link did.
//
// reserveSpace: when there's no follow-up, render an invisible placeholder of the same
// shape instead of nothing — used on grid/slider layouts (e.g. the educator profile's
// card grid) where cards without a follow-up would otherwise sit shorter and misalign
// with cards that have one.
const QuotedReplyPreview = ({ title, description, thumbnail, onClick, reserveSpace = false }) => {
  const snippet = stripHtml(description);

  if (!title) {
    if (!reserveSpace) return null;
    return (
      <div
        aria-hidden="true"
        className="mb-2 invisible flex items-stretch gap-2 rounded-lg border-l-[3px] pl-2.5 pr-2 py-1.5 w-full"
      >
        <div className="min-w-0 flex-1 flex flex-col justify-center">
          <div className="flex items-center gap-1 text-[10px] font-semibold">
            <Link2 size={10} className="flex-shrink-0" />
            <span>placeholder</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.(e);
        }
      }}
      className="mb-2 flex items-stretch gap-2 rounded-lg border-l-[3px] border-primary bg-slate-100/70 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer pl-2.5 pr-2 py-1.5 w-full text-left"
    >
      {thumbnail && (
        <img
          src={thumbnail}
          alt=""
          className="w-9 h-9 rounded object-cover flex-shrink-0"
        />
      )}
      <div className="min-w-0 flex-1 flex flex-col justify-center">
        <div className="flex items-center gap-1 text-[10px] font-semibold text-primary">
          <Link2 size={10} className="flex-shrink-0" />
          <span className="truncate">{title}</span>
        </div>
        {snippet && (
          <p className="text-[11px] text-slate-500 dark:text-white/50 truncate">
            {snippet}
          </p>
        )}
      </div>
    </div>
  );
};

export default QuotedReplyPreview;

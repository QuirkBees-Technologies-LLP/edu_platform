import React, { useLayoutEffect, useRef, useState } from "react";

const TEXT_CLASS = "text-[15px] font-medium leading-[22px] text-slate-800 dark:text-slate-100";
const TOGGLE_CLASS =
  "text-[12px] font-semibold leading-[22px] text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors";
// Block-level markup from the rich-text editor is forced inline in the collapsed teaser so
// the toggle can sit on the same line as the text it follows — a trailing <p> would
// otherwise push it onto a line of its own.
const INLINE_CHILDREN = "[&_p]:inline [&_p]:m-0 [&_div]:inline";
const LINE_HEIGHT = 22; // leading-[22px], in px
const MAX_LINES = 2;

// Returns `root`'s HTML truncated to `limit` visible characters, with tags kept balanced
// and any trailing whitespace trimmed (so the ellipsis butts directly against the last
// character rather than sitting after a stray space).
const truncateToChars = (root, limit) => {
  const clone = root.cloneNode(true);
  let remaining = limit;
  let done = false;

  const walk = (node) => {
    for (const child of Array.from(node.childNodes)) {
      if (done) {
        node.removeChild(child);
        continue;
      }
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent;
        if (text.length <= remaining) {
          remaining -= text.length;
        } else {
          child.textContent = text.slice(0, remaining).replace(/\s+$/, "");
          remaining = 0;
          done = true;
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      } else {
        node.removeChild(child);
      }
    }
  };

  walk(clone);
  return clone.innerHTML;
};

// Idea / Live Idea card description: shown as a 2-line teaser ending in "…Read More",
// expandable to the full text.
//
// The cut point is found by binary-searching the character count that still fits in two
// lines *with the toggle rendered inline beside it*, measured in a hidden twin of the real
// container at the same width. That's what makes the text end flush against the link:
// CSS-only approaches (line-clamp, or floating the toggle into the text) can only break at
// word boundaries, so whenever the next word was too long to fit they left a visible gap
// before the link. Truncating by character removes that gap entirely.
//
// Truncation walks the DOM rather than slicing the HTML string, so the description's real
// markup — bold, links — survives in the teaser instead of being stripped or left with
// broken tags.
//
// Re-measured on width changes, since these cards render at several widths (full-width
// list, 3-up grid, sidebar feed) and the same text wraps differently in each.
const ExpandableDescription = ({ html }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // null means the description fits in two lines as-is, so no toggle is needed.
  const [collapsedHtml, setCollapsedHtml] = useState(null);
  const [width, setWidth] = useState(0);
  const containerRef = useRef(null);
  const measureRef = useRef(null);

  // Track the container's width so the measurement below re-runs when the card resizes.
  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const read = () => setWidth(el.clientWidth);
    read();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(read);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isExpanded]);

  // Layout effect, not a plain effect: this decides the final text, so running it before
  // paint avoids a frame of untruncated text flashing in the clipped box.
  useLayoutEffect(() => {
    if (isExpanded || !html) return;
    const measure = measureRef.current;
    if (!measure || !width) return;

    measure.style.width = `${width}px`;
    const maxHeight = LINE_HEIGHT * MAX_LINES + 1; // +1 for sub-pixel rounding

    measure.innerHTML = html;
    if (measure.scrollHeight <= maxHeight) {
      setCollapsedHtml(null);
      return;
    }

    const source = document.createElement("div");
    source.innerHTML = html;
    // Measured as a <button>, matching what actually renders — a <span> is inline where a
    // button is inline-block, which lays out just differently enough to shift the cut point.
    const toggleHtml = `<button class="${TOGGLE_CLASS}">…Read More</button>`;

    let lo = 0;
    let hi = source.textContent.length;
    let best = "";
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const candidate = truncateToChars(source, mid);
      measure.innerHTML = candidate + toggleHtml;
      if (measure.scrollHeight <= maxHeight) {
        best = candidate;
        lo = mid + 1;
      } else {
        hi = mid - 1;
      }
    }

    setCollapsedHtml(best);
  }, [html, width, isExpanded]);

  if (!html) return null;

  // Several of these cards open their details modal from an ancestor click handler —
  // expanding the caption must not also trigger that.
  const toggle = (e) => {
    e.stopPropagation();
    setIsExpanded((v) => !v);
  };

  if (isExpanded) {
    return (
      <div className="px-1 py-1">
        <div className={TEXT_CLASS} dangerouslySetInnerHTML={{ __html: html }} />
        <button type="button" onClick={toggle} className={`mt-0.5 ${TOGGLE_CLASS}`}>
          Read Less
        </button>
      </div>
    );
  }

  const isTruncated = collapsedHtml !== null;

  return (
    <div className="relative px-1 py-1">
      <div
        ref={containerRef}
        className={`max-h-[44px] overflow-hidden ${TEXT_CLASS} ${INLINE_CHILDREN}`}
      >
        <span dangerouslySetInnerHTML={{ __html: isTruncated ? collapsedHtml : html }} />
        {isTruncated && (
          <button type="button" onClick={toggle} className={TOGGLE_CLASS}>
            …Read More
          </button>
        )}
      </div>
      {/* Hidden twin used only for measuring candidate cut points: same width and text
          styling as the real box, but unclipped so its full height can be read. */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className={`${TEXT_CLASS} ${INLINE_CHILDREN}`}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          visibility: "hidden",
          pointerEvents: "none",
          zIndex: -1,
        }}
      />
    </div>
  );
};

export default ExpandableDescription;

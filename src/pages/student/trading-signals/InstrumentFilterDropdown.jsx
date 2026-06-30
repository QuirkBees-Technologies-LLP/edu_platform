import React, { useState, useRef, useEffect, useCallback } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import instrumentCategories from "./instrumentData";

// ── Cascading Multi-Select Instrument Filter Dropdown ───────────────
// Shows 4 categories (Forex, Crypto, Indices, Commodities).
// On hover over a category, a submenu slides open with checkboxes.
// All instruments are checked by default.

// Flatten all symbols for counting
const ALL_SYMBOLS = instrumentCategories.flatMap((c) =>
  c.instruments.map((i) => i.symbol)
);

const InstrumentFilterDropdown = ({ excludedValues = [], onExcludedChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const rootRef = useRef(null);
  const closeTimerRef = useRef(null);
  const submenuTimerRef = useRef(null);

  // ── Close on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveCategory(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Cleanup timers on unmount ───────────────────────────────────
  useEffect(() => {
    return () => {
      clearTimeout(closeTimerRef.current);
      clearTimeout(submenuTimerRef.current);
    };
  }, []);

  // ── Toggle single symbol ────────────────────────────────────────
  const toggleSymbol = (symbol) => {
    if (excludedValues.includes(symbol)) {
      onExcludedChange(excludedValues.filter((v) => v !== symbol));
    } else {
      onExcludedChange([...excludedValues, symbol]);
    }
  };

  // ── Toggle entire category ──────────────────────────────────────
  const toggleCategory = (cat) => {
    const catSymbols = cat.instruments.map((i) => i.symbol);
    const allCatChecked = catSymbols.every((s) => !excludedValues.includes(s));

    if (allCatChecked) {
      // Uncheck all in this category
      onExcludedChange([...excludedValues, ...catSymbols]);
    } else {
      // Check all in this category
      onExcludedChange(excludedValues.filter((v) => !catSymbols.includes(v)));
    }
  };

  // ── Toggle all symbols ──────────────────────────────────────────
  const toggleAll = () => {
    if (excludedValues.length === 0) {
      onExcludedChange([...ALL_SYMBOLS]);
    } else {
      onExcludedChange([]);
    }
  };

  // ── Category hover handling with delay to prevent flicker ───────
  const handleCategoryEnter = (catKey) => {
    clearTimeout(submenuTimerRef.current);
    setActiveCategory(catKey);
  };

  const handleCategoryLeave = () => {
    submenuTimerRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 150);
  };

  const handleSubmenuEnter = () => {
    clearTimeout(submenuTimerRef.current);
  };

  const handleSubmenuLeave = () => {
    submenuTimerRef.current = setTimeout(() => {
      setActiveCategory(null);
    }, 150);
  };

  // ── Root hover handling — keep menu open ────────────────────────
  const handleRootEnter = () => {
    clearTimeout(closeTimerRef.current);
  };

  const handleRootLeave = () => {
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false);
      setActiveCategory(null);
    }, 300);
  };

  const activeCat = instrumentCategories.find(
    (c) => c.key === activeCategory
  );

  const allChecked = excludedValues.length === 0;
  const validExcluded = excludedValues.filter((v) => ALL_SYMBOLS.includes(v));
  const noneChecked = validExcluded.length >= ALL_SYMBOLS.length;
  const checkedCount = Math.max(0, ALL_SYMBOLS.length - validExcluded.length);

  // Global checkbox state: checked / indeterminate / unchecked
  const globalCheckState = allChecked
    ? true
    : noneChecked
      ? false
      : "indeterminate";

  // Trigger display text — always show count
  const triggerText = allChecked
    ? `All Symbols (${ALL_SYMBOLS.length}/${ALL_SYMBOLS.length})`
    : noneChecked
      ? "None selected"
      : `${checkedCount}/${ALL_SYMBOLS.length} selected`;

  return (
    <div className="flex flex-col gap-1.5 relative" ref={rootRef}>
      {/* Label */}
      <label className="block text-[10px] font-bold text-gray-500 dark:text-white uppercase tracking-wider">
        Symbol
      </label>

      {/* ── Trigger Button ── */}
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (isOpen) setActiveCategory(null);
        }}
        className={`
          group flex items-center justify-between gap-2
          w-[200px] h-10 px-3
          rounded-md border text-xs font-medium
          transition-all duration-200 cursor-pointer
          border-slate-200 dark:border-[#202038] bg-white dark:bg-[#0F0F1A]
          ${!allChecked ? "text-slate-900 dark:text-white" : "text-slate-700 dark:text-white"}
          hover:border-gray-400
          focus:outline-none
        `}
      >
        <span className="truncate">{triggerText}</span>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* ── Dropdown ── */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1.5 z-50 flex"
          onMouseEnter={handleRootEnter}
          onMouseLeave={handleRootLeave}
        >
          {/* ── Main Category Menu ── */}
          <div
            className="
              w-[200px] py-1
              bg-popover text-popover-foreground
              border rounded-md shadow-md
              overflow-hidden
            "
          >
            {/* Select All / Deselect All */}
            <div
              onClick={toggleAll}
              className={`
                w-full flex items-center gap-2.5 px-3 py-2.5 text-xs
                transition-all duration-150 cursor-pointer
                hover:bg-accent hover:text-accent-foreground
                ${allChecked ? "font-semibold" : ""}
              `}
            >
              <Checkbox
                checked={globalCheckState}
                onCheckedChange={() => {}}
                className="h-4 w-4"
              />
              <span>{allChecked ? "Deselect All" : "Select All"}</span>
              <span className="text-[10px] text-muted-foreground ml-auto">
                {checkedCount}/{ALL_SYMBOLS.length}
              </span>
            </div>

            <div className="mx-3 my-1 border-t border-border" />

            {/* Category items */}
            {instrumentCategories.map((cat) => {
              const catSymbols = cat.instruments.map((i) => i.symbol);
              const catCheckedCount = catSymbols.filter(
                (s) => !excludedValues.includes(s)
              ).length;
              const allCatChecked = catCheckedCount === catSymbols.length;
              const noneCatChecked = catCheckedCount === 0;
              const isActive = activeCategory === cat.key;

              // Category checkbox state: checked / indeterminate / unchecked
              const catCheckState = allCatChecked
                ? true
                : noneCatChecked
                  ? false
                  : "indeterminate";

              return (
                <div
                  key={cat.key}
                  onMouseEnter={() => handleCategoryEnter(cat.key)}
                  onMouseLeave={handleCategoryLeave}
                  className={`
                    relative flex items-center justify-between gap-2 px-3 py-2.5
                    cursor-pointer transition-all duration-150
                    ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    }
                  `}
                >
                  <span className="flex items-center gap-2.5 text-xs font-medium">
                    <Checkbox
                      checked={catCheckState}
                      onCheckedChange={() => toggleCategory(cat)}
                      className="h-4 w-4"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {cat.label}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="text-[10px] text-muted-foreground">
                      {catCheckedCount}/{catSymbols.length}
                    </span>
                    <ChevronRight
                      size={13}
                      className={`transition-all duration-200 ${
                        isActive
                          ? "text-slate-700 dark:text-white translate-x-0.5"
                          : "text-slate-300 dark:text-slate-600"
                      }`}
                    />
                  </span>
                </div>
              );
            })}
          </div>

          {/* ── Submenu ── */}
          {activeCat && (
            <div
              className="
                ml-1 w-[220px] py-1
                bg-popover text-popover-foreground
                border rounded-md shadow-md
                max-h-[380px] overflow-y-auto
                animate-in fade-in-0 slide-in-from-left-2 duration-150
              "
              style={{
                scrollbarWidth: "thin",
                scrollbarColor:
                  "rgba(100,116,139,0.2) transparent",
              }}
              onMouseEnter={handleSubmenuEnter}
              onMouseLeave={handleSubmenuLeave}
            >
              {/* "All [Category]" toggle at top of submenu */}
              {(() => {
                const catSymbols = activeCat.instruments.map((i) => i.symbol);
                const catCheckedCount = catSymbols.filter(
                  (s) => !excludedValues.includes(s)
                ).length;
                const allCatChecked = catCheckedCount === catSymbols.length;
                const noneCatChecked = catCheckedCount === 0;
                const catCheckState = allCatChecked
                  ? true
                  : noneCatChecked
                    ? false
                    : "indeterminate";

                return (
                  <>
                    <div
                      onClick={() => toggleCategory(activeCat)}
                      className={`
                        w-full flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold
                        transition-all duration-150 cursor-pointer
                        hover:bg-accent hover:text-accent-foreground
                      `}
                    >
                      <Checkbox
                        checked={catCheckState}
                        onCheckedChange={() => {}}
                        className="h-4 w-4"
                      />
                      <span>All {activeCat.label}</span>
                      <span className="text-[10px] text-muted-foreground ml-auto">
                        {catCheckedCount}/{catSymbols.length}
                      </span>
                    </div>
                    <div className="mx-3 my-1 border-t border-border" />
                  </>
                );
              })()}

              {/* Instrument items */}
              {activeCat.instruments.map((inst) => {
                const isChecked = !excludedValues.includes(inst.symbol);
                return (
                  <div
                    key={inst.symbol}
                    onClick={() => toggleSymbol(inst.symbol)}
                    className={`
                      w-full flex items-center gap-2.5 px-3 py-2 text-xs
                      transition-all duration-150 cursor-pointer text-left
                      hover:bg-accent hover:text-accent-foreground
                      ${!isChecked ? "opacity-60" : ""}
                    `}
                  >
                    <Checkbox
                      checked={isChecked}
                      onCheckedChange={() => {}}
                      className="h-4 w-4"
                    />
                    <span className="text-[11px]">
                      {inst.symbol}
                    </span>
                    {inst.label !== inst.symbol && (
                      <span className="text-[10px] text-muted-foreground">
                        {inst.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InstrumentFilterDropdown;

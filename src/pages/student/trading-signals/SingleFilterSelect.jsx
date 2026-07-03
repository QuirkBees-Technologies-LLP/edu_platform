import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Info } from "lucide-react";

// ── Single-Select Radio Filter Dropdown ───────────────────────────
// Only one option can be selected at a time (radio behaviour).
// Used for mandatory single-selection filters like DeFy Execution Type.

const SingleFilterSelect = ({
  label,
  options,          // [{ value: "confirmed", label: "Market Execution" }, ...]
  selectedValue,    // string — currently selected value ("" = nothing selected)
  onSelect,         // (value: string) => void
  placeholder,      // e.g. "Select Execution Type"
  required,         // boolean — shows required indicator (asterisk)
  error,            // boolean — shows error styling (red border + message)
  infoText,         // string — optional tooltip text shown via info icon
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const rootRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const safeOptions = options || [];
  const selectedOption = safeOptions.find((o) => o.value === selectedValue);
  const triggerText = selectedOption
    ? selectedOption.label
    : placeholder || "Select…";

  return (
    <div className="flex flex-col gap-1.5 relative flex-1 min-w-[130px]" ref={rootRef}>
      <div className="flex items-center gap-1">
        <label className="block text-[10px] font-bold text-gray-500 dark:text-white uppercase tracking-wider">
          {label}
          {required && <span className="text-amber-400 ml-0.5">*</span>}
        </label>
        {infoText && (
          <div className="relative">
            <Info
              size={13}
              className="text-slate-400 dark:text-slate-500 hover:text-blue-400 dark:hover:text-blue-400 cursor-help transition-colors"
              onMouseEnter={() => setShowInfo(true)}
              onMouseLeave={() => setShowInfo(false)}
            />
            {showInfo && (
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-[280px] px-3.5 py-3 rounded-lg bg-slate-800 dark:bg-slate-900 border border-slate-700 dark:border-slate-700 shadow-xl text-[11.5px] text-slate-200 leading-relaxed pointer-events-none">
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-[5px] border-transparent border-t-slate-800 dark:border-t-slate-900" />
                {infoText}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`
          flex items-center justify-between gap-2
          w-full h-10 px-3
          rounded-md border text-xs font-medium
          transition-all duration-200 cursor-pointer
          ${error
            ? "border-amber-400/70 dark:border-amber-500/50 bg-amber-50/40 dark:bg-amber-500/5"
            : "border-slate-200 dark:border-[#202038] bg-white dark:bg-[#0F0F1A]"
          }
          ${selectedOption
            ? "text-slate-900 dark:text-white"
            : "text-slate-400 dark:text-slate-500"
          }
          hover:border-gray-400
          focus:outline-none
        `}
      >
        <span className="truncate">{triggerText}</span>
        <ChevronDown
          size={14}
          className={`text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {/* Error hint — shown only when dropdown is closed */}
      {error && !isOpen && (
        <span className="text-[10px] text-amber-500/80 dark:text-amber-400/70 font-medium absolute -bottom-5 left-0.5 whitespace-nowrap">
          Selection required
        </span>
      )}

      {/* Dropdown */}
      {isOpen && (
        <div
          className="
            absolute top-full left-0 mt-1.5 z-50
            w-[180px] py-1
            bg-popover text-popover-foreground
            border rounded-md shadow-md
            max-h-[320px] overflow-y-auto
          "
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(100,116,139,0.2) transparent",
          }}
        >
          {safeOptions.map((opt) => {
            const isSelected = opt.value === selectedValue;
            return (
              <div
                key={opt.value}
                onClick={() => {
                  onSelect?.(opt.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2 text-xs
                  transition-all duration-150 cursor-pointer text-left
                  hover:bg-accent hover:text-accent-foreground
                  ${isSelected ? "font-semibold" : "opacity-80"}
                `}
              >
                {/* Radio circle */}
                <span
                  className={`
                    flex items-center justify-center w-4 h-4 rounded-full border-2 shrink-0
                    transition-colors duration-150
                    ${isSelected
                      ? "border-blue-500 bg-blue-500"
                      : "border-slate-300 dark:border-slate-600"
                    }
                  `}
                >
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </span>
                <span>{opt.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SingleFilterSelect;

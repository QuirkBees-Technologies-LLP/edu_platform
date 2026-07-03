import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

// ── Multi-Select Checkbox Filter Dropdown ─────────────────────────
// All options checked by default. Unchecking excludes values.

const FilterSelect = ({
  label,
  options,          // [{ value: "BUY", label: "BUY" }, ...]  — NO "All" option
  excludedValues = [],   // string[] of unchecked values
  onExcludedChange, // (newExcluded: string[]) => void
  placeholder,      // e.g. "All Types"
}) => {
  const [isOpen, setIsOpen] = useState(false);
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
  const safeExcluded = excludedValues || [];
  const allChecked = safeExcluded.length === 0;
  const checkedCount = Math.max(0, safeOptions.length - safeExcluded.filter((v) => safeOptions.some((o) => o.value === v)).length);

  const toggleValue = (val) => {
    if (safeExcluded.includes(val)) {
      onExcludedChange?.(safeExcluded.filter((v) => v !== val));
    } else {
      onExcludedChange?.([...safeExcluded, val]);
    }
  };

  const toggleAll = () => {
    if (allChecked) {
      // Uncheck all
      onExcludedChange?.(safeOptions.map((o) => o.value));
    } else {
      // Check all
      onExcludedChange?.([]);
    }
  };

  // Display text on the trigger button — always show count
  const triggerText = allChecked
    ? `${placeholder} (${safeOptions.length}/${safeOptions.length})`
    : checkedCount === 0
      ? `No ${label} selected`
      : `${checkedCount}/${safeOptions.length} selected`;

  return (
    <div className="flex flex-col gap-1.5 relative flex-1 min-w-[130px]" ref={rootRef}>
      <label className="block text-[10px] font-bold text-gray-500 dark:text-white uppercase tracking-wider">
        {label}
      </label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`
          flex items-center justify-between gap-2
          w-full h-10 px-3
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
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="
            absolute top-full left-0 mt-1.5 z-50
            w-[155px] py-1
            bg-popover text-popover-foreground
            border rounded-md shadow-md
            max-h-[320px] overflow-y-auto
          "
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(100,116,139,0.2) transparent",
          }}
        >
          {/* Select All / Deselect All */}
          <div
            onClick={toggleAll}
            className={`
              w-full flex items-center gap-2.5 px-3 py-2 text-xs
              transition-all duration-150 cursor-pointer
              hover:bg-accent hover:text-accent-foreground
              ${allChecked ? "font-semibold" : ""}
            `}
          >
            <Checkbox
              checked={allChecked}
              onCheckedChange={() => { }}
              className="h-4 w-4"
            />
            <span>{allChecked ? "Deselect All" : "Select All"}</span>
          </div>

          <div className="mx-3 my-1 border-t border-border" />

          {/* Options */}
          {safeOptions.map((opt) => {
            const isChecked = !safeExcluded.includes(opt?.value);
            return (
              <div
                key={opt.value}
                onClick={() => toggleValue(opt.value)}
                className={`
                  w-full flex items-center gap-2.5 px-3 py-2 text-xs
                  transition-all duration-150 cursor-pointer text-left
                  hover:bg-accent hover:text-accent-foreground
                  ${isChecked ? "" : "opacity-60"}
                `}
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => { }}
                  className="h-4 w-4"
                />
                <span>{opt.label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FilterSelect;

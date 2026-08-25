import React, { useState, useRef, useEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  STRATEGIES_MAP,
  STRATEGY_TIMEFRAME_MAP,
  STRATEGY_DEFAULT_TIMEFRAME_MAP,
} from "@/config/strategyConfig";

// ── Strategy-Specific Timeframe Filter Dropdown ───────────────────
// Displays a separate section per active strategy, each with its own
// checkbox list of timeframes. Replaces the old global FilterSelect
// for timeframes.
//
// Props:
//   activeStrategyNames  — string[] of currently selected strategy display names
//                          e.g. ["React", "Defy", "Killshot"]
//   strategyTimeframes   — { [strategyKey]: string[] } map of selected TFs per strategy
//                          e.g. { react: ["1m","5m"], defy: ["5m","15m"] }
//   onStrategyTimeframesChange — (newMap: object) => void
//   strategyOptions      — [{ value: "React", label: "React" }] from API

// ── Map display name → config key ──────────────────────────────────
const nameToKey = (name) => {
  if (!name) return null;
  const lower = name.toLowerCase().replace(/\s+/g, "_");
  // Try direct lookup first
  if (STRATEGIES_MAP[lower]) return lower;
  // Try matching by name field
  for (const [key, config] of Object.entries(STRATEGIES_MAP)) {
    if (config.name.toLowerCase() === name.toLowerCase()) return key;
  }
  return lower;
};

const TimeframeFilterDropdown = ({
  activeStrategyNames = [],
  strategyTimeframes = {},
  onStrategyTimeframesChange,
  strategyOptions = [],
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

  // Build sections: one per active strategy
  const sections = useMemo(() => {
    return activeStrategyNames
      .map((name) => {
        const key = nameToKey(name);
        if (!key) return null;
        const allTfs = STRATEGY_TIMEFRAME_MAP[key];
        if (!allTfs || allTfs.length === 0) return null;
        return {
          key,
          name,
          allTimeframes: allTfs,
          selectedTimeframes: strategyTimeframes[key] || STRATEGY_DEFAULT_TIMEFRAME_MAP[key] || allTfs, // default from config
        };
      })
      .filter(Boolean);
  }, [activeStrategyNames, strategyTimeframes]);

  // ── Counts ────────────────────────────────────────────────────────
  const totalSelected = sections.reduce(
    (sum, s) => sum + s.selectedTimeframes.length,
    0
  );
  const totalAll = sections.reduce(
    (sum, s) => sum + s.allTimeframes.length,
    0
  );
  const allChecked = totalSelected === totalAll;

  // ── Toggle a single timeframe in a strategy ───────────────────────
  const toggleTimeframe = (strategyKey, tf) => {
    const current = strategyTimeframes[strategyKey] || STRATEGY_DEFAULT_TIMEFRAME_MAP[strategyKey] || [];
    const isSelected = current.includes(tf);
    const updated = isSelected
      ? current.filter((t) => t !== tf)
      : [...current, tf];
    onStrategyTimeframesChange?.({
      ...strategyTimeframes,
      [strategyKey]: updated,
    });
  };

  // ── Select/Deselect all for a single strategy ─────────────────────
  const toggleAllForStrategy = (strategyKey) => {
    const allTfs = STRATEGY_TIMEFRAME_MAP[strategyKey] || [];
    const defaultTfs = STRATEGY_DEFAULT_TIMEFRAME_MAP[strategyKey] || allTfs;
    const current = strategyTimeframes[strategyKey] || defaultTfs;
    const allSelected = current.length === allTfs.length;
    onStrategyTimeframesChange?.({
      ...strategyTimeframes,
      [strategyKey]: allSelected ? [] : [...allTfs],
    });
  };

  // ── Trigger text ──────────────────────────────────────────────────
  const triggerText = allChecked
    ? `All Time Frames (${totalAll}/${totalAll})`
    : totalSelected === 0
      ? "No Time Frames selected"
      : `${totalSelected}/${totalAll} selected`;

  return (
    <div className="flex flex-col gap-1.5 relative flex-1 min-w-[130px]" ref={rootRef}>
      <label className="block text-[10px] font-bold text-gray-500 dark:text-white uppercase tracking-wider">
        Time Frame
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
          className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className="
            absolute top-full mt-1.5 z-[5]
            left-1/2 -translate-x-1/2
            p-3
            bg-white dark:bg-[#1A1A2E] text-slate-900 dark:text-white
            border border-slate-200 dark:border-[#2A2A4A] rounded-lg shadow-2xl
          "
          style={{ 
            width: sections.length > 0 ? `${sections.length * 130 + (sections.length - 1) * 16}px` : "200px",
            maxWidth: "min(95vw, 1400px)" 
          }}
        >
          {sections.length === 0 ? (
            <div className="px-3 py-4 text-xs text-slate-400 dark:text-slate-500 text-center w-full">
              Select a strategy to see its timeframes
            </div>
          ) : (
            <div
              className="grid gap-4 w-full"
              style={{
                gridTemplateColumns: `repeat(auto-fit, minmax(120px, 1fr))`,
              }}
            >
              {sections.map((section) => {
                const sectionAllSelected =
                  section.selectedTimeframes.length === section.allTimeframes.length;

                return (
                  <div
                    key={section.key}
                    className="flex flex-col border border-slate-200 dark:border-[#2A2A4A] rounded-lg overflow-hidden h-full"
                  >
                    {/* Section Header */}
                    <div 
                      className="px-2.5 pt-2.5 pb-2 flex items-center gap-2.5 bg-slate-50 dark:bg-[#202038] border-b border-slate-200 dark:border-[#2A2A4A] cursor-pointer hover:bg-slate-100 dark:hover:bg-[#2A2A4A] transition-colors"
                      onClick={() => toggleAllForStrategy(section.key)}
                    >
                      <Checkbox
                        checked={sectionAllSelected}
                        onCheckedChange={() => {}}
                        className="h-4 w-4"
                      />
                      <span className="text-[11px] font-bold text-blue-500 dark:text-blue-400 uppercase tracking-wider">
                        {section.name}
                      </span>
                    </div>

                    {/* Timeframe Checkboxes */}
                    <div className="p-1.5 flex-1 flex flex-col gap-0.5">
                      {section.allTimeframes.map((tf) => {
                        const isChecked = section.selectedTimeframes.includes(tf);
                        return (
                          <div
                            key={`${section.key}-${tf}`}
                            onClick={() => toggleTimeframe(section.key, tf)}
                            className={`
                              w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs
                              transition-all duration-150 cursor-pointer text-left rounded
                              hover:bg-accent hover:text-accent-foreground
                              ${isChecked ? "" : "opacity-50"}
                            `}
                          >
                            <Checkbox
                              checked={isChecked}
                              onCheckedChange={() => {}}
                              className="h-4 w-4"
                            />
                            <span className="font-medium">{tf}</span>
                          </div>
                        );
                      })}
                    </div>
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

export default TimeframeFilterDropdown;

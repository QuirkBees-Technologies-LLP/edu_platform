import React, { useState, useRef, useEffect } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const MultiSelectLanguage = ({
  options,
  selectedValues,
  onToggle,
  placeholder = "Select languages...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={containerRef}>
      <button
        type="button"
        className={cn(
          "flex bg-light-light w-full items-center justify-between rounded-md border border-input h-10 px-3 py-2 text-[0.8125rem] text-sm ring-0 focus:border-primary focus:ring-0 font-medium ring-offset-0 ring-offset-background hover:border-gray-400 focus:outline-none focus:ring-0 focus:border-primary data-[state=open]:border-primary focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {selectedValues.length === 0
            ? placeholder
            : selectedValues.length === 1
            ? selectedValues[0]
            : `${selectedValues.length} selected`}
        </span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-96 w-full min-w-[8rem] overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md p-1">
          {options.length > 0 ? (
            options.map((option) => {
              const isSelected = selectedValues.includes(option.name);
              return (
                <div
                  key={option._id}
                  onClick={() => onToggle(option.name)}
                  className={cn(
                    "relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 pl-8 pr-2 text-[13px] outline-none hover:bg-accent hover:text-accent-foreground",
                    isSelected ? "bg-accent/50 text-accent-foreground" : ""
                  )}
                >
                  <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                    {isSelected && <Check className="h-4 w-4" />}
                  </span>
                  <span>{option.name}</span>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-2 text-sm text-gray-500">
              No options available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { MultiSelectLanguage };

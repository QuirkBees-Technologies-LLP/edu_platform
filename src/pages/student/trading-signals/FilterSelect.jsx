import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FilterSelect = ({ label, value, onChange, options, placeholder }) => (
  <div className="flex flex-col gap-1.5 relative">
    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
      {label}
    </label>
    <Select
      value={value || "ALL"}
      onValueChange={(val) => onChange(val === "ALL" ? "" : val)}
    >
      <SelectTrigger className="w-[160px] h-10 bg-white dark:bg-[#0F0F1A] border border-slate-200 dark:border-[#202038]">
        <SelectValue placeholder={placeholder}>
          {value ? options.find((o) => o.value === value)?.label : placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value || "ALL"} value={opt.value || "ALL"}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);

export default FilterSelect;

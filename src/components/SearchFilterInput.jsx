import React from "react";
import { IoClose, IoSearchSharp } from "react-icons/io5";
import { useSettings } from "../providers/SettingsProvider";

function SearchFilterInput({ searchText, handleSearchChange, className }) {
  const { getThemeMode } = useSettings();
  const theme = getThemeMode();
  const isDark = theme === "dark";

  const handleReset = () => handleSearchChange({ target: { value: "" } });

  return (
    <div className="relative w-full">
      <input
        type="text"
        placeholder="Search"
        value={searchText}
        onChange={handleSearchChange}
        autoComplete="off"
        className={`flex w-full  items-center justify-between h-9.5 rounded-md border ring-0 ring-offset-0 px-8 py-2 pr-8 text-[0.8125rem] font-medium outline-none transition-colors duration-200
          ${
            isDark
              ? "bg-[#f3f4f6] border-gray-700 text-gray-100 placeholder-gray-400  dark:placeholder-gray-800 hover:border-gray-500 focus:border-blue-500 focus:ring-0 caret-gray-200"
              : "bg-light-light border-input text-gray-700 placeholder:text-muted-foreground hover:border-gray-400 focus:border-primary focus:ring-0"
          } ${className || ""}`}
        style={{
          color: isDark ? "#f3f4f6" : undefined,
          backgroundColor: isDark ? "#1f1f1f" : undefined,
        }}
      />

      <IoSearchSharp
        size={18}
        className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200
          ${isDark ? "text-gray-400 dark:text-gray-900  " : "text-gray-500"}`}
      />

      {searchText && (
        <IoClose
          size={15}
          onClick={handleReset}
          className={`absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer transition-colors duration-200
            ${isDark ? "text-gray-300 hover:text-gray-900 dark:text-gray-900 dark:hover:text-gray-900" : "text-gray-400 hover:text-gray-600"}`}
        />
      )}
    </div>
  );
}

export default SearchFilterInput;

import React from "react";
import { FormControl } from "react-bootstrap";
import { IoClose, IoSearchSharp } from "react-icons/io5";

function SearchFilterInput({ searchText, handleSearchChange, className }) {
  const handleReset = () => {
    const syntheticEvent = {
      target: {
        value: "",
      },
    };
    handleSearchChange(syntheticEvent);
  };
  return (
    <div className="relative w-full">
      <FormControl
        type="text"
        placeholder="Search"
        value={searchText}
        onChange={handleSearchChange}
        autoComplete="off"
        className={`w-full border border-gray-300 rounded-lg px-8 py-1.5  text-gray-700 hover:border-blue-800 ${className || ""}`}
      />

      {/* Search Icon */}
      <IoSearchSharp
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        size={20}
      />

      {/* Clear Icon */}
      {searchText && (
        <IoClose
          onClick={handleReset}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          size={16}
        />
      )}
    </div>
  );
}

export default SearchFilterInput;

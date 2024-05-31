import React, { useState } from "react";

const SearchBar
 = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearch = () => {
    // Implement search functionality here
    console.log("Search query:", searchQuery);
  };

  return (
    <div className="flex ">
      <input
        type="text"
        placeholder="Search..."
        className="input input-bordered w-full"
        value={searchQuery}
        onChange={handleInputChange}
      />
      <button
        className="btn btn-square btn-primary ml-2"
        onClick={handleSearch}
      >
        {/* <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10 4a6 6 0 100 12 6 6 0 000-12zm0 0v4m0 0h4"
          />
        </svg> */}
      </button>
    </div>
  );
};

export default SearchBar
;

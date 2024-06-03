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
        className="input input-bordered w-72 h-9 bg-gray-100"
        value={searchQuery}
        onChange={handleInputChange}
        onClick={handleSearch}
      />
      
    </div>
  );
};

export default SearchBar
;

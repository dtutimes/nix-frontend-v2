const SearchBar = ({
  searchTerm,
  onSearch,
  categories = null,
  selectedCategory = null,
  onCategoryChange = null,
}) => {
  //const categories = ["Name", "Role", "Email"];

  return (
    <div className="flex justify-center items-center">
      <div className="flex items-center p-4 w-full space-x-6 bg-white rounded-xl ">
        <div className="flex bg-gray-100 p-4 w-full space-x-4 rounded-lg">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 opacity-30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            id="search-input"
            className="bg-gray-100 w-full outline-none"
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        {categories && (
          <select
            id="select-category"
            className="flex bg-blue-500 py-3 px-4 rounded-lg text-gray-900 font-semibold cursor-pointer border-r-4 border-transparent"
            onChange={(e) => onCategoryChange(e.target.value)}
            value={selectedCategory}
          >
            {categories.map((category) => (
              <option
                className="bg-white border-none"
                key={category}
                value={category.toLowerCase()}
              >
                {category}
              </option>
            ))}
          </select>
        )}
      </div>
    </div>
  );
};

export default SearchBar;

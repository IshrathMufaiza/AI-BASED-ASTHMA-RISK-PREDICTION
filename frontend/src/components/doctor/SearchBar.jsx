function SearchBar({
  searchTerm,
  setSearchTerm,
}) {
  return (
    <input
className="search-bar"
      type="text"
      placeholder="Search patient..."

      value={searchTerm}

      onChange={(e) =>
        setSearchTerm(
          e.target.value
        )
      }
    />
  );
}

export default SearchBar;
import React from "react";

type Props = {
  query: string;
  setQuery: (query: string) => void;
  onSearch: (e: React.FormEvent) => Promise<void>;
};

const SearchBar: React.FC<Props> = ({ query, setQuery, onSearch }) => {
  return (
    <form onSubmit={onSearch} className="flex mb-4">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="flex-1 border p-2 rounded-l"
        placeholder="Search manga..."
      />
      <button
        className="bg-purple-600 text-white px-4 py-2 rounded-r hover:bg-purple-700 transition-colors"
        type="submit"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
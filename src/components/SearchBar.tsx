import React from "react";

type Props = {
  query: string;
  setQuery: (query: string) => void;
  onRandomClick: () => Promise<void>;
  isLoading?: boolean;
};

const SearchBar: React.FC<Props> = ({
  query,
  setQuery,
  onRandomClick,
  isLoading,
}) => {
  return (
    <div className="flex gap-2 mb-4">
      <form className="flex flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 border p-2 rounded"
          placeholder="Search manga..."
        />
      </form>
      <button
        onClick={onRandomClick}
        disabled={isLoading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors disabled:bg-green-400"
      >
        Read Something Random
      </button>
    </div>
  );
};

export default SearchBar;
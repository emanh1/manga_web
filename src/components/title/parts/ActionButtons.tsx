import { FaPlus, FaStar, FaUpload } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export const ActionButtons: React.FC<{ user: any; titleId: string | undefined; navigate: ReturnType<typeof useNavigate> }> = ({ user, titleId, navigate }) => (
  <div className="flex flex-row gap-3 items-center mt-2">
    <button
      className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors text-sm font-medium"
      type="button"
    >
      <FaPlus className="text-base" /> Add to Library 
    </button> 
    <button
      className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200 transition-colors text-sm font-medium"
      type="button"
    >
      <FaStar className="text-base" /> Rate
    </button>
    {user && (
      <button
        onClick={() => navigate(`/upload/${titleId}`)}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm font-medium"
        type="button"
      >
        <FaUpload className="text-base" /> Upload
      </button>
    )}
  </div>
);
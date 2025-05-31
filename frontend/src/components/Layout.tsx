import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type Props = {
  children: React.ReactNode;
};

const Layout: React.FC<Props> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold text-purple-600">
                Manga Web
              </Link>
              {user?.role === 'admin' && (
                <Link
                  to="/admin/review"
                  className="text-gray-600 hover:text-purple-600 transition"
                >
                  Review Uploads
                </Link>
              )}
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <Link
                    to={`/profile/${user.uuid}`}
                    className="text-gray-600 hover:text-purple-600 transition"
                  >
                    My Profile
                  </Link>
                  <Link
                    to="/settings"
                    className="text-gray-600 hover:text-purple-600 transition"
                  >
                    Settings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-purple-600 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-purple-600 transition"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
};

export default Layout;
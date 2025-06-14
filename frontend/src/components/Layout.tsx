import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { HiMenu, HiChevronDown, HiChevronUp } from 'react-icons/hi';

type Props = {
  children: React.ReactNode;
};

const Layout: React.FC<Props> = ({ children }) => {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate('/');
  };

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-xl font-bold text-purple-600">
                Manga Web
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative" ref={menuRef}>
                <button
                  className="flex items-center space-x-2 focus:outline-none"
                  onClick={() => setMenuOpen((open) => !open)}
                  aria-haspopup="true"
                  aria-expanded={menuOpen}
                >
                  {user ? (<>
                    <img src={user.avatarUrl}
                      className="w-8 h-8 rounded-full border" />
                    <span className="text-sm font-medium text-gray-700">{user.username}</span>
                  </>) : (<><HiMenu className="w-6 h-6 text-gray-700" />
                  </>)}
                    {menuOpen ? (<HiChevronUp className="w-6 h-6" />) : (<HiChevronDown className="w-6 h-6" />)}
                </button>
                <div
                  className={`absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg transition z-50 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                >
                  {/* Not logged in */}
                  {!user && !isLoading && (
                    <>
                      <Link
                        to="/login"
                        className="block px-4 py-2 text-yellow-600 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        Log in
                      </Link>
                      <Link
                        to="/register"
                        className="block px-4 py-2 text-blue-600 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        Register
                      </Link>
                      <hr className="my-1 border-gray-200" />
                    </>
                  )}

                  {/* Logged in */}
                  {!isLoading && user && (
                    <>
                      <Link
                        to={`/profile/${user.userId}`}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                      {user.role === 'admin' && (
                        <Link
                          to="/admin/dashboard"
                          className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                          onClick={() => setMenuOpen(false)}
                        >
                          Admin Dashboard
                        </Link>
                      )}
                      <hr className="my-1 border-gray-200" />
                    </>
                  )}

                  {/* Common Links */}
                  <Link
                    to="/settings"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  <Link
                    to="/about"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setMenuOpen(false)}
                  >
                    About Us
                  </Link>
                  {!isLoading && user && (
                    <>
                      <button onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-red-700 hover:bg-gray-100"
                      >Logout</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
};

export default Layout;
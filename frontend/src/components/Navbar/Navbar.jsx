import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../../features/auth/authSlice.js";

const Navbar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [searchQuery, setSearchQuery] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-dark-bg border-b border-dark-border">
      {/* Left */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-dark-elevated rounded-full"
        >
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
        <Link to="/" className="flex items-center gap-1">
          <svg className="w-8 h-8 text-red-600" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
          </svg>
          <span className="text-xl font-bold text-dark-text hidden sm:block">VideoTube</span>
        </Link>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex items-center max-w-lg w-full mx-4">
        <input
          type="text"
          placeholder="Search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-dark-bg border border-dark-border rounded-l-full px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="bg-dark-elevated border border-dark-border border-l-0 px-4 py-2 rounded-r-full hover:bg-dark-border"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
          </svg>
        </button>
      </form>

      {/* Right */}
      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <Link
              to="/upload"
              className="flex items-center gap-2 btn-secondary text-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/>
              </svg>
              <span className="hidden sm:block">Upload</span>
            </Link>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2"
              >
                <img
                  src={user?.avatar || "https://via.placeholder.com/32"}
                  alt={user?.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-dark-surface border border-dark-border rounded-xl shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-dark-border">
                    <p className="font-semibold text-sm">{user?.fullName}</p>
                    <p className="text-dark-subtext text-xs">@{user?.username}</p>
                  </div>
                  <Link
                    to={`/channel/${user?.username}`}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-dark-elevated text-sm"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Your Channel
                  </Link>
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-dark-elevated text-sm"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Studio / Dashboard
                  </Link>
                  <Link
                    to="/liked-videos"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-dark-elevated text-sm"
                    onClick={() => setDropdownOpen(false)}
                  >
                    Liked Videos
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-dark-elevated text-sm w-full text-left text-red-500"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 border border-blue-500 text-blue-400 px-4 py-1.5 rounded-full text-sm hover:bg-blue-500/10"
          >
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;

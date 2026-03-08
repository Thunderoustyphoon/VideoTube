import { useEffect, useRef } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser } from "./features/auth/authSlice.js";

// Layouts
import RootLayout from "./components/Layout/RootLayout.jsx";

// Pages
import HomePage from "./pages/HomePage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import VideoPage from "./pages/VideoPage.jsx";
import ChannelPage from "./pages/ChannelPage.jsx";
import UploadPage from "./pages/UploadPage.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";
import LikedVideosPage from "./pages/LikedVideosPage.jsx";
import WatchHistoryPage from "./pages/WatchHistoryPage.jsx";
import PlaylistPage from "./pages/PlaylistPage.jsx";
import SearchPage from "./pages/SearchPage.jsx";

// ── Spinner ───────────────────────────────────────────────────────────────────
const PageSpinner = () => (
  <div className="flex items-center justify-center h-screen bg-dark-bg">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600" />
  </div>
);

// ── Protected Route ───────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, initialLoading } = useSelector((state) => state.auth);
  if (initialLoading) return <PageSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// ── Router ────────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "watch/:videoId", element: <VideoPage /> },
      { path: "channel/:username", element: <ChannelPage /> },
      { path: "search", element: <SearchPage /> },
      {
        path: "upload",
        element: (
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "liked-videos",
        element: (
          <ProtectedRoute>
            <LikedVideosPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "history",
        element: (
          <ProtectedRoute>
            <WatchHistoryPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "playlist/:playlistId",
        element: (
          <ProtectedRoute>
            <PlaylistPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "*", element: <Navigate to="/" replace /> },
]);

// ── App ────────────────────────────────────────────────────────────────────────
function App() {
  const dispatch = useDispatch();
  const mounted = useRef(false);

  useEffect(() => {
    // Prevent multiple fetches - only run once on mount
    if (!mounted.current) {
      mounted.current = true;
      // Try to restore user session from httpOnly cookies
      dispatch(fetchCurrentUser()).catch(() => {
        // Not authenticated - this is expected for new users
      });
    }
  }, []); // Empty dependency array - run only once on mount

  return <RouterProvider router={router} />;
}

export default App;

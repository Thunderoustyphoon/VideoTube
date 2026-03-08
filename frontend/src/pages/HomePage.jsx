import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllVideos } from "../features/video/videoSlice.js";
import VideoCard from "../components/VideoCard/VideoCard.jsx";

const categories = [
  "All", "Gaming", "Music", "News", "Sports", "Tech",
  "Comedy", "Education", "Travel", "Cooking", "Finance",
];

const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="bg-dark-elevated rounded-xl aspect-video mb-3" />
    <div className="flex gap-3">
      <div className="w-9 h-9 rounded-full bg-dark-elevated shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-dark-elevated rounded w-3/4" />
        <div className="h-3 bg-dark-elevated rounded w-1/2" />
        <div className="h-3 bg-dark-elevated rounded w-1/3" />
      </div>
    </div>
  </div>
);

const HomePage = () => {
  const dispatch = useDispatch();
  const { videos, loading, hasNextPage, currentPage } = useSelector(
    (state) => state.video
  );
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    dispatch(fetchAllVideos({ page: 1, limit: 20 }));
  }, [dispatch]);

  const loadMore = useCallback(() => {
    if (!loading && hasNextPage) {
      dispatch(fetchAllVideos({ page: currentPage + 1, limit: 20 }));
    }
  }, [dispatch, loading, hasNextPage, currentPage]);

  const handleCategoryChange = (cat) => {
    setSelectedCategory(cat);
    // In a real app you'd filter by category tag
    if (cat === "All") {
      dispatch(fetchAllVideos({ page: 1, limit: 20 }));
    } else {
      dispatch(fetchAllVideos({ query: cat, page: 1, limit: 20 }));
    }
  };

  return (
    <div>
      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide -mx-1 px-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === cat
                ? "bg-dark-text text-dark-bg"
                : "bg-dark-elevated text-dark-text hover:bg-dark-border"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Video grid */}
      {loading && videos.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {[...Array(12)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-dark-subtext">
          <svg className="w-16 h-16 mb-4 opacity-40" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
          </svg>
          <p className="text-lg font-semibold">No videos yet</p>
          <p className="text-sm mt-1">Be the first to upload!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>

          {hasNextPage && (
            <div className="flex justify-center mt-10">
              <button
                onClick={loadMore}
                disabled={loading}
                className="btn-secondary px-10 py-3"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-dark-text" />
                    Loading...
                  </span>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          )}

          {loading && videos.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 mt-8">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default HomePage;

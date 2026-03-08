import { useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchAllVideos } from "../features/video/videoSlice.js";
import { format } from "timeago.js";

const formatNum = (n) => {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

const formatDuration = (s) => {
  if (!s) return "0:00";
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = Math.floor(s % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  return `${m}:${String(sec).padStart(2, "0")}`;
};

const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const dispatch = useDispatch();
  const { videos, loading, totalVideos } = useSelector((state) => state.video);

  useEffect(() => {
    dispatch(fetchAllVideos({ query, limit: 20 }));
  }, [query, dispatch]);

  return (
    <div className="max-w-4xl mx-auto">
      {query && (
        <p className="text-dark-subtext text-sm mb-4">
          {loading
            ? "Searching..."
            : `${totalVideos} result${totalVideos !== 1 ? "s" : ""} for "${query}"`}
        </p>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="bg-dark-elevated rounded-xl w-64 aspect-video shrink-0" />
              <div className="flex-1 space-y-3 pt-2">
                <div className="h-5 bg-dark-elevated rounded w-3/4" />
                <div className="h-4 bg-dark-elevated rounded w-1/4" />
                <div className="h-4 bg-dark-elevated rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="text-center py-20 text-dark-subtext">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
          </svg>
          <p className="text-lg font-semibold">
            {query ? `No results for "${query}"` : "Explore Videos"}
          </p>
          <p className="text-sm mt-2">Try different keywords or browse the home page</p>
        </div>
      ) : (
        <div className="space-y-4">
          {videos.map((video) => (
            <Link
              key={video._id}
              to={`/watch/${video._id}`}
              className="flex gap-4 group hover:bg-dark-elevated p-3 rounded-xl transition-colors"
            >
              {/* Thumbnail */}
              <div className="relative w-64 aspect-video rounded-xl overflow-hidden shrink-0 bg-dark-elevated">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
                <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                  {formatDuration(video.duration)}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 pt-1">
                <h3 className="font-semibold text-base line-clamp-2 text-dark-text leading-snug">
                  {video.title}
                </h3>
                <p className="text-dark-subtext text-sm mt-1">
                  {formatNum(video.views)} views • {format(video.createdAt)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <img
                    src={video.ownerDetails?.avatar || "https://placehold.co/24"}
                    alt={video.ownerDetails?.username}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-dark-subtext text-sm">
                    {video.ownerDetails?.username}
                  </span>
                </div>
                <p className="text-dark-subtext text-sm mt-2 line-clamp-2 leading-relaxed">
                  {video.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchPage;

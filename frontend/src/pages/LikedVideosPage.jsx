import { useEffect, useState } from "react";
import { getLikedVideos } from "../api/index.js";
import VideoCard from "../components/VideoCard/VideoCard.jsx";
import toast from "react-hot-toast";

const LikedVideosPage = () => {
  const [likedData, setLikedData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getLikedVideos()
      .then((res) => setLikedData(res.data.data || []))
      .catch(() => toast.error("Failed to load liked videos"))
      .finally(() => setLoading(false));
  }, []);

  // Normalize the video shape - backend returns { likedAt, video: {...} }
  const videos = likedData.map((item) => item.video).filter(Boolean);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        Liked Videos{" "}
        {!loading && (
          <span className="text-dark-subtext text-lg font-normal">
            ({videos.length})
          </span>
        )}
      </h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-dark-elevated rounded-xl aspect-video mb-3" />
              <div className="h-4 bg-dark-elevated rounded w-3/4 mb-2" />
              <div className="h-3 bg-dark-elevated rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-dark-subtext">
          <svg className="w-16 h-16 mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z" />
          </svg>
          <p className="text-lg font-semibold">No liked videos yet</p>
          <p className="text-sm mt-1">Like videos to see them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedVideosPage;

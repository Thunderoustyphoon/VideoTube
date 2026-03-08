import { useEffect, useState } from "react";
import { getWatchHistory } from "../api/auth.api.js";
import VideoCard from "../components/VideoCard/VideoCard.jsx";
import toast from "react-hot-toast";

const WatchHistoryPage = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getWatchHistory();
        setHistory(res.data.data);
      } catch {
        toast.error("Failed to load watch history");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Watch History</h1>
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      ) : history.length === 0 ? (
        <div className="text-center py-20 text-dark-subtext">
          <p>No watch history yet. Start watching videos!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {history.map((video) => (
            <VideoCard
              key={video._id}
              video={{ ...video, ownerDetails: video.owner }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchHistoryPage;

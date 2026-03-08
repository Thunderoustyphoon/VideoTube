import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPlaylistById } from "../api/index.js";
import VideoCard from "../components/VideoCard/VideoCard.jsx";
import toast from "react-hot-toast";

const PlaylistPage = () => {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getPlaylistById(playlistId);
        setPlaylist(res.data.data);
      } catch {
        toast.error("Failed to load playlist");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [playlistId]);

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
    </div>
  );

  if (!playlist) return <div className="text-center py-20 text-dark-subtext">Playlist not found</div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Playlist info */}
        <div className="md:w-72 flex-shrink-0">
          <div className="bg-dark-surface border border-dark-border rounded-2xl p-5 sticky top-20">
            <div className="aspect-video rounded-xl overflow-hidden bg-dark-elevated mb-4">
              {playlist.videos?.[0]?.thumbnail ? (
                <img src={playlist.videos[0].thumbnail} alt={playlist.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-dark-subtext">
                  No videos
                </div>
              )}
            </div>
            <h1 className="text-xl font-bold">{playlist.name}</h1>
            <p className="text-dark-subtext text-sm mt-2">{playlist.description}</p>
            <div className="mt-3 text-dark-subtext text-sm space-y-1">
              <p>{playlist.owner?.username}</p>
              <p>{playlist.totalVideos} videos • {playlist.totalViews} total views</p>
            </div>
          </div>
        </div>

        {/* Videos */}
        <div className="flex-1">
          <h2 className="font-semibold mb-4">Videos in this playlist</h2>
          {playlist.videos?.length === 0 ? (
            <div className="text-center py-16 text-dark-subtext">
              <p>No videos in this playlist</p>
            </div>
          ) : (
            <div className="space-y-3">
              {playlist.videos?.map((video, idx) => (
                <Link key={video._id} to={`/watch/${video._id}`} className="flex gap-3 p-2 rounded-xl hover:bg-dark-elevated transition-colors">
                  <span className="text-dark-subtext text-sm w-6 text-center mt-3">{idx + 1}</span>
                  <div className="relative w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0 bg-dark-elevated">
                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm line-clamp-2">{video.title}</p>
                    <p className="text-dark-subtext text-xs mt-1">{video.views} views</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistPage;

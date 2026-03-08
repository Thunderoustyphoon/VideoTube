import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getChannelStats, getChannelVideos } from "../api/index.js";
import { togglePublishStatus, deleteVideo } from "../api/video.api.js";
import toast from "react-hot-toast";

const StatCard = ({ label, value, icon }) => (
  <div className="bg-dark-surface border border-dark-border rounded-2xl p-5">
    <div className="flex items-center justify-between mb-3">
      <p className="text-dark-subtext text-sm">{label}</p>
      <span className="text-2xl">{icon}</span>
    </div>
    <p className="text-3xl font-bold">{value}</p>
  </div>
);

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, videosRes] = await Promise.all([
          getChannelStats(),
          getChannelVideos(),
        ]);
        setStats(statsRes.data.data);
        setVideos(videosRes.data.data);
      } catch {
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleTogglePublish = async (videoId, currentStatus) => {
    try {
      await togglePublishStatus(videoId);
      setVideos((prev) =>
        prev.map((v) =>
          v._id === videoId ? { ...v, isPublished: !v.isPublished } : v
        )
      );
      toast.success(`Video ${currentStatus ? "unpublished" : "published"}`);
    } catch {
      toast.error("Failed to toggle publish status");
    }
  };

  const handleDelete = async (videoId) => {
    if (!confirm("Delete this video permanently?")) return;
    try {
      await deleteVideo(videoId);
      setVideos((prev) => prev.filter((v) => v._id !== videoId));
      toast.success("Video deleted");
    } catch {
      toast.error("Failed to delete video");
    }
  };

  const formatNum = (n = 0) => {
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Channel Dashboard</h1>
        <Link to="/upload" className="btn-primary">
          + Upload Video
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Subscribers" value={formatNum(stats?.totalSubscribers)} icon="👥" />
        <StatCard label="Total Views" value={formatNum(stats?.totalViews)} icon="👁️" />
        <StatCard label="Total Likes" value={formatNum(stats?.totalLikes)} icon="👍" />
        <StatCard label="Total Videos" value={stats?.totalVideos || 0} icon="🎬" />
      </div>

      {/* Videos table */}
      <div className="bg-dark-surface border border-dark-border rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-dark-border">
          <h2 className="font-semibold text-lg">Your Videos</h2>
        </div>

        {videos.length === 0 ? (
          <div className="text-center py-16 text-dark-subtext">
            <p className="mb-3">No videos uploaded yet</p>
            <Link to="/upload" className="btn-primary">Upload your first video</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border text-dark-subtext text-sm">
                  <th className="text-left px-5 py-3">Video</th>
                  <th className="text-center px-4 py-3">Status</th>
                  <th className="text-center px-4 py-3">Views</th>
                  <th className="text-center px-4 py-3">Likes</th>
                  <th className="text-center px-4 py-3">Date</th>
                  <th className="text-center px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <tr key={video._id} className="border-b border-dark-border hover:bg-dark-elevated/50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-20 aspect-video object-cover rounded-lg flex-shrink-0"
                        />
                        <span className="text-sm font-medium line-clamp-2">{video.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          video.isPublished
                            ? "bg-green-500/20 text-green-400"
                            : "bg-yellow-500/20 text-yellow-400"
                        }`}
                      >
                        {video.isPublished ? "Published" : "Private"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center text-sm">{formatNum(video.views)}</td>
                    <td className="px-4 py-4 text-center text-sm">{formatNum(video.likesCount)}</td>
                    <td className="px-4 py-4 text-center text-sm text-dark-subtext">
                      {new Date(video.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleTogglePublish(video._id, video.isPublished)}
                          className="text-xs px-3 py-1 rounded-lg bg-dark-elevated hover:bg-dark-border"
                        >
                          {video.isPublished ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          onClick={() => handleDelete(video._id)}
                          className="text-xs px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

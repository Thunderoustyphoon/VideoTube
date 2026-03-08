import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUserChannelProfile } from "../api/auth.api.js";
import { getAllVideos } from "../api/video.api.js";
import { toggleSubscription } from "../api/index.js";
import VideoCard from "../components/VideoCard/VideoCard.jsx";
import toast from "react-hot-toast";

const tabs = ["Videos", "About"];

const ChannelPage = () => {
  const { username } = useParams();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [channel, setChannel] = useState(null);
  const [videos, setVideos] = useState([]);
  const [channelLoading, setChannelLoading] = useState(true);
  const [videosLoading, setVideosLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("Videos");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);

  // Fetch channel profile
  useEffect(() => {
    setChannelLoading(true);
    setChannel(null);
    setVideos([]);

    getUserChannelProfile(username)
      .then((res) => {
        const data = res.data.data;
        setChannel(data);
        setIsSubscribed(data.isSubscribed);
        setSubscribersCount(data.subscribersCount);
      })
      .catch(() => toast.error("Failed to load channel"))
      .finally(() => setChannelLoading(false));
  }, [username]);

  // Fetch channel videos after channel loaded
  useEffect(() => {
    if (!channel?._id) return;
    setVideosLoading(true);

    getAllVideos({ userId: channel._id, limit: 30 })
      .then((res) => setVideos(res.data.data?.videos || []))
      .catch(() => {})
      .finally(() => setVideosLoading(false));
  }, [channel?._id]);

  const handleSubscribe = useCallback(async () => {
    if (!isAuthenticated) return toast.error("Please sign in to subscribe");
    const prev = isSubscribed;
    setIsSubscribed(!prev);
    setSubscribersCount((c) => (prev ? c - 1 : c + 1));
    try {
      await toggleSubscription(channel._id);
      toast.success(prev ? "Unsubscribed" : "Subscribed!");
    } catch {
      setIsSubscribed(prev);
      setSubscribersCount((c) => (prev ? c + 1 : c - 1));
      toast.error("Failed to update subscription");
    }
  }, [isAuthenticated, isSubscribed, channel]);

  const formatNum = (n = 0) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toString();
  };

  if (channelLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600" />
      </div>
    );
  }

  if (!channel) {
    return (
      <div className="text-center py-20 text-dark-subtext">
        <p className="text-xl font-semibold">Channel not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Cover Image */}
      <div className="w-full h-36 md:h-52 rounded-xl overflow-hidden bg-dark-elevated">
        {channel.coverImage ? (
          <img
            src={channel.coverImage}
            alt={`${channel.username} cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-dark-elevated to-dark-surface" />
        )}
      </div>

      {/* Channel Info */}
      <div className="flex flex-col md:flex-row items-start md:items-end gap-4 px-4 mt-4">
        <img
          src={channel.avatar}
          alt={channel.username}
          className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-dark-bg -mt-8 md:-mt-10 shrink-0"
        />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{channel.fullName}</h1>
          <p className="text-dark-subtext text-sm">@{channel.username}</p>
          <div className="flex gap-4 mt-1 text-sm text-dark-subtext">
            <span>{formatNum(subscribersCount)} subscribers</span>
            <span>{formatNum(channel.channelsSubscribedToCount)} subscriptions</span>
            <span>{videos.length} videos</span>
          </div>
        </div>
        <button
          onClick={handleSubscribe}
          className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors ${
            isSubscribed
              ? "bg-dark-elevated text-dark-text hover:bg-dark-border"
              : "bg-white text-black hover:bg-gray-200"
          }`}
        >
          {isSubscribed ? "Subscribed ✓" : "Subscribe"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-dark-border mt-6 px-4">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-white text-white"
                : "border-transparent text-dark-subtext hover:text-dark-text"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6 px-4">
        {activeTab === "Videos" && (
          <>
            {videosLoading ? (
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
              <div className="text-center py-20 text-dark-subtext">
                <p>No videos uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
                {videos.map((video) => (
                  <VideoCard key={video._id} video={video} />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === "About" && (
          <div className="max-w-lg space-y-4">
            <div className="bg-dark-surface border border-dark-border rounded-xl p-4">
              <h3 className="font-semibold mb-3">Channel Details</h3>
              <div className="space-y-2 text-sm text-dark-subtext">
                <p>
                  <span className="text-dark-text font-medium">Email:</span>{" "}
                  {channel.email}
                </p>
                <p>
                  <span className="text-dark-text font-medium">Username:</span>{" "}
                  @{channel.username}
                </p>
                <p>
                  <span className="text-dark-text font-medium">
                    Total Subscribers:
                  </span>{" "}
                  {formatNum(subscribersCount)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelPage;

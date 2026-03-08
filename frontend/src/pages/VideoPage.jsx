import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import ReactPlayer from "react-player/lazy";
import { format } from "timeago.js";
import { fetchVideoById, fetchAllVideos, clearCurrentVideo } from "../features/video/videoSlice.js";
import { toggleVideoLike, toggleSubscription } from "../api/index.js";
import CommentSection from "../components/Comments/CommentSection.jsx";
import toast from "react-hot-toast";

const formatNum = (n) => {
  if (!n) return "0";
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
};

const VideoPage = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentVideo, videos, loading, error } = useSelector((state) => state.video);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [descExpanded, setDescExpanded] = useState(false);

  // Fetch video when videoId changes
  useEffect(() => {
    if (videoId) {
      dispatch(fetchVideoById(videoId));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    return () => {
      dispatch(clearCurrentVideo());
    };
  }, [videoId, dispatch]);

  // Fetch related videos once
  useEffect(() => {
    if (!videos.length) {
      dispatch(fetchAllVideos({ limit: 20 }));
    }
  }, [dispatch]);

  // Sync local state when video loads
  useEffect(() => {
    if (currentVideo) {
      setIsLiked(currentVideo.isLiked || false);
      setLikesCount(currentVideo.likesCount || 0);
      setIsSubscribed(currentVideo.owner?.isSubscribed || false);
      setSubscribersCount(currentVideo.owner?.subscribersCount || 0);
    }
  }, [currentVideo]);

  const handleLike = useCallback(async () => {
    if (!isAuthenticated) return toast.error("Please sign in to like");
    const prev = isLiked;
    // Optimistic update
    setIsLiked(!prev);
    setLikesCount((c) => (prev ? c - 1 : c + 1));
    try {
      await toggleVideoLike(videoId);
    } catch {
      // Rollback
      setIsLiked(prev);
      setLikesCount((c) => (prev ? c + 1 : c - 1));
      toast.error("Failed to update like");
    }
  }, [isAuthenticated, isLiked, videoId]);

  const handleSubscribe = useCallback(async () => {
    if (!isAuthenticated) return toast.error("Please sign in to subscribe");
    const prev = isSubscribed;
    // Optimistic update
    setIsSubscribed(!prev);
    setSubscribersCount((c) => (prev ? c - 1 : c + 1));
    try {
      await toggleSubscription(currentVideo.owner._id);
      toast.success(prev ? "Unsubscribed" : "Subscribed!");
    } catch {
      setIsSubscribed(prev);
      setSubscribersCount((c) => (prev ? c + 1 : c - 1));
      toast.error("Failed to update subscription");
    }
  }, [isAuthenticated, isSubscribed, currentVideo]);

  if (loading && !currentVideo) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600" />
      </div>
    );
  }

  if (error || (!loading && !currentVideo)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-dark-subtext">
        <p className="text-lg font-semibold mb-4">Video not found or unavailable</p>
        <button onClick={() => navigate("/")} className="btn-secondary">
          Go Home
        </button>
      </div>
    );
  }

  if (!currentVideo) return null;

  const relatedVideos = videos.filter((v) => v._id !== videoId).slice(0, 15);

  return (
    <div className="flex flex-col xl:flex-row gap-6 max-w-[1600px] mx-auto">
      {/* ── Main content ── */}
      <div className="flex-1 min-w-0">
        {/* Player */}
        <div className="rounded-xl overflow-hidden bg-black aspect-video w-full">
          <ReactPlayer
            url={currentVideo.videoFile}
            controls
            width="100%"
            height="100%"
            playing
            config={{
              file: {
                attributes: {
                  controlsList: "nodownload",
                  onContextMenu: (e) => e.preventDefault(),
                },
              },
            }}
          />
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-dark-text leading-snug mt-4">
          {currentVideo.title}
        </h1>

        {/* Channel row + actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
          {/* Channel */}
          <div className="flex items-center gap-3">
            <Link to={`/channel/${currentVideo.owner?.username}`}>
              <img
                src={currentVideo.owner?.avatar || "https://placehold.co/40"}
                alt={currentVideo.owner?.username}
                className="w-10 h-10 rounded-full object-cover hover:opacity-80 transition-opacity"
              />
            </Link>
            <div>
              <Link
                to={`/channel/${currentVideo.owner?.username}`}
                className="font-semibold text-sm hover:text-dark-subtext transition-colors"
              >
                {currentVideo.owner?.username}
              </Link>
              <p className="text-dark-subtext text-xs">
                {formatNum(subscribersCount)} subscribers
              </p>
            </div>
            <button
              onClick={handleSubscribe}
              className={`ml-2 px-4 py-2 rounded-full font-semibold text-sm transition-colors ${
                isSubscribed
                  ? "bg-dark-elevated text-dark-text hover:bg-dark-border"
                  : "bg-white text-black hover:bg-gray-200"
              }`}
            >
              {isSubscribed ? "Subscribed ✓" : "Subscribe"}
            </button>
          </div>

          {/* Like button */}
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all ${
              isLiked
                ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30"
                : "bg-dark-elevated text-dark-text hover:bg-dark-border"
            }`}
          >
            <svg
              className={`w-5 h-5 transition-transform ${isLiked ? "scale-110" : ""}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z" />
            </svg>
            {formatNum(likesCount)} {likesCount === 1 ? "Like" : "Likes"}
          </button>
        </div>

        {/* Description */}
        <div className="mt-4 bg-dark-elevated rounded-xl p-4">
          <p className="text-sm text-dark-subtext mb-2">
            {formatNum(currentVideo.views)} views • {format(currentVideo.createdAt)}
          </p>
          <p
            className={`text-sm text-dark-text whitespace-pre-wrap leading-relaxed ${
              !descExpanded ? "line-clamp-3" : ""
            }`}
          >
            {currentVideo.description}
          </p>
          {currentVideo.description?.length > 150 && (
            <button
              onClick={() => setDescExpanded((p) => !p)}
              className="text-sm font-semibold mt-2 hover:text-dark-subtext transition-colors"
            >
              {descExpanded ? "Show less" : "...more"}
            </button>
          )}
        </div>

        {/* Comments */}
        <CommentSection videoId={videoId} />
      </div>

      {/* ── Related videos ── */}
      <div className="xl:w-[380px] shrink-0 space-y-3">
        <h3 className="font-semibold text-sm text-dark-subtext uppercase tracking-wide">
          Up Next
        </h3>
        {relatedVideos.map((video) => (
          <Link
            key={video._id}
            to={`/watch/${video._id}`}
            className="flex gap-2 group hover:bg-dark-elevated rounded-lg p-1 transition-colors"
          >
            <div className="relative w-40 aspect-video rounded-lg overflow-hidden shrink-0 bg-dark-elevated">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
              />
              <span className="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 rounded">
                {Math.floor(video.duration / 60)}:{String(Math.floor(video.duration % 60)).padStart(2, "0")}
              </span>
            </div>
            <div className="flex-1 min-w-0 py-1">
              <p className="text-sm font-semibold line-clamp-2 text-dark-text leading-snug">
                {video.title}
              </p>
              <p className="text-xs text-dark-subtext mt-1">
                {video.ownerDetails?.username}
              </p>
              <p className="text-xs text-dark-subtext">
                {formatNum(video.views)} views
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default VideoPage;

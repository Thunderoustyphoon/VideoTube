import { Link } from "react-router-dom";
import { format } from "timeago.js";

const VideoCard = ({ video }) => {
  const formatDuration = (seconds) => {
    if (!seconds) return "0:00";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const formatViews = (views) => {
    if (!views) return "0 views";
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M views`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K views`;
    return `${views} views`;
  };

  return (
    <Link to={`/watch/${video._id}`} className="group block">
      <div className="relative rounded-xl overflow-hidden aspect-video bg-dark-elevated">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-medium">
          {formatDuration(video.duration)}
        </span>
      </div>

      <div className="flex gap-3 mt-3">
        <Link
          to={`/channel/${video.ownerDetails?.username}`}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={video.ownerDetails?.avatar || "https://via.placeholder.com/36"}
            alt={video.ownerDetails?.username}
            className="w-9 h-9 rounded-full object-cover flex-shrink-0 mt-0.5"
          />
        </Link>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm line-clamp-2 leading-snug text-dark-text">
            {video.title}
          </h3>
          <Link
            to={`/channel/${video.ownerDetails?.username}`}
            onClick={(e) => e.stopPropagation()}
            className="text-dark-subtext text-xs hover:text-dark-text mt-1 block"
          >
            {video.ownerDetails?.username}
          </Link>
          <p className="text-dark-subtext text-xs">
            {formatViews(video.views)} • {format(video.createdAt)}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default VideoCard;

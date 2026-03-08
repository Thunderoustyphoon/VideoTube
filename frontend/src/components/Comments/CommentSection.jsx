import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { format } from "timeago.js";
import { getVideoComments, addComment, deleteComment, updateComment } from "../../api/index.js";
import { toggleCommentLike } from "../../api/index.js";
import toast from "react-hot-toast";

const CommentItem = ({ comment, currentUser, onDelete, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [likesCount, setLikesCount] = useState(comment.likesCount);

  const handleLike = async () => {
    try {
      await toggleCommentLike(comment._id);
      setIsLiked((prev) => !prev);
      setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    } catch {
      toast.error("Failed to like comment");
    }
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    try {
      await updateComment(comment._id, { content: editContent });
      onUpdate(comment._id, editContent);
      setEditing(false);
      toast.success("Comment updated");
    } catch {
      toast.error("Failed to update comment");
    }
  };

  return (
    <div className="flex gap-3 py-3">
      <img
        src={comment.owner?.avatar || "https://via.placeholder.com/36"}
        alt={comment.owner?.username}
        className="w-9 h-9 rounded-full object-cover flex-shrink-0"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">@{comment.owner?.username}</span>
          <span className="text-dark-subtext text-xs">{format(comment.createdAt)}</span>
        </div>

        {editing ? (
          <div>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="input-field text-sm min-h-[80px] resize-none"
            />
            <div className="flex gap-2 mt-2">
              <button onClick={handleUpdate} className="btn-primary text-xs py-1">Save</button>
              <button onClick={() => setEditing(false)} className="btn-secondary text-xs py-1">Cancel</button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-dark-text">{comment.content}</p>
        )}

        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 text-xs ${isLiked ? "text-blue-400" : "text-dark-subtext"} hover:text-dark-text`}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z" />
            </svg>
            {likesCount}
          </button>

          {currentUser?._id === comment.owner?._id && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="text-xs text-dark-subtext hover:text-dark-text"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(comment._id)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const CommentSection = ({ videoId }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  useEffect(() => {
    loadComments();
  }, [videoId]);

  const loadComments = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await getVideoComments(videoId, { page: pageNum, limit: 20 });
      const data = res.data.data;
      if (pageNum === 1) {
        setComments(data.docs);
      } else {
        setComments((prev) => [...prev, ...data.docs]);
      }
      setHasNextPage(data.hasNextPage);
      setPage(pageNum);
    } catch {
      toast.error("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      await addComment(videoId, { content: newComment });
      setNewComment("");
      loadComments(1);
      toast.success("Comment added!");
    } catch {
      toast.error("Failed to add comment");
    }
  };

  const handleDelete = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success("Comment deleted");
    } catch {
      toast.error("Failed to delete comment");
    }
  };

  const handleUpdate = (commentId, newContent) => {
    setComments((prev) =>
      prev.map((c) => (c._id === commentId ? { ...c, content: newContent } : c))
    );
  };

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-lg mb-4">{comments.length} Comments</h3>

      {isAuthenticated && (
        <form onSubmit={handleSubmit} className="flex gap-3 mb-6">
          <img
            src={user?.avatar || "https://via.placeholder.com/36"}
            alt={user?.username}
            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
          />
          <div className="flex-1">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="input-field text-sm"
            />
            {newComment && (
              <div className="flex gap-2 mt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setNewComment("")}
                  className="btn-secondary text-sm py-1.5"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-sm py-1.5">
                  Comment
                </button>
              </div>
            )}
          </div>
        </form>
      )}

      <div className="divide-y divide-dark-border">
        {comments.map((comment) => (
          <CommentItem
            key={comment._id}
            comment={comment}
            currentUser={user}
            onDelete={handleDelete}
            onUpdate={handleUpdate}
          />
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-600"></div>
        </div>
      )}

      {hasNextPage && !loading && (
        <button
          onClick={() => loadComments(page + 1)}
          className="mt-4 btn-secondary w-full"
        >
          Load more comments
        </button>
      )}
    </div>
  );
};

export default CommentSection;

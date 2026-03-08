import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { uploadVideo } from "../features/video/videoSlice.js";

const UploadPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { uploadLoading } = useSelector((state) => state.video);
  const [videoPreview, setVideoPreview] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const title = watch("title", "");
  const description = watch("description", "");

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("title", data.title.trim());
    formData.append("description", data.description.trim());
    formData.append("videoFile", data.videoFile[0]);
    formData.append("thumbnail", data.thumbnail[0]);

    const result = await dispatch(uploadVideo(formData));
    if (uploadVideo.fulfilled.match(result)) {
      navigate(`/watch/${result.payload._id}`);
    }
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Upload Video</h1>

      <div className="bg-dark-surface border border-dark-border rounded-2xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Video File */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Video File <span className="text-red-400">*</span>
            </label>
            {videoPreview ? (
              <div className="relative rounded-xl overflow-hidden aspect-video bg-black">
                <video src={videoPreview} controls className="w-full h-full" />
                <button
                  type="button"
                  onClick={() => {
                    URL.revokeObjectURL(videoPreview);
                    setVideoPreview(null);
                  }}
                  className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full hover:bg-black transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-52 border-2 border-dashed border-dark-border rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all">
                <svg className="w-12 h-12 text-dark-subtext mb-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96zM14 13v4h-4v-4H7l5-5 5 5h-3z" />
                </svg>
                <p className="text-dark-subtext text-sm font-medium">Click to upload video</p>
                <p className="text-dark-subtext text-xs mt-1">MP4, WebM, OGG up to 500MB</p>
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  className="hidden"
                  {...register("videoFile", { required: "Video file is required" })}
                  onChange={(e) => {
                    register("videoFile").onChange(e);
                    handleVideoChange(e);
                  }}
                />
              </label>
            )}
            {errors.videoFile && (
              <p className="text-red-400 text-xs mt-1">{errors.videoFile.message}</p>
            )}
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Thumbnail <span className="text-red-400">*</span>
            </label>
            {thumbnailPreview ? (
              <div className="relative rounded-xl overflow-hidden aspect-video max-h-48">
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    URL.revokeObjectURL(thumbnailPreview);
                    setThumbnailPreview(null);
                  }}
                  className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-full hover:bg-black transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-dark-border rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-500/5 transition-all">
                <svg className="w-8 h-8 text-dark-subtext mb-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
                </svg>
                <p className="text-dark-subtext text-xs">Upload thumbnail (JPG, PNG, WebP)</p>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  className="hidden"
                  {...register("thumbnail", { required: "Thumbnail is required" })}
                  onChange={(e) => {
                    register("thumbnail").onChange(e);
                    handleThumbnailChange(e);
                  }}
                />
              </label>
            )}
            {errors.thumbnail && (
              <p className="text-red-400 text-xs mt-1">{errors.thumbnail.message}</p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Title <span className="text-red-400">*</span>
            </label>
            <input
              {...register("title", {
                required: "Title is required",
                minLength: { value: 3, message: "Title must be at least 3 characters" },
                maxLength: { value: 100, message: "Title cannot exceed 100 characters" },
              })}
              placeholder="Enter an engaging video title"
              className="input-field"
            />
            <div className="flex justify-between mt-1">
              {errors.title ? (
                <p className="text-red-400 text-xs">{errors.title.message}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-dark-subtext">{title.length}/100</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              {...register("description", {
                required: "Description is required",
                minLength: { value: 10, message: "Description must be at least 10 characters" },
                maxLength: { value: 2000, message: "Description cannot exceed 2000 characters" },
              })}
              rows={5}
              placeholder="Tell viewers about your video..."
              className="input-field resize-none"
            />
            <div className="flex justify-between mt-1">
              {errors.description ? (
                <p className="text-red-400 text-xs">{errors.description.message}</p>
              ) : (
                <span />
              )}
              <span className="text-xs text-dark-subtext">{description.length}/2000</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={uploadLoading}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploadLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {uploadLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                  Uploading...
                </>
              ) : (
                "Upload Video"
              )}
            </button>
          </div>
        </form>
      </div>

      {uploadLoading && (
        <div className="mt-4 bg-dark-surface border border-dark-border rounded-xl p-4">
          <p className="text-sm text-dark-subtext text-center">
            ⏳ Uploading your video... This may take a few minutes. Please don&apos;t close this tab.
          </p>
        </div>
      )}
    </div>
  );
};

export default UploadPage;

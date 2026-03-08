import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useForm } from "react-hook-form";
import { registerUser, clearError } from "../features/auth/authSlice.js";

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, isAuthenticated, error } = useSelector((state) => state.auth);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    // Clear any previous errors when page loads
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    // If user is already authenticated, redirect to home
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append("fullName", data.fullName);
    formData.append("email", data.email);
    formData.append("username", data.username);
    formData.append("password", data.password);
    formData.append("avatar", data.avatar[0]);
    if (data.coverImage?.[0]) {
      formData.append("coverImage", data.coverImage[0]);
    }

    const result = await dispatch(registerUser(formData));
    if (registerUser.fulfilled.match(result)) {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <svg className="w-10 h-10 text-red-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
            </svg>
            <span className="text-2xl font-bold">VideoTube</span>
          </Link>
          <p className="text-dark-subtext mt-2">Create your account</p>
        </div>

        <div className="bg-dark-surface border border-dark-border rounded-2xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <div className="bg-red-900/20 border border-red-600/30 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                {...register("fullName", { required: "Full name is required" })}
                placeholder="John Doe"
                className="input-field"
              />
              {errors.fullName && <p className="text-red-400 text-xs mt-1">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+$/, message: "Invalid email" },
                })}
                placeholder="john@example.com"
                className="input-field"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input
                {...register("username", {
                  required: "Username is required",
                  pattern: { value: /^[a-zA-Z0-9_]+$/, message: "Only letters, numbers, underscores" },
                })}
                placeholder="johndoe"
                className="input-field"
              />
              {errors.username && <p className="text-red-400 text-xs mt-1">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                {...register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "Minimum 6 characters" },
                })}
                placeholder="••••••••"
                className="input-field"
              />
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Avatar <span className="text-red-400">*</span>
              </label>
              <input
                type="file"
                accept="image/*"
                {...register("avatar", { required: "Avatar is required" })}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) setAvatarPreview(URL.createObjectURL(file));
                }}
                className="block w-full text-sm text-dark-subtext file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-dark-elevated file:text-dark-text hover:file:bg-dark-border"
              />
              {avatarPreview && (
                <img src={avatarPreview} className="mt-2 w-16 h-16 rounded-full object-cover" alt="Preview" />
              )}
              {errors.avatar && <p className="text-red-400 text-xs mt-1">{errors.avatar.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Cover Image (optional)</label>
              <input
                type="file"
                accept="image/*"
                {...register("coverImage")}
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) setCoverPreview(URL.createObjectURL(file));
                }}
                className="block w-full text-sm text-dark-subtext file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-dark-elevated file:text-dark-text hover:file:bg-dark-border"
              />
              {coverPreview && (
                <img src={coverPreview} className="mt-2 w-full h-20 rounded-lg object-cover" alt="Cover preview" />
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors mt-2"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="text-center text-dark-subtext text-sm mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-400 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

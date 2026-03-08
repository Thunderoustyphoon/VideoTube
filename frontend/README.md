# ⚛️ VideoTube Frontend — Chai aur Code Style

> A **production-level** YouTube clone frontend built with React, Redux Toolkit, and Tailwind CSS — following the same philosophy as **Hitesh Choudhary's** chai aur code series.

---

## 📚 Table of Contents

1. [What You'll Learn](#what-youll-learn)
2. [Tech Stack](#tech-stack)
3. [Folder Structure](#folder-structure)
4. [Getting Started](#getting-started)
5. [Core Concepts Explained](#core-concepts-explained)
6. [State Management (Redux Toolkit)](#state-management-redux-toolkit)
7. [API Layer (Axios)](#api-layer-axios)
8. [Routing (React Router v6)](#routing-react-router-v6)
9. [Component Architecture](#component-architecture)
10. [Forms with react-hook-form](#forms-with-react-hook-form)
11. [Authentication Flow](#authentication-flow)
12. [Tailwind CSS Design System](#tailwind-css-design-system)

---

## 🎯 What You'll Learn

- **React 18** — Hooks, composition, state management
- **Redux Toolkit** — createSlice, createAsyncThunk, configureStore
- **Axios** — API calls with interceptors for automatic token refresh
- **React Router v6** — Nested routes, protected routes, outlet pattern
- **react-hook-form** — Performant form management with validation
- **Tailwind CSS** — Utility-first dark mode UI
- **Vite** — Fast build tooling with proxy configuration
- How to structure a **feature-based** frontend architecture
- JWT refresh token strategy on the frontend

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **React 18** | UI library |
| **Vite** | Build tool & dev server |
| **Redux Toolkit** | Global state management |
| **React Redux** | React-Redux bindings |
| **React Router DOM v6** | Client-side routing |
| **Axios** | HTTP client with interceptors |
| **react-hook-form** | Form state & validation |
| **React Player** | Video player component |
| **react-hot-toast** | Beautiful toast notifications |
| **Tailwind CSS** | Utility-first CSS framework |
| **timeago.js** | Human-readable timestamps |

---

## 📁 Folder Structure

```
frontend/
├── public/
├── src/
│   ├── api/                   ← All API call functions
│   │   ├── axiosInstance.js   ← Configured axios with interceptors
│   │   ├── auth.api.js        ← User/auth related API calls
│   │   ├── video.api.js       ← Video related API calls
│   │   └── index.js           ← Comments, likes, subscriptions, playlists, dashboard
│   │
│   ├── components/            ← Reusable UI components
│   │   ├── Layout/
│   │   │   └── RootLayout.jsx ← Main layout (Navbar + Sidebar + Outlet)
│   │   ├── Navbar/
│   │   │   └── Navbar.jsx     ← Top navigation bar
│   │   ├── Sidebar/
│   │   │   └── Sidebar.jsx    ← Left sidebar navigation
│   │   ├── VideoCard/
│   │   │   └── VideoCard.jsx  ← Reusable video thumbnail card
│   │   └── Comments/
│   │       └── CommentSection.jsx ← Full comment system
│   │
│   ├── features/              ← Redux feature slices (chai aur code style)
│   │   ├── auth/
│   │   │   └── authSlice.js   ← Login, logout, register, fetchCurrentUser
│   │   └── video/
│   │       └── videoSlice.js  ← Fetch videos, upload, pagination
│   │
│   ├── pages/                 ← Page-level components (one per route)
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── VideoPage.jsx      ← Video player page
│   │   ├── ChannelPage.jsx    ← Channel profile
│   │   ├── UploadPage.jsx     ← Video upload form
│   │   ├── DashboardPage.jsx  ← Creator dashboard
│   │   ├── LikedVideosPage.jsx
│   │   ├── WatchHistoryPage.jsx
│   │   ├── PlaylistPage.jsx
│   │   └── SearchPage.jsx
│   │
│   ├── store/
│   │   └── store.js           ← Redux store configuration
│   │
│   ├── App.jsx                ← Router configuration + ProtectedRoute
│   ├── main.jsx               ← React entry point + Provider
│   └── index.css              ← Tailwind + global styles
│
├── index.html
├── vite.config.js             ← Vite + proxy config
├── tailwind.config.js
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Backend running at `http://localhost:8000`

### Installation

```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

App runs at: `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview  # Preview the build locally
```

---

## 💡 Core Concepts Explained

### How the app is structured

```
User visits app
  → main.jsx wraps everything in <Provider store={store}> and <Toaster>
  → App.jsx creates the router
  → App.jsx checks localStorage for token, fetches current user
  → RootLayout renders Navbar + Sidebar + <Outlet>
  → Each route renders its Page component inside <Outlet>
```

---

## 🏪 State Management (Redux Toolkit)

### How we use RTK — Chai aur Code approach

We use **feature slices** — one slice per major feature. Each slice contains:
- Initial state
- Reducers (synchronous)
- Extra reducers for async thunks

### Auth Slice Example

```javascript
// features/auth/authSlice.js

// createAsyncThunk handles async operations
export const loginUser = createAsyncThunk(
  "auth/login",        // action type prefix
  async (data, { rejectWithValue }) => {
    try {
      const response = await authApi.loginUser(data);
      // Store tokens in localStorage
      localStorage.setItem("accessToken", response.data.data.accessToken);
      return response.data.data.user;  // returned value becomes action.payload
    } catch (error) {
      return rejectWithValue(error.response?.data?.message);
    }
  }
);

// createSlice combines actions + reducers
const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, loading: false, isAuthenticated: false },
  reducers: {
    // Synchronous actions
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    // Handle async thunk states
    builder
      .addCase(loginUser.pending, (state) => { state.loading = true; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;   // payload = return value from thunk
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;  // payload = rejectWithValue() argument
      });
  },
});
```

### Using Redux in Components

```javascript
import { useSelector, useDispatch } from "react-redux";
import { loginUser } from "../../features/auth/authSlice.js";

const LoginPage = () => {
  // Read state from store
  const { loading, isAuthenticated } = useSelector((state) => state.auth);

  // Get dispatch function to trigger actions
  const dispatch = useDispatch();

  const handleLogin = (data) => {
    dispatch(loginUser(data));  // triggers the async thunk
  };
};
```

---

## 🌐 API Layer (Axios)

### Why we have a separate API layer

Instead of calling `axios.get(...)` everywhere, we:
1. Have one configured **axiosInstance** with base URL
2. Have separate API files for each feature
3. Components never know the URL structure

### Axios Instance with Interceptors

```javascript
// api/axiosInstance.js
const axiosInstance = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,  // sends cookies automatically
});

// REQUEST INTERCEPTOR: Attach access token to every request
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE INTERCEPTOR: Auto-refresh token on 401
axiosInstance.interceptors.response.use(
  (response) => response,  // pass through success
  async (error) => {
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Try to get new access token using refresh token
      const refreshToken = localStorage.getItem("refreshToken");
      const response = await axios.post("/api/v1/users/refresh-token", { refreshToken });

      // Save new tokens
      localStorage.setItem("accessToken", response.data.data.accessToken);

      // Retry the original failed request with new token
      originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
      return axiosInstance(originalRequest);
    }
    return Promise.reject(error);
  }
);
```

**Key concept:** The `_retry` flag prevents infinite loops when the refresh token itself is invalid.

---

## 🗺️ Routing (React Router v6)

### Router Structure

```javascript
// App.jsx
const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,     // persistent layout (navbar + sidebar)
    children: [                   // renders inside <Outlet>
      { index: true, element: <HomePage /> },
      { path: "watch/:videoId", element: <VideoPage /> },
      {
        path: "upload",
        element: (
          <ProtectedRoute>        // wrap private routes
            <UploadPage />
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: "/login", element: <LoginPage /> },   // full-page routes (no layout)
]);
```

### Protected Route Pattern

```javascript
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  if (loading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;  // render the actual page if authenticated
};
```

### RootLayout + Outlet

```javascript
// components/Layout/RootLayout.jsx
const RootLayout = () => {
  return (
    <div>
      <Navbar />          {/* Always visible */}
      <Sidebar />         {/* Always visible */}
      <main>
        <Outlet />        {/* Child route renders here */}
      </main>
    </div>
  );
};
```

---

## 🧩 Component Architecture

### VideoCard — Reusable Component Pattern

```javascript
const VideoCard = ({ video }) => {
  // component receives a `video` object as prop
  // renders thumbnail, title, owner info, views, time
  // Clicking navigates to /watch/:videoId
};

// Used anywhere in the app:
videos.map((video) => <VideoCard key={video._id} video={video} />)
```

### CommentSection — Self-contained Feature Component

The `CommentSection` component:
- Fetches its own data (comments for a videoId)
- Handles pagination internally
- Handles add/edit/delete/like comments
- Uses local state (not Redux) since it's page-specific

```javascript
const CommentSection = ({ videoId }) => {
  const [comments, setComments] = useState([]);
  // self-contained: fetches, displays, and manages comments
};
```

---

## 📝 Forms with react-hook-form

### Why react-hook-form?

- No unnecessary re-renders (unlike controlled inputs with useState)
- Built-in validation
- Easy error messages
- Works great with file inputs

```javascript
const { register, handleSubmit, formState: { errors } } = useForm();

// Register an input
<input
  {...register("email", {
    required: "Email is required",
    pattern: { value: /^\S+@\S+$/, message: "Invalid email format" }
  })}
/>

// Show error
{errors.email && <p>{errors.email.message}</p>}

// Handle submit
<form onSubmit={handleSubmit((data) => {
  // data = validated form values
  dispatch(loginUser(data));
})}>
```

### File Upload with react-hook-form

```javascript
<input
  type="file"
  accept="image/*"
  {...register("avatar", { required: "Avatar is required" })}
  onChange={(e) => {
    const file = e.target.files[0];
    setAvatarPreview(URL.createObjectURL(file)); // show preview
  }}
/>

// On submit, create FormData for multipart/form-data:
const formData = new FormData();
formData.append("avatar", data.avatar[0]);  // data.avatar is FileList
```

---

## 🔐 Authentication Flow

```
1. App loads → check localStorage for accessToken
2. If token exists → dispatch fetchCurrentUser
   → hits /api/v1/users/current-user
   → sets user in Redux store, isAuthenticated = true
3. User logs in → dispatch loginUser
   → stores tokens in localStorage
   → sets user in Redux store
4. Every API request → interceptor attaches token to headers
5. If API returns 401 → interceptor auto-calls /refresh-token
   → saves new tokens → retries original request
6. User logs out → dispatch logoutUser
   → clears localStorage tokens
   → clears Redux store
```

---

## 🎨 Tailwind CSS Design System

### Color System (Defined in tailwind.config.js)

```javascript
colors: {
  brand: { DEFAULT: "#FF0000" },         // YouTube red
  dark: {
    bg: "#0f0f0f",       // Main background (darkest)
    surface: "#212121",  // Cards, surfaces
    elevated: "#272727", // Hover states, elevated elements
    border: "#3f3f3f",   // Borders
    text: "#f1f1f1",     // Primary text
    subtext: "#aaaaaa",  // Secondary text
  }
}
```

### Reusable Component Classes (in index.css)

```css
@layer components {
  .btn-primary {
    @apply bg-white text-black font-semibold px-4 py-2 rounded-full hover:bg-gray-200;
  }

  .btn-secondary {
    @apply bg-dark-elevated text-dark-text font-semibold px-4 py-2 rounded-full hover:bg-dark-border;
  }

  .input-field {
    @apply bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-dark-text
           focus:outline-none focus:border-blue-500 w-full;
  }
}
```

**Usage:** `<button className="btn-primary">Click me</button>`

### Responsive Grid

```jsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {/* sm: 2 cols, lg: 3 cols, xl: 4 cols */}
</div>
```

---

## 🔄 Data Flow Summary

```
User Action
    ↓
Component (dispatch action)
    ↓
Redux Thunk (async API call)
    ↓
API Layer (axiosInstance)
    ↓
Backend API
    ↓
Response → Update Redux State
    ↓
Component re-renders with new data (useSelector)
```

---

## 📖 Learn This Step by Step

**Week 1 — Foundation:**
1. Understand `main.jsx` — how Redux Provider wraps everything
2. Study `store/store.js` — how slices combine into store
3. Read `api/axiosInstance.js` — most important file for API calls

**Week 2 — State Management:**
4. Study `features/auth/authSlice.js` completely
5. Trace through Login flow: LoginPage → dispatch → thunk → slice → component updates
6. Understand `features/video/videoSlice.js`

**Week 3 — Routing & Layout:**
7. Study `App.jsx` — how BrowserRouter + ProtectedRoute work
8. Understand RootLayout + Outlet pattern
9. Study Navbar and Sidebar components

**Week 4 — Complex Components:**
10. Read `pages/VideoPage.jsx` — most complex page
11. Study `components/Comments/CommentSection.jsx` — self-contained component
12. Understand `pages/DashboardPage.jsx` — dashboard with CRUD operations

> **Tip:** Use React DevTools + Redux DevTools browser extensions to see state changes in real-time while you click around the app!

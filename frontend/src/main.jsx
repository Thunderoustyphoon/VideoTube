import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./store/store.js";
import { Toaster } from "react-hot-toast";
import ErrorBoundary from "./components/ErrorBoundary.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#212121",
              color: "#f1f1f1",
            },
          }}
        />
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);

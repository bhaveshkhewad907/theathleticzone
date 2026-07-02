import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import router from "./app/router";
import { AuthProvider } from "./context/AuthContext";
import "./index.css";
import { ErrorBoundary } from "react-error-boundary";
import GlobalErrorFallback from "./components/ui/GlobalErrorFallback";
import { Toaster } from "react-hot-toast";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

// 🚀 SAFE AUTO-RELOAD: Silently refreshes the page if a user hits a dead Vercel chunk
window.addEventListener("vite:preloadError", (event) => {
  event.preventDefault(); // Prevents the ugly browser error text

  // 🛡️ SAFETY NET: Prevent infinite reload loops
  const hasReloaded = sessionStorage.getItem("vite-chunk-reload");

  if (!hasReloaded) {
    // First time encountering the error: Set a flag and refresh
    sessionStorage.setItem("vite-chunk-reload", "true");
    window.location.reload();
  } else {
    // If it already refreshed and still failed, clear the flag and let the ErrorBoundary handle it
    sessionStorage.removeItem("vite-chunk-reload");
  }
});

// Reset the safety flag when the app successfully loads
window.addEventListener("load", () => {
  sessionStorage.removeItem("vite-chunk-reload");
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {/* 1. Moved Toaster inside StrictMode for best practices */}
    <Toaster
      position="top-center"
      toastOptions={{
        className: "",
        style: {
          background: "#121821",
          color: "#fff",
          border: "1px solid rgba(255, 255, 255, 0.05)",
          fontSize: "12px",
          fontWeight: "900",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          borderRadius: "16px",
          boxShadow: "0 20px 40px -15px rgba(0,0,0,0.5)",
        },
        success: {
          iconTheme: {
            primary: "#F59E0B",
            secondary: "#121821",
          },
          style: {
            border: "1px solid rgba(245, 158, 11, 0.2)",
          },
        },
        error: {
          iconTheme: {
            primary: "#EF4444",
            secondary: "#121821",
          },
          style: {
            border: "1px solid rgba(239, 68, 68, 0.2)",
          },
        },
      }}
    />

    <ErrorBoundary
      FallbackComponent={GlobalErrorFallback}
      onReset={() => {
        window.location.reload();
      }}
    >
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ErrorBoundary>

    {/* 🚀 THE FIX: Analytics is now safely inside the React tree! */}
    <Analytics />
    <SpeedInsights />
  </React.StrictMode>,
);

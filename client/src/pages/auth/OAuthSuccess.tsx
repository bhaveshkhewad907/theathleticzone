import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function OAuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    try {
      // Store access token
      localStorage.setItem("accessToken", token);

      // Clean URL (remove token from address bar)
      window.history.replaceState({}, "", "/");

      // 🚀 THE FIX: Let AuthContext handle user, but explicitly push to athlete dashboard
      navigate("/athlete", { replace: true });
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate, searchParams]);

  return null;
}

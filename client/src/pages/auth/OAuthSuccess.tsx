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
      // ✅ Store access token only
      localStorage.setItem("accessToken", token);

      // ✅ Clean URL (remove token from address bar)
      window.history.replaceState({}, "", "/");

      // ✅ Let AuthContext handle user + redirect
      navigate("/", { replace: true });
    } catch {
      navigate("/login", { replace: true });
    }
  }, [navigate, searchParams]);

  return null;
}

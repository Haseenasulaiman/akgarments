import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

const parseTokenFromQuery = (search) => {
  const params = new URLSearchParams(search);
  return params.get("token") || "";
};

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { requestPasswordReset, resetPassword } = useAuth();

  const [token, setToken] = useState(() => parseTokenFromQuery(location.search));
  const [step, setStep] = useState(() => (token ? "reset" : "request"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = parseTokenFromQuery(location.search);
    if (t) {
      setToken(t);
      setStep("reset");
    }
  }, [location.search]);

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await requestPasswordReset(email);
      setStep("check-email");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid or missing reset token");
      navigate("/login");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await resetPassword(token, password);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 text-xs">
      {step === "request" && (
        <>
          <h1 className="text-sm font-semibold text-slate-800 mb-2">
            Forgot your password?
          </h1>
          <p className="text-slate-500 mb-4">
            Enter your email address and we&apos;ll send you a secure link to
            reset your password.
          </p>
          <form
            onSubmit={handleRequest}
            className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3"
          >
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-navy text-offwhite text-xs font-semibold px-4 py-2.5 rounded-full disabled:opacity-60"
            >
              Send reset link
            </button>
          </form>
        </>
      )}

      {step === "check-email" && (
        <div className="bg-white border border-slate-100 rounded-2xl p-4">
          <h1 className="text-sm font-semibold text-slate-800 mb-2">
            Check your email
          </h1>
          <p className="text-slate-500">
            If an account exists for <span className="font-medium">{email}</span>, you&apos;ll receive a link to
            reset your password within a few minutes.
          </p>
        </div>
      )}

      {step === "reset" && (
        <>
          <h1 className="text-sm font-semibold text-slate-800 mb-2">
            Choose a new password
          </h1>
          <p className="text-slate-500 mb-4">
            Create a strong password that you don&apos;t use elsewhere.
          </p>
          <form
            onSubmit={handleReset}
            className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3"
          >
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">
                New password
              </label>
              <input
                type="password"
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-500 mb-1">
                Confirm new password
              </label>
              <input
                type="password"
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-navy text-offwhite text-xs font-semibold px-4 py-2.5 rounded-full disabled:opacity-60"
            >
              Update password
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default ResetPasswordPage;


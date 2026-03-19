import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";

const VerifyOtpPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { verifyOtp } = useAuth();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);

  const email = state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Missing email context");
      navigate("/login");
      return;
    }
    setLoading(true);
    try {
      await verifyOtp(email, otp);
    } catch (err) {
      toast.error(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 text-xs">
      <h1 className="text-sm font-semibold text-slate-800 mb-2">
        Verify your email
      </h1>
      <p className="text-slate-500 mb-4">
        Enter the 6-digit code sent to <span className="font-medium">{email}</span>.
      </p>
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3"
      >
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">OTP</label>
          <input
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 tracking-[0.4em] text-center"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-navy text-offwhite text-xs font-semibold px-4 py-2.5 rounded-full disabled:opacity-60"
        >
          Verify
        </button>
      </form>
    </div>
  );
};

export default VerifyOtpPage;


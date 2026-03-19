import { useState } from "react";
import toast from "react-hot-toast";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const LoginPage = () => {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password, location.state?.from);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-offwhite min-h-[calc(100vh-64px)]">
      <div className="max-w-6xl mx-auto px-4 py-10 md:py-12 space-y-8">
        {/* Common header */}
        <div className="max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.25em] text-slate-500 mb-2">
            AK GARMENTS / SIGN IN
          </p>
          <h1 className="text-3xl md:text-4xl font-display text-navy leading-snug">
            Pick up where{" "}
            <span className="text-amber">your last fit</span> left off.
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Sign in to view saved carts, track your menswear orders, and get
            personalised picks from AK GARMENTS.
          </p>
        </div>

        {/* Desktop: side-by-side. Mobile: auth first, hero below */}
        <div className="md:grid md:grid-cols-2 gap-8 items-stretch">
          <div className="order-1 bg-white rounded-2xl shadow-sm border border-slate-200 px-5 py-6 md:px-6 md:py-7 text-xs text-slate-900 w-full flex flex-col min-h-0">
            <h2 className="text-sm font-semibold mb-1">Sign in</h2>
            <p className="text-[11px] text-slate-500 mb-4">
              Use your email and password to access your AK GARMENTS account.
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-900 text-xs focus:outline-none focus:border-amber"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-600 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-900 text-xs focus:outline-none focus:border-amber"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full disabled:opacity-60 hover:bg-slate-800"
              >
                Sign in
              </button>
            </form>
            <div className="mt-4 flex items-center justify-between text-[11px]">
              <Link
                to="/reset-password"
                className="text-slate-900 font-medium hover:underline"
              >
                Forgot your password?
              </Link>
              <span className="text-slate-500">
                New here?{" "}
                <Link
                  to="/register"
                  className="text-slate-900 hover:underline font-medium"
                >
                  Create account
                </Link>
              </span>
            </div>
          </div>

          <div className="order-2">
            <div
              className="relative h-full min-h-[260px] md:min-h-0 rounded-3xl overflow-hidden bg-slate-900"
              style={{
                backgroundImage:
                  "url('https://images.pexels.com/photos/3755701/pexels-photo-3755701.jpeg?auto=compress&cs=tinysrgb&w=1200')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-offwhite space-y-1 text-xs">
                <div className="text-[10px] uppercase tracking-[0.22em] text-slate-300">
                  MEMBERS • AK GARMENTS
                </div>
                <div className="text-sm font-medium">
                  Tailored menswear, saved just for you.
                </div>
                <p className="text-[11px] text-slate-200">
                  Keep your favourites, sizes, and orders in one clean place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;


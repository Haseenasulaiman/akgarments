import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axiosClient.js";
import { useAuth } from "../context/AuthContext.jsx";

const ContactSupportPage = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      toast.error("Please describe your issue.");
      return;
    }
    try {
      setSubmitting(true);
      await api.post("/support", {
        email: email || undefined,
        message,
      });
      toast.success("Your message has been sent to AK GARMENTS support.");
      setMessage("");
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      toast.error("Could not send your message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10 text-xs space-y-6">
      <div>
        <h1 className="text-sm font-semibold text-slate-800">
          Contact support
        </h1>
        <p className="text-[11px] text-slate-500 mt-1">
          Share your issue or question and we&apos;ll get back to you over
          email.
        </p>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3"
      >
        <div>
          <div className="text-[11px] text-slate-600 mb-1">Your email</div>
          <input
            type="email"
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <div className="text-[11px] text-slate-600 mb-1">Message</div>
          <textarea
            rows={4}
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue, order number (if any), and how we can help..."
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center justify-center px-3 py-1.5 rounded-full text-[11px] font-medium bg-amber text-slate-900 disabled:opacity-60"
        >
          {submitting ? "Sending..." : "Submit to AK GARMENTS"}
        </button>
      </form>
    </div>
  );
};

export default ContactSupportPage;


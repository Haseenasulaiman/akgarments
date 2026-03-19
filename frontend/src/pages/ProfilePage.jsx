import { useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axiosClient.js";
import { useAuth } from "../context/AuthContext.jsx";

const ProfilePage = () => {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
  });

  const save = async () => {
    try {
      const { data } = await api.put("/users/me", form);
      setUser(data);
      toast.success("Profile updated");
    } catch {
      toast.error("Could not update profile");
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 text-xs space-y-4">
      <h1 className="text-sm font-semibold text-slate-800">Profile</h1>
      <div className="space-y-3 bg-white border border-slate-100 rounded-2xl p-4">
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">
            Full name
          </label>
          <input
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">Phone</label>
          <input
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">Email</label>
          <input
            disabled
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5 bg-slate-50 text-slate-500"
            value={user?.email}
          />
        </div>
        <button
          type="button"
          onClick={save}
          className="mt-2 bg-navy text-offwhite text-xs font-semibold px-4 py-2.5 rounded-full"
        >
          Save changes
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;


import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axiosClient.js";

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const load = async () => {
    const { data } = await api.get("/admin/users");
    setUsers(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const toggleBlock = async (id) => {
    await api.patch(`/admin/users/${id}/block`);
    toast.success("User updated");
    await load();
  };

  const remove = async (id) => {
    await api.delete(`/admin/users/${id}`);
    toast.success("User deleted");
    await load();
  };

  const filtered = users.filter((u) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.phone?.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCsv = () => {
    if (!filtered.length) return;
    const header = ["UserId", "Name", "Email", "Phone", "Role", "Blocked"];
    const rows = filtered.map((u) => [
      u._id,
      u.name || "",
      u.email || "",
      u.phone || "",
      u.role,
      u.isBlocked ? "Yes" : "No",
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "customers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-xs space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-sm font-semibold text-slate-800">Users</h1>
        <div className="flex items-center gap-2">
          <input
            placeholder="Search by name, email or phone"
            className="border border-slate-200 rounded-full px-3 py-1.5 text-[11px] w-64"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
          />
          <button
            type="button"
            onClick={exportCsv}
            className="text-[11px] border border-slate-200 rounded-full px-3 py-1 bg-white hover:border-amber/60 hover:text-slate-900"
          >
            Export CSV
          </button>
        </div>
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-2">
        {visible.map((u) => (
          <div
            key={u._id}
            className="flex items-center justify-between border-b last:border-b-0 border-slate-100 py-2 hover:bg-slate-50 rounded-lg px-1"
          >
            <div>
              <div className="font-medium text-slate-800">
                {u.name}{" "}
                <span className="text-[10px] uppercase text-slate-400">
                  {u.role}
                </span>
              </div>
              <div className="text-slate-500">
                {u.email} {u.phone && `• ${u.phone}`}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleBlock(u._id)}
                className={`text-[11px] px-3 py-1 rounded-full border ${
                  u.isBlocked
                    ? "border-rose-300 text-rose-700 bg-rose-50"
                    : "border-emerald-300 text-emerald-700 bg-emerald-50"
                }`}
              >
                {u.isBlocked ? "Blocked" : "Active"}
              </button>
              {u.role !== "admin" && (
                <button
                  type="button"
                  onClick={() => remove(u._id)}
                  className="text-[11px] text-rose-500"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-slate-500">No users yet.</div>
        )}
      </div>
      {filtered.length > 0 && (
        <div className="flex items-center justify-between pt-2 text-[11px]">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="px-2 py-1 rounded border border-slate-200 disabled:opacity-50"
          >
            Prev
          </button>
          <div>
            Page {page} of {totalPages}
          </div>
          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="px-2 py-1 rounded border border-slate-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;


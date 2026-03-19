import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axiosClient.js";

const empty = {
  code: "",
  discountType: "percentage",
  amount: "",
  thresholdAmount: "",
};

const AdminCouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(empty);

  const load = async () => {
    const { data } = await api.get("/coupons");
    setCoupons(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post("/coupons", {
        ...form,
        amount: Number(form.amount),
        thresholdAmount: form.thresholdAmount
          ? Number(form.thresholdAmount)
          : 0,
      });
      toast.success("Coupon created");
      setForm(empty);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create coupon");
    }
  };

  const remove = async (id) => {
    await api.delete(`/coupons/${id}`);
    toast.success("Coupon deleted");
    await load();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-xs space-y-4">
      <h1 className="text-sm font-semibold text-slate-800">Coupons</h1>
      <form
        onSubmit={create}
        className="bg-white border border-slate-100 rounded-2xl p-4 grid grid-cols-5 gap-3"
      >
        <input
          placeholder="CODE"
          className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs col-span-1"
          value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
          required
        />
        <select
          className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs col-span-1"
          value={form.discountType}
          onChange={(e) => setForm({ ...form, discountType: e.target.value })}
        >
          <option value="percentage">% off</option>
          <option value="fixed">Flat off</option>
        </select>
        <input
          placeholder="Amount"
          type="number"
          className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs col-span-1"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          required
        />
        <input
          placeholder="Min bill (e.g. 5000)"
          type="number"
          className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs col-span-1"
          value={form.thresholdAmount}
          onChange={(e) =>
            setForm({ ...form, thresholdAmount: e.target.value })
          }
        />
        <button
          type="submit"
          className="bg-navy text-offwhite text-xs font-semibold px-4 py-2.5 rounded-full col-span-1"
        >
          Add coupon
        </button>
      </form>
      <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-2">
        {coupons.map((c) => (
          <div
            key={c._id}
            className="flex items-center justify-between border-b last:border-b-0 border-slate-100 py-2"
          >
            <div className="flex-1">
              <div className="font-medium text-slate-800">{c.code}</div>
              <div className="text-slate-500">
                {c.discountType === "percentage" ? `${c.amount}%` : `₹${c.amount}`}{" "}
                off · Min bill Rs{" "}
                {c.thresholdAmount || c.minOrderValue || 0}
              </div>
              <div className="text-[11px] text-slate-500">
                Used {c.usedCount || 0} time
                {(c.usedCount || 0) === 1 ? "" : "s"}
              </div>
              {Array.isArray(c.usageLog) && c.usageLog.length > 0 && (
                <div className="mt-1 border-t border-slate-100 pt-1">
                  <div className="text-[11px] text-slate-500 mb-1">
                    Recent usage
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {c.usageLog
                      .slice()
                      .reverse()
                      .slice(0, 5)
                      .map((u) => (
                        <div
                          key={u._id || `${c._id}-${u.order}`}
                          className="flex items-center justify-between text-[11px]"
                        >
                          <div className="text-slate-600">
                            {u.user?.name || "Customer"}{" "}
                            {u.user?.email && (
                              <span className="text-slate-400">
                                • {u.user.email}
                              </span>
                            )}
                          </div>
                          <div className="text-right text-slate-600">
                            <div>Bill Rs {u.amount}</div>
                            <div className="text-emerald-600">
                              Saved Rs {u.discount}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={() => remove(c._id)}
              className="text-[11px] text-rose-500 hover:text-rose-600"
            >
              Delete
            </button>
          </div>
        ))}
        {coupons.length === 0 && (
          <div className="text-slate-500">No coupons yet.</div>
        )}
      </div>
    </div>
  );
};

export default AdminCouponsPage;


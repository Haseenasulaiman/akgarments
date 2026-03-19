import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axiosClient.js";

const badgeClasses = {
  Pending: "bg-amber/10 text-amber border-amber/40",
  Processing: "bg-sky-100 text-sky-700 border-sky-300",
  Shipped: "bg-blue-100 text-blue-700 border-blue-300",
  Delivered: "bg-emerald-100 text-emerald-700 border-emerald-300",
  Cancelled: "bg-rose-50 text-rose-600 border-rose-200",
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get("/orders");
      setOrders(data);
    };
    load();
  }, []);

  const cancelOrder = async (id) => {
    try {
      await api.post(`/orders/${id}/cancel`, { reason: "Cancelled from orders list" });
      toast.success("Order cancelled");
      const { data } = await api.get("/orders");
      setOrders(data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cancel order");
    }
  };

  const filtered = orders.filter((o) =>
    filter === "All" ? true : o.status === filter
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-xs space-y-4">
      <h1 className="text-sm font-semibold text-slate-800">Your orders</h1>
      {orders.length === 0 ? (
        <div className="text-slate-500">No orders yet. Your next fit awaits.</div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 mb-2">
            {["All", "Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map(
              (status) => (
                <button
                  type="button"
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1 rounded-full border text-[11px] ${
                    filter === status
                      ? "border-navy bg-navy text-offwhite"
                      : "border-slate-200 text-slate-600"
                  }`}
                >
                  {status}
                </button>
              )
            )}
          </div>
          {filtered.map((o) => {
            const canCancel = ["Pending", "Processing"].includes(o.status);
            const created = new Date(o.createdAt);
            const eta = new Date(created.getTime() + 5 * 24 * 60 * 60 * 1000);
            const preview = (o.items || []).slice(0, 2);
            return (
              <div
                key={o._id}
                className="flex items-center justify-between bg-white border border-slate-100 rounded-2xl px-4 py-3 hover:border-amber/60"
              >
                <Link to={`/orders/${o._id}`} className="flex-1">
                  <div>
                    <div className="font-medium text-slate-800">
                      Order #{o._id.slice(-6)}
                    </div>
                    <div className="text-slate-500">
                      {new Date(o.createdAt).toLocaleDateString()} •{" "}
                      {o.items?.length || 0} items
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      {preview.map((it, idx) => (
                        <div
                          key={`${it.product}-${idx}`}
                          className="flex items-center gap-2"
                        >
                          <div className="h-9 w-9 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                            {it.imageSnapshot ? (
                              <img
                                src={it.imageSnapshot}
                                alt={it.nameSnapshot}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-400">
                                AK
                              </div>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-700 line-clamp-1 max-w-[10rem]">
                            {it.nameSnapshot}
                          </div>
                        </div>
                      ))}
                      {(o.items?.length || 0) > 2 && (
                        <div className="text-[11px] text-slate-500">
                          +{(o.items?.length || 0) - 2} more
                        </div>
                      )}
                    </div>
                    {["Pending", "Processing", "Shipped"].includes(o.status) && (
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Delivery by{" "}
                        <span className="font-medium">
                          {eta.toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="flex items-center gap-3 ml-4">
                  <span className="font-semibold text-amber">
                    ₹{o.totals?.grandTotal}
                  </span>
                  <span
                    className={`border text-[10px] px-2 py-0.5 rounded-full ${
                      badgeClasses[o.status] || "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {o.status}
                  </span>
                  {canCancel && (
                    <button
                      type="button"
                      onClick={() => cancelOrder(o._id)}
                      className="text-[11px] text-rose-500"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;


import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axiosClient.js";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  const load = async () => {
    const { data } = await api.get("/orders/admin/all");
    setOrders(data || []);
  };

  useEffect(() => {
    load();
  }, []);

  const openDetail = async (orderId) => {
    setSelected(orderId);
    setLoadingDetail(true);
    try {
      const { data } = await api.get(`/orders/admin/${orderId}`);
      setDetail(data);
    } catch (err) {
      toast.error("Could not load order details");
      setDetail(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  const closeDetail = () => {
    setSelected(null);
    setDetail(null);
  };

  const totalPages = Math.ceil(orders.length / PAGE_SIZE) || 1;
  const visible = orders.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCsv = () => {
    if (!orders.length) return;
    const header = ["OrderId", "Customer", "Email", "Total", "Status", "CreatedAt"];
    const rows = orders.map((o) => [
      o._id,
      o.user?.name || "",
      o.user?.email || "",
      o.totals?.grandTotal || 0,
      o.status,
      new Date(o.createdAt).toISOString(),
    ]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/admin/${id}/status`, { status });
      toast.success("Status updated");
      await load();
    } catch {
      toast.error("Could not update status");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-xs space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-sm font-semibold text-slate-800">All orders</h1>
        <button
          type="button"
          onClick={exportCsv}
          className="text-[11px] border border-slate-200 rounded-full px-3 py-1 bg-white hover:border-amber/60 hover:text-slate-900"
        >
          Export CSV
        </button>
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-2">
        {visible.map((o) => (
          <div
            key={o._id}
            className="flex items-center justify-between border-b last:border-b-0 border-slate-100 py-2 cursor-pointer hover:bg-slate-50 rounded-lg px-1"
            onClick={() => openDetail(o._id)}
          >
            <div>
              <div className="font-medium text-slate-800">
                #{o._id.slice(-6)} • ₹{o.totals?.grandTotal}
              </div>
              <div className="text-slate-500">
                {o.user?.name} • {new Date(o.createdAt).toLocaleString()}
              </div>
            </div>
            <select
              value={o.status}
              onChange={(e) => {
                e.stopPropagation();
                updateStatus(o._id, e.target.value);
              }}
              className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
            >
              {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map(
                (s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                )
              )}
            </select>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="text-slate-500">No orders yet.</div>
        )}
      </div>
      {orders.length > 0 && (
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

      {selected && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full mx-4 p-4 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-800">
                Order details #{selected.slice(-6)}
              </div>
              <button
                type="button"
                onClick={closeDetail}
                className="text-[11px] text-slate-500"
              >
                Close
              </button>
            </div>
            {loadingDetail && (
              <div className="text-slate-500">Loading order…</div>
            )}
            {detail && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[11px] text-slate-500 mb-1">
                      Customer
                    </div>
                    <div className="text-slate-800">
                      {detail.user?.name || "Customer"}
                    </div>
                    {detail.user?.email && (
                      <div className="text-slate-500">
                        {detail.user.email}
                      </div>
                    )}
                    {detail.user?.phone && (
                      <div className="text-slate-500">
                        {detail.user.phone}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] text-slate-500 mb-1">
                      Summary
                    </div>
                    <div className="text-slate-800">
                      Status: {detail.status} • Payment:{" "}
                      {detail.paymentStatus}
                    </div>
                    <div className="text-slate-500">
                      Placed at{" "}
                      {new Date(detail.createdAt).toLocaleString()}
                    </div>
                    {detail.coupon?.code && (
                      <div className="text-emerald-700">
                        Coupon {detail.coupon.code} saved Rs{" "}
                        {detail.coupon.discount}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-slate-500 mb-1">
                    Shipping address
                  </div>
                  <div className="text-slate-700">
                    {detail.shippingAddress?.name}
                  </div>
                  <div className="text-slate-500">
                    {detail.shippingAddress?.line1}
                    {detail.shippingAddress?.line2
                      ? `, ${detail.shippingAddress.line2}`
                      : ""}
                  </div>
                  <div className="text-slate-500">
                    {detail.shippingAddress?.city},{" "}
                    {detail.shippingAddress?.state} -{" "}
                    {detail.shippingAddress?.pincode}
                  </div>
                </div>
                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <div className="bg-slate-50 px-3 py-2 font-medium text-slate-700">
                    Items
                  </div>
                  <div className="divide-y divide-slate-100">
                    {detail.items?.map((it) => (
                      <div
                        key={`${it.product}-${it.size}-${it.nameSnapshot}`}
                        className="px-3 py-2 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-slate-800">
                            {it.nameSnapshot}
                          </div>
                          <div className="text-slate-500">
                            {it.size} • Qty {it.quantity}
                          </div>
                        </div>
                        <div className="text-right text-slate-800">
                          <div>Rs {it.priceSnapshot}</div>
                          <div className="text-[11px] text-slate-500">
                            Subtotal Rs {it.subtotal}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-end">
                  <div className="text-right text-xs space-y-1">
                    <div>Subtotal: Rs {detail.totals?.subtotal}</div>
                    <div>Discount: Rs {detail.totals?.discount}</div>
                    <div>Tax: Rs {detail.totals?.tax}</div>
                    <div>Shipping: Rs {detail.totals?.shipping}</div>
                    <div className="font-semibold text-slate-900">
                      Grand total: Rs {detail.totals?.grandTotal}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;


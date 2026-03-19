import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axiosClient.js";

const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data);
      } catch (err) {
        toast.error(
          err.response?.data?.message || "Could not load order details"
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-xs">Loading...</div>;
  }

  if (!order) {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Order not found.
      </div>
    );
  }

  const apiBase = import.meta.env.VITE_API_URL;
  const invoiceUrl =
    order._id && apiBase
      ? `${apiBase.replace("/api", "")}/api/invoices/${order._id}/download`
      : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-800">
            Order #{order._id.slice(-6)}
          </div>
          <div className="text-slate-500">
            {new Date(order.createdAt).toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-600">
            Status: <span className="font-semibold">{order.status}</span>
            {order.returnStatus !== "None" && (
              <> • Return: {order.returnStatus}</>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {invoiceUrl && (
            <a
              href={invoiceUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs border border-slate-300 rounded-full px-3 py-1 hover:border-amber hover:text-amber"
            >
              Download invoice
            </a>
          )}
          {["Pending", "Processing"].includes(order.status) && (
            <button
              type="button"
              onClick={async () => {
                try {
                  const { data } = await api.post(`/orders/${id}/cancel`, {
                    reason: "Cancelled from order details",
                  });
                  setOrder(data);
                  toast.success("Order cancelled");
                } catch (err) {
                  toast.error(
                    err.response?.data?.message || "Could not cancel order"
                  );
                }
              }}
              className="text-xs text-rose-500 border border-rose-200 rounded-full px-3 py-1"
            >
              Cancel order
            </button>
          )}
          {order.status === "Delivered" && order.returnStatus === "None" && (
            <button
              type="button"
              onClick={async () => {
                try {
                  const { data } = await api.post(`/orders/${id}/return`);
                  setOrder(data);
                  toast.success("Return requested");
                } catch (err) {
                  toast.error(
                    err.response?.data?.message || "Could not request return"
                  );
                }
              }}
              className="text-xs text-slate-700 border border-slate-300 rounded-full px-3 py-1"
            >
              Request return
            </button>
          )}
        </div>
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
        {order.items.map((item) => (
          <div
            key={`${item.product}-${item.size}`}
            className="flex justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                {item.imageSnapshot ? (
                  <img
                    src={item.imageSnapshot}
                    alt={item.nameSnapshot}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                    AK
                  </div>
                )}
              </div>
              <div>
                <div className="text-slate-800">{item.nameSnapshot}</div>
                <div className="text-slate-500">
                  Size {item.size} • Qty {item.quantity}
                </div>
              </div>
            </div>
            <div className="font-semibold text-amber">₹{item.subtotal}</div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-2">
        <div className="flex justify-between">
          <span className="text-slate-500">Subtotal</span>
          <span>₹{order.totals.subtotal}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Tax</span>
          <span>₹{order.totals.tax}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Shipping</span>
          <span>₹{order.totals.shipping}</span>
        </div>
        <div className="border-t border-slate-200 pt-2 flex justify-between font-semibold">
          <span>Total</span>
          <span className="text-amber">₹{order.totals.grandTotal}</span>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;


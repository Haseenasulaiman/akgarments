import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import api from "../../api/axiosClient.js";

const AdminDashboardPage = () => {
  const [stats, setStats] = useState({
    revenue: 0,
    totalOrders: 0,
    ordersByStatus: {},
    totalCustomers: 0,
    newCustomersLast30Days: 0,
  });
  const [series, setSeries] = useState({ daily: [], weekly: [], monthly: [] });
  const [lowStock, setLowStock] = useState({ threshold: 0, products: [] });
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [overviewResp, seriesResp, lowStockResp, topProductsResp] =
          await Promise.all([
            api.get("/admin/stats/overview"),
            api.get("/admin/stats/revenue-series"),
            api.get("/admin/inventory/low-stock"),
            api.get("/admin/stats/top-products"),
          ]);
        setStats(overviewResp.data);
        setSeries(seriesResp.data);
        setLowStock(lowStockResp.data || { threshold: 0, products: [] });
        setTopProducts(topProductsResp.data || []);
      } catch {
        // ignore
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-xs space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-sm font-semibold text-slate-800">
            Store control center
          </h1>
          <div className="text-[11px] text-slate-500">
            AK GARMENTS menswear analytics • daily / weekly / monthly performance
          </div>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/admin/orders"
            className="text-[11px] border border-slate-200 rounded-full px-3 py-1 bg-white hover:border-amber/60 hover:text-slate-900"
          >
            Manage orders
          </a>
          <a
            href="/admin/products"
            className="text-[11px] border border-slate-200 rounded-full px-3 py-1 bg-white hover:border-amber/60 hover:text-slate-900"
          >
            Manage products
          </a>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-3 space-y-1">
          <div className="text-[11px] text-slate-500">Total revenue</div>
          <div className="text-lg font-semibold text-amber">
            ₹{stats.revenue}
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-3 space-y-1">
          <div className="text-[11px] text-slate-500">Orders</div>
          <div className="text-lg font-semibold text-slate-800">
            {stats.totalOrders}
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-3 space-y-1">
          <div className="text-[11px] text-slate-500">Customers</div>
          <div className="text-lg font-semibold text-slate-800">
            {stats.totalCustomers}
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-3 space-y-1">
          <div className="text-[11px] text-slate-500">New (30 days)</div>
          <div className="text-lg font-semibold text-slate-800">
            {stats.newCustomersLast30Days}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-3 space-y-1">
          <div className="text-[11px] text-slate-500">Total products</div>
          <div className="text-lg font-semibold text-slate-800">
            {stats.totalProducts || 0}
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-3 space-y-1">
          <div className="text-[11px] text-slate-500">Low stock items</div>
          <div className="text-lg font-semibold text-rose-600">
            {lowStock.products?.length || 0}
          </div>
          <div className="text-[10px] text-slate-400">
            Threshold ≤ {lowStock.threshold}
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-3 space-y-1">
          <div className="text-[11px] text-slate-500">Order status</div>
          <div className="text-[10px] text-slate-500 space-y-0.5">
            {Object.entries(stats.ordersByStatus || {}).map(([k, v]) => (
              <div key={k}>
                {k}: <span className="font-semibold text-slate-800">{v}</span>
              </div>
            ))}
            {Object.keys(stats.ordersByStatus || {}).length === 0 && (
              <div>No orders yet</div>
            )}
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-3 space-y-1">
          <div className="text-[11px] text-slate-500">Top products</div>
          <div className="text-[10px] text-slate-500 space-y-0.5 max-h-24 overflow-y-auto">
            {topProducts.map((p) => (
              <div key={p.productId}>
                {p.name} • {p.quantity} pcs • ₹{Math.round(p.revenue)}
              </div>
            ))}
            {topProducts.length === 0 && <div>No sales yet</div>}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Revenue last 30 days */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
          <div className="text-[11px] text-slate-500">
            Revenue last 30 days
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={series.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" hide />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Orders last 30 days */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
          <div className="text-[11px] text-slate-500">
            Orders last 30 days
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={series.daily}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" hide />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#0f172a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Top products chart */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
          <div className="text-[11px] text-slate-500">
            Top products
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="quantity" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {/* Low stock alerts */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-2">
          <div className="text-[11px] text-slate-500">
            ⚠ Low stock items: {lowStock.products?.length || 0}
          </div>
          <div className="max-h-32 overflow-y-auto text-[11px]">
            {lowStock.products?.length ? (
              lowStock.products.slice(0, 5).map((p) => {
                const stocks = (p.sizes || []).map((s) => s.stock);
                const minStock =
                  stocks.length > 0 ? Math.min(...stocks) : p.sizes?.[0]?.stock || 0;
                return (
                  <div key={p._id} className="text-rose-600">
                    {p.name} — only {minStock} left
                  </div>
                );
              })
            ) : (
              <div className="text-slate-500">No low stock alerts.</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-100 rounded-2xl p-4">
          <div className="text-[11px] text-slate-500 mb-2">
            Daily details
          </div>
          <div className="grid grid-cols-3 text-[11px] text-slate-500 pb-2 border-b border-slate-100">
            <div>Date</div>
            <div className="text-center">Orders</div>
            <div className="text-right">Revenue</div>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {series.daily
              .slice()
              .reverse()
              .map((d) => (
                <div
                  key={d.date}
                  className="grid grid-cols-3 py-2 border-b last:border-b-0 border-slate-50"
                >
                  <div className="text-slate-700">{d.date}</div>
                  <div className="text-center text-slate-600">{d.orders}</div>
                  <div className="text-right font-semibold text-amber">
                    ₹{Math.round(d.revenue)}
                  </div>
                </div>
              ))}
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-4">
          <div className="text-[11px] text-slate-500 mb-2">
            Recent orders
          </div>
          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
            {(stats.recentOrders || []).map((o) => (
              <div key={o._id} className="py-2 flex items-center justify-between">
                <div>
                  <div className="text-slate-800 text-[11px] font-medium">
                    #{o._id.slice(-6)} • ₹{o.totals?.grandTotal}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {o.user?.name || "Customer"} •{" "}
                    {new Date(o.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-[11px] text-slate-600">{o.status}</div>
              </div>
            ))}
            {(stats.recentOrders || []).length === 0 && (
              <div className="text-[11px] text-slate-500">No recent orders</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;


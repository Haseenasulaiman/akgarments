import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axiosClient.js";

const AdminSettingsPage = () => {
  const [settings, setSettings] = useState({
    taxRate: 5,
    shippingFlat: 0,
    maintenanceMode: false,
    lowStockThreshold: 5,
  });

  useEffect(() => {
    const load = async () => {
      const { data } = await api.get("/admin/settings");
      setSettings((prev) => ({ ...prev, ...(data || {}) }));
    };
    load();
  }, []);

  const save = async () => {
    await api.put("/admin/settings", settings);
    toast.success("Settings saved");
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 text-xs space-y-4">
      <h1 className="text-sm font-semibold text-slate-800">System settings</h1>
      <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">
            Tax rate (%)
          </label>
          <input
            type="number"
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
            value={settings.taxRate}
            onChange={(e) =>
              setSettings({ ...settings, taxRate: Number(e.target.value) })
            }
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">
            Flat shipping charge (₹)
          </label>
          <input
            type="number"
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
            value={settings.shippingFlat}
            onChange={(e) =>
              setSettings({
                ...settings,
                shippingFlat: Number(e.target.value),
              })
            }
          />
        </div>
        <div>
          <label className="block text-[11px] text-slate-500 mb-1">
            Low stock threshold
          </label>
          <input
            type="number"
            className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
            value={settings.lowStockThreshold}
            onChange={(e) =>
              setSettings({
                ...settings,
                lowStockThreshold: Number(e.target.value),
              })
            }
          />
        </div>
        <div className="flex items-center gap-2 pt-2">
          <input
            id="maintenance"
            type="checkbox"
            checked={!!settings.maintenanceMode}
            onChange={(e) =>
              setSettings({ ...settings, maintenanceMode: e.target.checked })
            }
          />
          <label htmlFor="maintenance" className="text-[11px] text-slate-600">
            Enable maintenance mode (show downtime screen to customers)
          </label>
        </div>
        <button
          type="button"
          onClick={save}
          className="mt-3 bg-navy text-offwhite text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-charcoal disabled:opacity-60"
        >
          Save settings
        </button>
      </div>
    </div>
  );
};

export default AdminSettingsPage;


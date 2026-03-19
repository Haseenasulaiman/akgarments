import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../../api/axiosClient.js";

const emptyForm = {
  name: "",
  slug: "",
  category: "",
  subcategory: "",
  price: "",
  discountedPrice: "",
  colors: "",
  sizes: {
    S: 0,
    M: 0,
    L: 0,
    XL: 0,
    XXL: 0,
  },
  image: "",
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const PAGE_SIZE = 10;

  const load = async () => {
    const { data } = await api.get("/products", { params: { limit: 100 } });
    setProducts(data.items || []);
    setPage(1);
  };

  useEffect(() => {
    load();
  }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      const payload = buildPayload(form);
      if (editing) {
        await api.put(`/products/${editing}`, payload);
        toast.success("Product updated");
      } else {
        await api.post("/products", payload);
        toast.success("Product created");
      }
      setForm(emptyForm);
      setEditing(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not create product");
    }
  };

  const toggleActive = async (id) => {
    await api.patch(`/products/${id}/toggle-active`);
    await load();
  };

  const remove = async (id) => {
    await api.delete(`/products/${id}`);
    toast.success("Product deleted");
    await load();
  };

  const startEdit = (p) => {
    setEditing(p._id);
    setForm({
      name: p.name || "",
      slug: p.slug || "",
      category: p.category || "",
      subcategory: p.subcategory || "",
      price: p.price?.toString() || "",
      discountedPrice: p.discountedPrice?.toString() || "",
      colors: (p.colors || []).join(", "),
      sizes: {
        S: p.sizes?.find((s) => s.size === "S")?.stock || 0,
        M: p.sizes?.find((s) => s.size === "M")?.stock || 0,
        L: p.sizes?.find((s) => s.size === "L")?.stock || 0,
        XL: p.sizes?.find((s) => s.size === "XL")?.stock || 0,
        XXL: p.sizes?.find((s) => s.size === "XXL")?.stock || 0,
      },
      image: p.images?.[0] || "",
    });
  };

  const buildPayload = (f) => ({
    name: f.name,
    slug: f.slug,
    category: f.category,
    subcategory: f.subcategory || undefined,
    price: Number(f.price),
    discountedPrice: f.discountedPrice ? Number(f.discountedPrice) : undefined,
    colors: f.colors
      ? f.colors
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean)
      : [],
    sizes: Object.entries(f.sizes).map(([size, stock]) => ({
      size,
      stock: Number(stock) || 0,
    })),
    images: f.image ? [f.image] : [],
  });

  const totalPages = Math.ceil(products.length / PAGE_SIZE) || 1;
  const visible = products.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCsv = async () => {
    try {
      setExporting(true);
      const resp = await api.get("/products/admin/export/csv", {
        responseType: "blob",
      });

      const cd = resp.headers?.["content-disposition"];
      const match = cd?.match(/filename="?([^"]+)"?/i);
      const filename = match?.[1] || "ak-garments-products.csv";

      const blob =
        resp.data instanceof Blob
          ? resp.data
          : new Blob([resp.data], { type: "text/csv;charset=utf-8;" });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Could not export products CSV"
      );
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-xs space-y-6">
      <h1 className="text-sm font-semibold text-slate-800">
        Products management
      </h1>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-slate-500">
          Total products: {products.length}
        </span>
        {products.length > 0 && (
          <button
            type="button"
            onClick={exportCsv}
            disabled={exporting}
            className="text-[11px] px-3 py-1.5 rounded-full border border-slate-200 text-slate-700 hover:border-amber/60 hover:text-slate-900 bg-white"
          >
            {exporting ? "Exporting..." : "Export as CSV"}
          </button>
        )}
      </div>
      <form
        onSubmit={create}
        className="bg-white border border-slate-100 rounded-2xl p-4 grid grid-cols-4 gap-3"
      >
        <input
          placeholder="Name"
          className="col-span-2 border border-slate-200 rounded-lg px-2 py-1.5"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Slug"
          className="col-span-2 border border-slate-200 rounded-lg px-2 py-1.5"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          required
        />
        <input
          placeholder="Category"
          className="col-span-2 border border-slate-200 rounded-lg px-2 py-1.5"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
          required
        />
        <input
          placeholder="Subcategory (optional)"
          className="col-span-2 border border-slate-200 rounded-lg px-2 py-1.5"
          value={form.subcategory}
          onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
        />
        <input
          placeholder="Price"
          type="number"
          className="border border-slate-200 rounded-lg px-2 py-1.5"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
        <input
          placeholder="Discounted price (optional)"
          type="number"
          className="border border-slate-200 rounded-lg px-2 py-1.5"
          value={form.discountedPrice}
          onChange={(e) =>
            setForm({ ...form, discountedPrice: e.target.value })
          }
        />
        <input
          placeholder="Colors (comma separated)"
          className="col-span-2 border border-slate-200 rounded-lg px-2 py-1.5"
          value={form.colors}
          onChange={(e) => setForm({ ...form, colors: e.target.value })}
        />
        <input
          placeholder="Main image URL"
          className="col-span-2 border border-slate-200 rounded-lg px-2 py-1.5"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />
        <div className="col-span-4 grid grid-cols-5 gap-2">
          {["S", "M", "L", "XL", "XXL"].map((size) => (
            <div key={size}>
              <div className="text-[10px] text-slate-500 mb-1">{size}</div>
              <input
                type="number"
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
                value={form.sizes[size]}
                onChange={(e) =>
                  setForm({
                    ...form,
                    sizes: {
                      ...form.sizes,
                      [size]: e.target.value,
                    },
                  })
                }
              />
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="bg-navy text-offwhite text-xs font-semibold px-4 py-2.5 rounded-full"
        >
          {editing ? "Save changes" : "Add product"}
        </button>
        {editing && (
          <button
            type="button"
            onClick={() => {
              setEditing(null);
              setForm(emptyForm);
            }}
            className="text-[11px] text-slate-500 underline"
          >
            Cancel edit
          </button>
        )}
      </form>
      <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-2">
        {visible.map((p) => (
          <div
            key={p._id}
            className="flex items-center justify-between border-b last:border-b-0 border-slate-100 py-2"
          >
            <div>
              <div className="font-medium text-slate-800">{p.name}</div>
              <div className="text-slate-500">
                ₹{p.price} • {p.category}{" "}
                {p.subcategory && `• ${p.subcategory}`}
              </div>
              <div className="text-[10px] text-slate-500">
                Sizes:{" "}
                {p.sizes
                  ?.map((s) => `${s.size}:${s.stock}`)
                  .join(", ") || "none"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleActive(p._id)}
                className={`text-[11px] px-3 py-1 rounded-full border ${
                  p.isActive
                    ? "border-emerald-300 text-emerald-700 bg-emerald-50"
                    : "border-slate-200 text-slate-600 bg-slate-50"
                }`}
              >
                {p.isActive ? "Active" : "Inactive"}
              </button>
              <button
                type="button"
                onClick={() => startEdit(p)}
                className="text-[11px] text-slate-600"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => remove(p._id)}
                className="text-[11px] text-rose-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {products.length === 0 && (
          <div className="text-slate-500">No products yet.</div>
        )}
      </div>
      {products.length > 0 && (
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

export default AdminProductsPage;


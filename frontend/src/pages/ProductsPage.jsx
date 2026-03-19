import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axiosClient.js";
import ProductCard from "../components/products/ProductCard.jsx";
import FilterSidebar from "../components/products/FilterSidebar.jsx";

const PAGE_SIZE = 24;

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({});
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const category = searchParams.get("category");
    setFilters((prev) => ({
      ...prev,
      category: category || undefined,
    }));
    setPage(1);
  }, [searchParams]);

  useEffect(() => {
    setPage(1);
  }, [filters.category, filters.size, filters.fit, filters.minPrice, filters.maxPrice]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/products", {
          params: { ...filters, page, limit: PAGE_SIZE },
        });
        setProducts(data.items || []);
        setTotal(data.total ?? 0);
        setPages(data.pages ?? 1);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [filters, page]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6">
      <FilterSidebar filters={filters} setFilters={setFilters} />
      <div className="flex-1 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-semibold tracking-wide text-slate-800">
            All products
          </h1>
          <select
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5"
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, sort: e.target.value || undefined }));
              setPage(1);
            }}
          >
            <option value="">Sort</option>
            <option value="price_asc">Price: Low to high</option>
            <option value="price_desc">Price: High to low</option>
            <option value="newest">Newest</option>
          </select>
        </div>
        {loading ? (
          <div className="p-8 text-xs text-slate-500">Loading products...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
              {products.length === 0 && (
                <div className="col-span-full text-xs text-slate-500">
                  No products match your filters yet.
                </div>
              )}
            </div>
            {pages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-6">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-600">
                  Page {page} of {pages}
                </span>
                <button
                  type="button"
                  disabled={page >= pages}
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;


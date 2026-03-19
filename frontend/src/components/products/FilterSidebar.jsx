const TOP_CATEGORIES = [
  "Shirts",
  "T-Shirts",
  "Jeans",
  "Ethnic",
  "Inners",
  "Shorts",
  "Track Pants",
  "Pants",
  "Nightwear",
];

const FilterSidebar = ({ filters, setFilters }) => {

  const update = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <aside className="w-full md:w-64 bg-white rounded-2xl border border-slate-100 p-4 space-y-4 text-xs">
      <div>
        <div className="font-semibold text-sm mb-2">Category</div>
        <select
          value={filters.category || ""}
          onChange={(e) => update("category", e.target.value || undefined)}
          className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
        >
          <option value="">All</option>
          {TOP_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      <div>
        <div className="font-semibold text-sm mb-2">Size</div>
        <div className="flex flex-wrap gap-1.5">
          {["S", "M", "L", "XL", "XXL"].map((size) => {
            const active = filters.size === size;
            return (
              <button
                type="button"
                key={size}
                onClick={() => update("size", active ? undefined : size)}
                className={`px-2 py-0.5 rounded-full border text-[11px] ${
                  active
                    ? "bg-navy text-offwhite border-navy"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div className="font-semibold text-sm mb-2">Fit</div>
        <div className="flex flex-wrap gap-1.5">
          {["slim", "regular", "relaxed"].map((fit) => {
            const active = filters.fit === fit;
            return (
              <button
                type="button"
                key={fit}
                onClick={() => update("fit", active ? undefined : fit)}
                className={`px-2 py-0.5 rounded-full border text-[11px] capitalize ${
                  active
                    ? "bg-navy text-offwhite border-navy"
                    : "border-slate-200 text-slate-600"
                }`}
              >
                {fit}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <div className="font-semibold text-sm mb-2">Price range</div>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            className="w-1/2 border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
            value={filters.minPrice || ""}
            onChange={(e) => update("minPrice", e.target.value || undefined)}
          />
          <input
            type="number"
            placeholder="Max"
            className="w-1/2 border border-slate-200 rounded-lg px-2 py-1.5 text-xs"
            value={filters.maxPrice || ""}
            onChange={(e) => update("maxPrice", e.target.value || undefined)}
          />
        </div>
      </div>
    </aside>
  );
};

export default FilterSidebar;


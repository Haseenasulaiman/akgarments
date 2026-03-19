import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axiosClient.js";
import { useCart } from "../context/CartContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const ProductDetailPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data);
        const reviewsResp = await api.get(`/reviews/product/${data._id}`);
        setReviews(reviewsResp.data || []);
      } catch {
        toast.error("Product not found");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading)
    return (
      <div className="min-h-[60vh] flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  if (!product)
    return (
      <div className="p-8 text-center text-xs text-slate-500">Not found</div>
    );

  const handleAdd = async () => {
    if (!size) {
      toast.error("Select a size");
      return;
    }
    await addToCart({
      productId: product._id,
      size,
      color: color || product.colors?.[0],
      quantity: 1,
    });
  };

  const price = product.discountedPrice || product.price;
  const totalStock =
    product.sizes?.reduce((sum, s) => sum + (s.stock || 0), 0) || 0;
  const selectedSizeObj = product.sizes?.find((s) => s.size === size);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10 bg-white">
      <div className="space-y-3">
        <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100">
          {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
              AK GARMENTS
            </div>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <div className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
          {product.category}
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">
          {product.name}
        </h1>
        <p className="text-sm text-slate-600 max-w-md">
          {product.description}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-amber">₹{price}</span>
          {product.discountedPrice && (
            <span className="text-xs text-slate-400 line-through">
              ₹{product.price}
            </span>
          )}
        </div>
        <div className="text-[11px] text-slate-500">
          {totalStock > 0 ? (
            <span>In stock: {totalStock} piece(s) left</span>
          ) : (
            <span className="text-rose-500">Out of stock</span>
          )}
          {selectedSizeObj && (
            <span className="ml-2">
              | Size {size}:{" "}
              {selectedSizeObj.stock > 0
                ? `${selectedSizeObj.stock} left`
                : "out of stock"}
            </span>
          )}
        </div>
        <div>
          <div className="text-xs font-semibold mb-1">Size</div>
          <div className="flex flex-wrap gap-1.5">
            {product.sizes?.map((s) => (
              <button
                type="button"
                key={s.size}
                disabled={s.stock <= 0}
                onClick={() => setSize(s.size)}
                className={`px-2 py-0.5 rounded-full border text-[11px] ${
                  size === s.size
                    ? "bg-navy text-offwhite border-navy"
                    : "border-slate-200 text-slate-700"
                } ${s.stock <= 0 ? "opacity-40 cursor-not-allowed" : ""}`}
              >
                {s.size}
              </button>
            ))}
          </div>
        </div>
        {!!product.colors?.length && (
          <div>
            <div className="text-xs font-semibold mb-1">Color</div>
            <div className="flex flex-wrap gap-1.5">
              {product.colors.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`px-2 py-0.5 rounded-full border text-[11px] ${
                    color === c
                      ? "bg-navy text-offwhite border-navy"
                      : "border-slate-200 text-slate-700"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        )}
        <button
          type="button"
          onClick={handleAdd}
          disabled={!selectedSizeObj || selectedSizeObj.stock <= 0}
          className="mt-3 w-full md:w-auto bg-navy text-offwhite text-xs font-semibold px-6 py-2.5 rounded-full hover:bg-charcoal"
        >
          {selectedSizeObj && selectedSizeObj.stock > 0
            ? "Add to cart"
            : "Select an available size"}
        </button>
        <div className="pt-3 border-t border-slate-200 text-[11px] text-slate-500 space-y-1">
          <div>Free delivery in 3–5 business days.</div>
          <div>Easy 7‑day returns on all eligible products.</div>
        </div>

        <div className="mt-6 space-y-3">
          <div className="text-xs font-semibold text-slate-800">Reviews</div>
          {reviews.length === 0 && (
            <div className="text-[11px] text-slate-500">
              Be the first to review this piece.
            </div>
          )}
          <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {reviews.map((r) => (
              <div key={r._id} className="border-b border-slate-100 pb-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700">
                    {r.user?.name}
                  </span>
                  <span className="text-amber">
                    {"★".repeat(r.rating)}
                    {"☆".repeat(5 - r.rating)}
                  </span>
                </div>
                {r.comment && (
                  <div className="text-[11px] text-slate-600 mt-1">
                    {r.comment}
                  </div>
                )}
              </div>
            ))}
          </div>

          {isAuthenticated && (
            <form
              className="mt-2 border border-slate-100 rounded-2xl p-3 space-y-2"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const { data } = await api.post("/reviews", {
                    productId: product._id,
                    rating,
                    comment,
                  });
                  toast.success("Review submitted for moderation");
                  setComment("");
                  // Optimistically show/update the user's own review even while pending
                  setReviews((prev) => {
                    const existingIndex = prev.findIndex(
                      (r) => r.user?._id === data.user || r.user === data.user
                    );
                    const hydrated = {
                      ...data,
                      user:
                        data.user && typeof data.user === "object"
                          ? data.user
                          : { _id: data.user, name: "You" },
                    };
                    if (existingIndex >= 0) {
                      const copy = [...prev];
                      copy[existingIndex] = hydrated;
                      return copy;
                    }
                    return [hydrated, ...prev];
                  });
                } catch {
                  toast.error("Could not submit review");
                }
              }}
            >
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-slate-600">Your rating</span>
                <select
                  className="border border-slate-200 rounded-lg px-2 py-1"
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  {[5, 4, 3, 2, 1].map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <textarea
                rows={2}
                placeholder="How does it feel, fit, and look?"
                className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-[11px]"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button
                type="submit"
                className="bg-navy text-offwhite text-[11px] font-semibold px-4 py-1.5 rounded-full"
              >
                Submit review
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;


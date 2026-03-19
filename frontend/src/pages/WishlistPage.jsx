import { Link } from "react-router-dom";
import { useWishlist } from "../context/WishlistContext.jsx";
import ProductCard from "../components/products/ProductCard.jsx";

const WishlistPage = () => {
  const { items } = useWishlist();

  const products = items
    .map((w) => w.product)
    .filter(Boolean);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-xs space-y-4">
      <h1 className="text-sm font-semibold text-slate-800">Your wishlist</h1>
      {products.length === 0 ? (
        <div className="text-slate-500">
          Nothing saved yet. Browse the{" "}
          <Link to="/products" className="text-amber">
            latest drops
          </Link>{" "}
          and tap the heart to save your favourites.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;


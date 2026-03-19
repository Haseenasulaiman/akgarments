import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useWishlist } from "../../context/WishlistContext.jsx";

const ProductCard = ({ product }) => {
  const price = product.discountedPrice || product.price;
  const { inWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const wished = inWishlist(product._id);

  const toggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (wished) {
      await removeFromWishlist(product._id);
    } else {
      await addToWishlist(product._id);
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01, boxShadow: "0 22px 55px rgba(15,23,42,0.18)" }}
      className="bg-white rounded-2xl overflow-hidden flex flex-col cursor-pointer"
    >
      <Link
        to={`/products/${product.slug}`}
        className="block aspect-[3/4] bg-slate-100 relative"
      >
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-400">
            AK GARMENTS
          </div>
        )}
        <button
          type="button"
          onClick={toggleWishlist}
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-white/90 flex items-center justify-center text-[13px]"
        >
          {wished ? "♥" : "♡"}
        </button>
      </Link>
      <div className="p-3 flex-1 flex flex-col gap-1">
        <Link
          to={`/products/${product.slug}`}
          className="text-xs text-slate-500 uppercase tracking-[0.16em]"
        >
          {product.category}
        </Link>
        <Link
          to={`/products/${product.slug}`}
          className="text-sm font-medium text-slate-900 line-clamp-2"
        >
          {product.name}
        </Link>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-sm font-semibold text-amber">₹{price}</span>
          {product.discountedPrice && (
            <span className="text-xs text-slate-400 line-through">
              ₹{product.price}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;


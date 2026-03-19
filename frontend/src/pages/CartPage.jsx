import { useCart } from "../context/CartContext.jsx";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const { cart, subtotal, updateItem, removeFromCart } = useCart();
  const navigate = useNavigate();

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 text-center text-sm text-slate-500">
        Your cart is empty. Explore our latest fits from the shop.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-[2fr,1fr] gap-8">
      <div className="space-y-4">
        {cart.items.map((item) => (
          <div
            key={item._id}
            className="flex gap-4 bg-white border border-slate-100 rounded-2xl p-3"
          >
            <div className="w-20 h-24 rounded-xl bg-slate-100 overflow-hidden">
              {item.product?.images?.[0] && (
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="flex-1 text-xs space-y-1">
              <div className="font-medium text-slate-800">
                {item.product?.name}
              </div>
              <div className="text-slate-500">
                Size {item.size} {item.color && `• ${item.color}`}
              </div>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex border border-slate-200 rounded-full overflow-hidden">
                  <button
                    type="button"
                    onClick={() => updateItem(item._id, item.quantity - 1)}
                    className="px-2 py-1"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 border-x border-slate-200">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateItem(item._id, item.quantity + 1)}
                    className="px-2 py-1"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeFromCart(item._id)}
                  className="text-slate-500 hover:text-amber"
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="text-sm font-semibold text-amber">
              ₹{item.totalItemPrice}
            </div>
          </div>
        ))}
      </div>
      <aside className="bg-white border border-slate-100 rounded-2xl p-4 text-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Subtotal</span>
          <span className="font-semibold text-slate-800">₹{subtotal}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Shipping</span>
          <span className="text-slate-400">Calculated at checkout</span>
        </div>
        <button
          type="button"
          onClick={() => navigate("/checkout")}
          className="w-full mt-4 bg-navy text-offwhite text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-charcoal"
        >
          Checkout
        </button>
      </aside>
    </div>
  );
};

export default CartPage;


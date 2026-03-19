import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axiosClient.js";
import { useAuth } from "./AuthContext.jsx";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const fetchCart = async () => {
    if (!isAuthenticated) return;
    const { data } = await api.get("/cart");
    setCart(data);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const addToCart = async (payload) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to your cart");
      navigate("/login");
      return;
    }
    const { data } = await api.post("/cart/add", payload);
    setCart(data);
    toast.success("Added to cart");
  };

  const updateItem = async (itemId, quantity) => {
    const { data } = await api.put("/cart/update", { itemId, quantity });
    setCart(data);
  };

  const removeFromCart = async (itemId) => {
    const { data } = await api.delete(`/cart/remove/${itemId}`);
    setCart(data);
  };

  const clearCart = async () => {
    const { data } = await api.delete("/cart/clear");
    setCart(data);
  };

  const itemCount = cart?.items?.reduce((sum, i) => sum + i.quantity, 0) || 0;
  const subtotal =
    cart?.items?.reduce((sum, i) => sum + i.totalItemPrice, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        subtotal,
        addToCart,
        updateItem,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);


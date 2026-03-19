import { createContext, useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import api from "../api/axiosClient.js";
import { useAuth } from "./AuthContext.jsx";

const WishlistContext = createContext(null);

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState([]);

  const load = async () => {
    if (!isAuthenticated) {
      setItems([]);
      return;
    }
    const { data } = await api.get("/wishlist");
    setItems(data || []);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const add = async (productId) => {
    const { data } = await api.post("/wishlist", { productId });
    setItems(data || []);
    toast.success("Saved to wishlist");
  };

  const remove = async (productId) => {
    const { data } = await api.delete(`/wishlist/${productId}`);
    setItems(data || []);
    toast.success("Removed from wishlist");
  };

  const inWishlist = (productId) =>
    !!items.find((w) => w.product && w.product._id === productId);

  return (
    <WishlistContext.Provider
      value={{
        items,
        count: items.length,
        addToWishlist: add,
        removeFromWishlist: remove,
        inWishlist,
        reloadWishlist: load,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);


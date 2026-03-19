import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate("items.product");
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [] });
    cart = await cart.populate("items.product");
  }
  return cart;
};

export const getCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, size, color, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product || product.isDeleted || !product.isActive) {
      return res.status(404).json({ message: "Product not available" });
    }

    const price = product.discountedPrice || product.price;
    const qty = Number(quantity) || 1;

    const cart = await getOrCreateCart(req.user._id);
    const existingItem = cart.items.find(
      (i) =>
        i.product.toString() === productId &&
        i.size === size &&
        i.color === color
    );

    if (existingItem) {
      existingItem.quantity += qty;
      existingItem.totalItemPrice = existingItem.quantity * price;
    } else {
      cart.items.push({
        product: productId,
        size,
        color,
        quantity: qty,
        priceSnapshot: price,
        totalItemPrice: qty * price,
      });
    }

    await cart.save();
    await cart.populate("items.product");
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { itemId, quantity } = req.body;
    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (quantity <= 0) {
      item.deleteOne();
    } else {
      item.quantity = quantity;
      item.totalItemPrice = item.quantity * item.priceSnapshot;
    }

    await cart.save();
    await cart.populate("items.product");
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

export const removeCartItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.id(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });
    item.deleteOne();
    await cart.save();
    await cart.populate("items.product");
    res.json(cart);
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (err) {
    next(err);
  }
};


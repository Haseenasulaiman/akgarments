import Wishlist from "../models/Wishlist.js";

export const getWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.find({ user: req.user._id }).populate(
      "product"
    );
    res.json(items);
  } catch (err) {
    next(err);
  }
};

export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "productId is required" });
    }
    await Wishlist.findOneAndUpdate(
      { user: req.user._id, product: productId },
      { user: req.user._id, product: productId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    const items = await Wishlist.find({ user: req.user._id }).populate(
      "product"
    );
    res.json(items);
  } catch (err) {
    next(err);
  }
};

export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    await Wishlist.findOneAndDelete({
      user: req.user._id,
      product: productId,
    });
    const items = await Wishlist.find({ user: req.user._id }).populate(
      "product"
    );
    res.json(items);
  } catch (err) {
    next(err);
  }
};


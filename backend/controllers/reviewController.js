import { validationResult } from "express-validator";
import Review from "../models/Review.js";

export const createOrUpdateReview = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { productId, rating, comment } = req.body;
    const existing = await Review.findOne({
      product: productId,
      user: req.user._id,
    });
    if (existing) {
      existing.rating = rating;
      existing.comment = comment;
      existing.status = "pending";
      await existing.save();
      return res.json(existing);
    }
    const review = await Review.create({
      product: productId,
      user: req.user._id,
      rating,
      comment,
    });
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

export const listProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({
      product: productId,
      status: "approved",
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

export const adminListReviews = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const reviews = await Review.find(filter)
      .populate("user", "name email")
      .populate("product", "name")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};

export const adminUpdateReviewStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const review = await Review.findById(id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    review.status = status;
    await review.save();
    res.json(review);
  } catch (err) {
    next(err);
  }
};


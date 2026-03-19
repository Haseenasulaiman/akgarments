import mongoose from "mongoose";

const sizeStockSchema = new mongoose.Schema(
  {
    size: {
      type: String,
      enum: ["S", "M", "L", "XL", "XXL"],
      required: true,
    },
    stock: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String },
    category: { type: String, required: true, index: true },
    subcategory: { type: String },
    brand: { type: String },
    price: { type: Number, required: true },
    discountedPrice: { type: Number },
    sizes: [sizeStockSchema],
    colors: [{ type: String }],
    fit: { type: String, enum: ["slim", "regular", "relaxed"] },
    fabric: { type: String },
    style: { type: String },
    images: [{ type: String }],
    tags: [{ type: String, index: true }],
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

productSchema.index({ name: "text", description: "text", brand: "text" });

const Product = mongoose.model("Product", productSchema);

export default Product;


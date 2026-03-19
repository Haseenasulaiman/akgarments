import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    nameSnapshot: { type: String, required: true },
    imageSnapshot: { type: String },
    categorySnapshot: { type: String },
    size: { type: String, required: true },
    color: { type: String },
    quantity: { type: Number, required: true },
    priceSnapshot: { type: Number, required: true },
    subtotal: { type: Number, required: true },
  },
  { _id: false }
);

const addressSnapshotSchema = new mongoose.Schema(
  {
    name: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    pincode: String,
    landmark: String,
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    totals: {
      subtotal: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      tax: { type: Number, default: 0 },
      shipping: { type: Number, default: 0 },
      grandTotal: { type: Number, required: true },
    },
    coupon: {
      couponId: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
      code: { type: String },
      discount: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Success", "Failed"],
      default: "Pending",
    },
    paymentMethod: {
      type: String,
      enum: ["Razorpay", "COD"],
      default: "Razorpay",
    },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    shippingAddress: addressSnapshotSchema,
    invoicePath: { type: String },
    returnStatus: {
      type: String,
      enum: ["None", "Requested", "Approved", "Rejected", "Completed"],
      default: "None",
    },
    refundStatus: {
      type: String,
      enum: ["None", "Pending", "Processed"],
      default: "None",
    },
    cancellationReason: { type: String },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;


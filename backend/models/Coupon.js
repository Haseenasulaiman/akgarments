import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    description: { type: String },
    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    amount: { type: Number, required: true, min: 0 },
    // Minimum cart total for this coupon (for your 5% over 5000 use-case)
    thresholdAmount: { type: Number, default: 0 },
    // Legacy field; still honoured if thresholdAmount is 0
    minOrderValue: { type: Number, default: 0 },
    maxDiscount: { type: Number },
    validFrom: { type: Date },
    validTo: { type: Date },
    usageLimit: { type: Number },
    usedCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    usageLog: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
        amount: { type: Number }, // cart total at the time
        discount: { type: Number }, // discount given
        usedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Coupon = mongoose.model("Coupon", couponSchema);

export default Coupon;


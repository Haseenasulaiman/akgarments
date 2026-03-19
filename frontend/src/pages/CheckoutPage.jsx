import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../api/axiosClient.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

const CheckoutPage = () => {
  const { user, setUser } = useAuth();
  const { subtotal, refreshCart } = useCart();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");

  const loadRazorpay = () =>
    new Promise((resolve, reject) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () =>
        reject(new Error("Razorpay SDK failed to load. Check your connection."));
      document.body.appendChild(script);
    });

  useEffect(() => {
    const defaultAddress = user?.addresses?.find((a) => a.isDefault) || user?.addresses?.[0];
    if (defaultAddress) setAddress(defaultAddress);
  }, [user]);

  const applyCoupon = async () => {
    if (!couponCode) return;
    try {
      const { data } = await api.post("/coupons/apply", {
        code: couponCode,
        amount: subtotal,
      });
      setDiscount(data.discount);
      setAppliedCoupon({
        couponId: data.couponId,
        code: data.code,
        discount: data.discount,
      });
      toast.success("Coupon applied");
    } catch (err) {
      setDiscount(0);
      setAppliedCoupon(null);
      toast.error(err.response?.data?.message || "Invalid coupon");
    }
  };

  const handlePlaceOrder = async () => {
    if (!address.line1 || !address.city || !address.state || !address.pincode) {
      toast.error("Fill in your shipping address");
      return;
    }
    setSaving(true);
    try {
      const shipping = 0;
      const tax = Math.round((subtotal - discount) * 0.05);
      const totals = {
        subtotal,
        discount,
        tax,
        shipping,
        grandTotal: subtotal - discount + tax + shipping,
      };
      const shippingAddress = {
        ...address,
        name: user.name,
        phone: user.phone,
      };

      if (paymentMethod === "COD") {
        await api.post("/orders", {
          totals,
          coupon: appliedCoupon || undefined,
          shippingAddress,
        });
        toast.success("Order placed");
        await refreshCart();
        navigate("/orders");
        return;
      }

      // Razorpay flow
      await loadRazorpay();

      const { data } = await api.post("/payments/razorpay/create", {
        totals,
        coupon: appliedCoupon || undefined,
        shippingAddress,
      });

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "AK GARMENTS",
        description: "Order payment",
        order_id: data.razorpayOrderId,
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone,
        },
        theme: {
          color: "#0f172a",
        },
        handler: async (response) => {
          try {
            await api.post("/payments/razorpay/verify", {
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
              totals,
              coupon: appliedCoupon || undefined,
              shippingAddress,
            });
            toast.success("Payment successful, order placed");
            await refreshCart();
            navigate("/orders");
          } catch (err) {
            toast.error(
              err.response?.data?.message || "Payment verification failed"
            );
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || "Checkout failed");
    } finally {
      setSaving(false);
    }
  };

  const saveAddress = async () => {
    try {
      const { data } = await api.put("/users/me/address", {
        ...address,
        isDefault: true,
      });
      setUser((prev) => ({ ...prev, addresses: data }));
      toast.success("Address saved");
    } catch {
      toast.error("Could not save address");
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-[1.6fr,1fr] gap-8 text-xs">
      <section className="space-y-4 bg-white border border-slate-100 rounded-2xl p-4">
        <h1 className="text-sm font-semibold text-slate-800">Shipping address</h1>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-[11px] text-slate-500 mb-1">
              Address line 1
            </label>
            <input
              className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
              value={address.line1}
              onChange={(e) => setAddress({ ...address, line1: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <label className="block text-[11px] text-slate-500 mb-1">
              Address line 2
            </label>
            <input
              className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
              value={address.line2 || ""}
              onChange={(e) => setAddress({ ...address, line2: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 mb-1">City</label>
            <input
              className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
              value={address.city}
              onChange={(e) => setAddress({ ...address, city: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 mb-1">State</label>
            <input
              className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
              value={address.state}
              onChange={(e) => setAddress({ ...address, state: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 mb-1">
              Pincode
            </label>
            <input
              className="w-full border border-slate-200 rounded-lg px-2 py-1.5"
              value={address.pincode}
              onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
            />
          </div>
        </div>
        <button
          type="button"
          onClick={saveAddress}
          className="mt-2 text-[11px] text-slate-600 underline"
        >
          Save as default
        </button>
      </section>
      <aside className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
        <h2 className="text-sm font-semibold text-slate-800">Order summary</h2>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Subtotal</span>
          <span className="font-semibold text-slate-800">₹{subtotal}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Coupon</span>
          <div className="flex items-center gap-2">
            <input
              className="w-24 border border-slate-200 rounded-lg px-2 py-1.5 text-[11px]"
              placeholder="CODE"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
            />
            <button
              type="button"
              onClick={applyCoupon}
              className="text-[11px] text-navy font-semibold"
            >
              Apply
            </button>
          </div>
        </div>
        {discount > 0 && (
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-slate-500">Discount</span>
            <span>-₹{discount}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Tax (5%)</span>
          <span className="text-slate-800">
            ₹{Math.round((subtotal - discount) * 0.05)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-slate-500">Shipping</span>
          <span className="text-emerald-600">Free</span>
        </div>
        <div className="border-t border-slate-200 pt-3 flex items-center justify-between">
          <span className="text-slate-700 font-semibold">Total</span>
          <span className="text-amber font-semibold">
            ₹{subtotal - discount + Math.round((subtotal - discount) * 0.05)}
          </span>
        </div>
        <div className="mt-3 space-y-1">
          <div className="text-slate-500 text-[11px]">Payment method</div>
          <div className="flex gap-3 text-[11px]">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="Razorpay"
                checked={paymentMethod === "Razorpay"}
                onChange={() => setPaymentMethod("Razorpay")}
              />
              <span>Pay Online</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="paymentMethod"
                value="COD"
                checked={paymentMethod === "COD"}
                onChange={() => setPaymentMethod("COD")}
              />
              <span>Cash on delivery</span>
            </label>
          </div>
        </div>
        <button
          type="button"
          disabled={saving}
          onClick={handlePlaceOrder}
          className="w-full mt-3 bg-navy text-offwhite text-xs font-semibold px-4 py-2.5 rounded-full hover:bg-charcoal disabled:opacity-60"
        >
          Place order
        </button>
      </aside>
    </div>
  );
};

export default CheckoutPage;


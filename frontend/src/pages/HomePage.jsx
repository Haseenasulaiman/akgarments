import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axiosClient.js";
import ProductCard from "../components/products/ProductCard.jsx";

const CATEGORIES = [
  {
    key: "Shirts",
    title: "Shirts",
    tagline: "Boardroom-ready, bar-approved.",
    accent: "Formal & casual",
  },
  {
    key: "T-Shirts",
    title: "T‑shirts & Polos",
    tagline: "Off-duty layers with edge.",
    accent: "Casual staples",
  },
  {
    key: "Jeans",
    title: "Denim & Trousers",
    tagline: "Clean lines, sharp fits.",
    accent: "Everyday rotation",
  },
  {
    key: "Ethnic",
    title: "Ethnic Wear",
    tagline: "Festive, but understated.",
    accent: "Kurtas & sherwanis",
  },
  {
    key: "Inners",
    title: "Inners",
    tagline: "Everyday innerwear with a soft touch.",
    accent: "Essentials",
  },
  {
    key: "Shorts",
    title: "Shorts",
    tagline: "Weekend-ready, city to court.",
    accent: "Casual & sport",
  },
  {
    key: "Lycra Shirts",
    title: "Lycra shirts",
    tagline: "Stretch shirting that moves with you.",
    accent: "Comfort stretch",
  },
  {
    key: "Lycra Pants",
    title: "Lycra pants",
    tagline: "Tailored trousers with flex built in.",
    accent: "Comfort stretch",
  },
];

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/products", {
          params: { limit: 8, sort: "newest" },
        });
        setFeatured(data.items || []);
      } catch {
        // ignore
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-10">
      <section className="grid md:grid-cols-[1.3fr,1fr] gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500 mb-3">
            AK GARMENTS / MEN&apos;S WEAR
          </p>
          <h1 className="text-3xl md:text-4xl font-display text-navy leading-snug">
            Tailored men&apos;s essentials for{" "}
            <span className="text-amber">every room you enter</span>.
          </h1>
          <p className="mt-4 text-sm text-slate-600 max-w-md">
            Curated shirts, denim, and ethnic wear with considered fits, rich
            fabrics, and a quietly confident palette.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/products"
              className="bg-navy text-offwhite text-xs px-5 py-2.5 rounded-full font-semibold tracking-wide hover:bg-charcoal"
            >
              Shop all styles
            </Link>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-slate-900"
          style={{
            backgroundImage:
              "url('https://images.pexels.com/photos/3755706/pexels-photo-3755706.jpeg?auto=compress&cs=tinysrgb&w=1200')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-offwhite space-y-2">
            <div className="text-[11px] uppercase tracking-[0.2em] text-slate-300">
              New arrival
            </div>
            <div className="text-lg font-medium">
              AK GARMENTS Evening Collection
            </div>
            <p className="text-xs text-slate-200">
              Sharp shirts, structured trousers, and elevated layers for every
              men&apos;s occasion.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Trust Building Section */}
      <section className="py-12 bg-gradient-to-r from-navy/5 to-amber/5 rounded-3xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <h2 className="text-2xl md:text-3xl font-display text-navy mb-4">
            Why <span className="text-amber">10,000+</span> Customers Trust AK Garments
          </h2>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">
            Quality craftsmanship, exceptional service, and a commitment to your satisfaction
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-center group"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-navy/10 rounded-full flex items-center justify-center group-hover:bg-navy/20 transition-colors">
              <svg className="w-8 h-8 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-navy mb-2">Premium Quality</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every garment is crafted with premium fabrics and undergoes rigorous quality checks to ensure perfection.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center group"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-amber/10 rounded-full flex items-center justify-center group-hover:bg-amber/20 transition-colors">
              <svg className="w-8 h-8 text-amber" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-navy mb-2">Fast Delivery</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Quick dispatch within 24 hours. Get your order delivered in 3-5 business days across India.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center group"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-navy mb-2">Customer Satisfaction</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              98% customer satisfaction rate. We're here to ensure you love every purchase.
            </p>
          </motion.div>
        </div>

        {/* Additional Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-slate-200"
        >
          <div className="flex flex-wrap justify-center items-center gap-8 text-center">
            <div>
              <div className="text-2xl font-bold text-navy">10,000+</div>
              <div className="text-xs text-slate-500">Happy Customers</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-navy">4.8★</div>
              <div className="text-xs text-slate-500">Average Rating</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-navy">500+</div>
              <div className="text-xs text-slate-500">Products</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-navy">24/7</div>
              <div className="text-xs text-slate-500">Customer Support</div>
            </div>
          </div>
        </motion.div>

        {/* Security & Trust Badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-8 flex flex-wrap justify-center items-center gap-6"
        >
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Secure Payments</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Authentic Products</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
            </svg>
            <span>Easy Returns</span>
          </div>
        </motion.div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-slate-800">
            Shop by category
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <motion.button
              type="button"
              key={cat.key}
              whileHover={{ y: -4, scale: 1.01 }}
              onClick={() =>
                navigate(`/products?category=${encodeURIComponent(cat.key)}`)
              }
              className="bg-white rounded-2xl border border-slate-100 px-3 py-4 text-left shadow-sm hover:shadow-md"
            >
              <div className="text-[11px] uppercase tracking-[0.2em] text-slate-400 mb-1">
                {cat.accent}
              </div>
              <div className="text-sm font-semibold text-navy mb-1">
                {cat.title}
              </div>
              <div className="text-xs text-slate-500">
                {cat.tagline}
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-wide text-slate-800">
            Featured this week
          </h2>
          <Link
            to="/products"
            className="text-xs text-slate-500 hover:text-amber"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {featured.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
          {featured.length === 0 && (
            <div className="col-span-full text-xs text-slate-500">
              Products will appear here once added from the admin dashboard.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HomePage;


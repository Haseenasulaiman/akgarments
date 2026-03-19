import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axiosClient.js";
import { useAuth } from "../../context/AuthContext.jsx";

const QUICK_LINKS = [
  { label: "All products", action: (navigate) => navigate("/products") },
  { label: "New arrivals", action: (navigate) => navigate("/products?sort=newest") },
  { label: "View cart", action: (navigate) => navigate("/cart") },
  { label: "Track orders", action: (navigate) => navigate("/orders") },
  { label: "Contact support", action: (navigate) => navigate("/support") },
];

const initialMessages = [
  {
    from: "bot",
    text: "👋 Hi! I'm your AK GARMENTS assistant. I can help you:\n\n🛍️ Find products (shirts, jeans, inners, etc.)\n📦 Track orders\n💰 Find deals & sales\n📏 Size recommendations\n⏰ Store hours & delivery info\n🎁 Gift suggestions\n\nTry asking: \"show me shirts\", \"track my order\", \"what's on sale?\"",
  },
];

const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Hide chatbot entirely on admin routes
  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  // Close and reset when user logs out for better UX
  useEffect(() => {
    if (!isAuthenticated && open) {
      setOpen(false);
      setMessages(initialMessages);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleUserMessage = async (raw) => {
    const text = raw.trim();
    if (!text) return;

    const lower = text.toLowerCase();
    
    const userMessage = { from: "user", text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    await new Promise(resolve => setTimeout(resolve, 800));

    let response = "";
    let navigationAction = null;

    if (lower.includes("all") || lower.includes("everything")) {
      response = "🛍️ Taking you to all our products.";
      navigationAction = (nav) => nav("/products");
    } else if (lower.includes("new") || lower.includes("arrival")) {
      response = "✨ Showing our latest arrivals!";
      navigationAction = (nav) => nav("/products?sort=newest");
    } else if (lower.includes("sale") || lower.includes("discount") || lower.includes("offer")) {
      response = "💰 Finding the best deals for you...";
      navigationAction = (nav) => nav("/products?discount=true");
    } else if (lower.includes("lycra") && lower.includes("shirt")) {
      response = "👔 Opening our comfortable lycra shirts collection.";
      navigationAction = (nav) => nav("/products?category=" + encodeURIComponent("Lycra Shirts"));
    } else if (lower.includes("lycra") && lower.includes("pant")) {
      response = "👖 Showing lycra pants with stretch comfort.";
      navigationAction = (nav) => nav("/products?category=" + encodeURIComponent("Lycra Pants"));
    } else if (lower.includes("inner")) {
      response = "👕 Showing our comfortable innerwear collection.";
      navigationAction = (nav) => nav("/products?category=" + encodeURIComponent("Inners"));
    } else if (lower.includes("short")) {
      response = "🩳 Heading to our shorts collection.";
      navigationAction = (nav) => nav("/products?category=" + encodeURIComponent("Shorts"));
    } else if (lower.includes("t-shirt") || lower.includes("tshirt")) {
      response = "👕 Here are our stylish T‑shirts.";
      navigationAction = (nav) => nav("/products?category=" + encodeURIComponent("T-Shirts"));
    } else if (lower.includes("shirt")) {
      response = "👔 Showing our premium shirts collection.";
      navigationAction = (nav) => nav("/products?category=" + encodeURIComponent("Shirts"));
    } else if (lower.includes("jean") || lower.includes("denim")) {
      response = "👖 Let's look at our denim & jeans collection.";
      navigationAction = (nav) => nav("/products?category=" + encodeURIComponent("Jeans"));
    } else if (lower.includes("ethnic")) {
      response = "🎭 Opening our traditional ethnic wear.";
      navigationAction = (nav) => nav("/products?category=" + encodeURIComponent("Ethnic"));
    } 
    else if (lower.includes("track") && lower.includes("order")) {
      response = "📦 Taking you to track your orders.";
      navigationAction = (nav) => nav("/orders");
    } else if (lower.includes("order")) {
      response = "📦 Opening your orders page.";
      navigationAction = (nav) => nav("/orders");
    } else if (lower.includes("cart")) {
      response = "🛒 Taking you to your shopping cart.";
      navigationAction = (nav) => nav("/cart");
    } else if (lower.includes("wishlist")) {
      response = "❤️ Heading to your wishlist.";
      navigationAction = (nav) => nav("/wishlist");
    } else if (lower.includes("profile") || lower.includes("account")) {
      response = "👤 Opening your profile settings.";
      navigationAction = (nav) => nav("/profile");
    }
    else if (lower.includes("size") || lower.includes("fit")) {
      response = "📏 For size help:\n\n• S: Chest 38-40\"\n• M: Chest 40-42\"\n• L: Chest 42-44\"\n• XL: Chest 44-46\"\n• XXL: Chest 46-48\"\n\nCheck product pages for detailed measurements!";
    } else if (lower.includes("measure") || lower.includes("measurement")) {
      response = "📏 How to measure:\n\n1. Chest: Measure around the fullest part\n2. Waist: Measure around natural waistline\n3. Length: From shoulder to hem\n\nNeed help? Contact our sizing experts!";
    }
    else if (lower.includes("delivery") || lower.includes("shipping")) {
      response =
        "🚚 You can see shipping details in the checkout summary. For a specific question, please use the support page.";
      navigationAction = (nav) => nav("/support");
    } else if (lower.includes("return") || lower.includes("exchange")) {
      response =
        "🔄 Return and exchange options depend on the order. Please check your order details, or reach us via the support page.";
      navigationAction = (nav) => nav("/support");
    } else if (lower.includes("payment") || lower.includes("pay")) {
      response =
        "💳 Payment options are shown during checkout. You can review them there before placing your order.";
    }
    else if (lower.includes("hour") || lower.includes("timing")) {
      response =
        "⏰ You can browse and place orders online at any time. For specific timing questions, please contact support.";
      navigationAction = (nav) => nav("/support");
    } else if (lower.includes("contact") || lower.includes("support") || lower.includes("help")) {
      response = "📞 Opening the support page so you can reach us from there.";
      navigationAction = (nav) => nav("/support");
    } else if (lower.includes("gift") || lower.includes("present")) {
      response =
        "🎁 You can choose any product as a gift. Try searching for what you have in mind, like \"shirt\" or \"jeans\".";
    }
    else if (lower.includes("price") || lower.includes("cost") || lower.includes("budget")) {
      response =
        "💰 To see prices, browse the products list or search for a category like \"shirts\" or \"jeans\".";
    }
    else if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
      response = "👋 Hello! Welcome to AK GARMENTS!\n\nHow can I help you today?\n• Browse products\n• Track orders\n• Size assistance\n• Store info";
    } else if (lower.includes("thank")) {
      response = "😊 You're welcome! Happy shopping at AK GARMENTS!";
    } else if (lower.includes("bye") || lower.includes("goodbye")) {
      response = "👋 Goodbye! Have a great day and visit us again!";
    } else {
      // Fallback: try a lightweight product search for more \"real\" assistance
      try {
        const { data } = await api.get("/products", {
          params: { search: text, limit: 5 },
        });
        const items = data.items || [];
        if (items.length > 0) {
          const names = items.slice(0, 3).map((p) => `• ${p.name}`).join("\n");
          response = `I found ${items.length} item(s) matching \"${text}\".\n\n${names}\n\nYou can see more results on the products page.`;
          navigationAction = (nav) =>
            nav(`/products?search=${encodeURIComponent(text)}`);
        } else {
          response =
            "🤔 I couldn't find products matching that. I can help with:\n\n🛍️ Product search (shirts, jeans, etc.)\n📦 Order tracking\n📏 Size recommendations\n💰 Sales and deals\n🚚 Delivery info\n📞 Customer support\n\nTry asking for a category like \"shirts\" or \"jeans\".";
        }
      } catch {
        response =
          "🤔 I can help you with:\n\n🛍️ Product search (shirts, jeans, etc.)\n📦 Order tracking\n📏 Size recommendations\n💰 Sales and deals\n🚚 Delivery info\n📞 Customer support\n\nTry asking something specific!";
      }
    }

    const botMessage = { from: "bot", text: response };
    setMessages(prev => [...prev, botMessage]);
    setIsTyping(false);

    if (navigationAction) {
      setTimeout(() => {
        navigationAction(navigate);
      }, 100);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const value = input;
    setInput("");
    handleUserMessage(value);
  };

  const quickLinks = useMemo(() => {
    // Hide account/order-specific links for guests
    if (!isAuthenticated) {
      return QUICK_LINKS.filter(
        (q) =>
          !["Track Order", "Contact Support"].includes(q.label) ||
          q.label === "Contact Support"
      );
    }
    return QUICK_LINKS;
  }, [isAuthenticated]);

  return (
    <div className="fixed bottom-4 right-4 z-40 text-xs">
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="bg-navy text-offwhite rounded-full px-4 py-2 shadow-lg flex items-center gap-2 hover:bg-charcoal"
        >
          <span className="h-6 w-6 rounded-full bg-amber text-navy flex items-center justify-center text-xs font-semibold">
            ?
          </span>
          <span>Ask AK GARMENTS</span>
        </button>
      )}
      {open && (
        <div className="w-80 max-w-[90vw] bg-white border border-slate-200 rounded-2xl shadow-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-navy text-offwhite">
            <div>
              <div className="text-[11px] font-semibold">
                AK GARMENTS assistant
              </div>
              <div className="text-[10px] text-slate-200">
                Ask about products or navigate
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[11px] text-slate-200 hover:text-amber"
            >
              Close
            </button>
          </div>
          <div className="flex-1 max-h-72 overflow-y-auto px-3 py-2 space-y-2">
            {messages.map((m, idx) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={idx}
                className={`flex ${
                  m.from === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-3 py-1.5 max-w-[80%] ${
                    m.from === "user"
                      ? "bg-navy text-offwhite"
                      : "bg-slate-100 text-slate-800"
                  } text-[11px] whitespace-pre-line`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-100 text-slate-800 rounded-2xl px-3 py-1.5 text-[11px]">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="px-3 pb-2 space-y-2 border-t border-slate-100 bg-slate-50">
            <div className="flex flex-wrap gap-1">
              {quickLinks.map((q) => (
                <button
                  key={q.label}
                  type="button"
                  onClick={() => q.action(navigate)}
                  className="px-2 py-0.5 rounded-full bg-white border border-slate-200 text-[10px] hover:border-amber"
                >
                  {q.label}
                </button>
              ))}
            </div>
            <form onSubmit={handleSubmit} className="flex gap-1">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question or type a category..."
                className="flex-1 border border-slate-200 rounded-full px-3 py-1.5 text-[11px] bg-white"
              />
              <button
                type="submit"
                className="px-3 py-1.5 rounded-full bg-navy text-offwhite text-[11px] font-semibold"
              >
                Go
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatbotWidget;


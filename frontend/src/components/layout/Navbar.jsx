import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";

const NavIcon = ({ label }) => (
  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-amber/60 text-[10px] mr-1">
    {label}
  </span>
);

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  const inAdmin = isAdmin && pathname.startsWith("/admin");

  if (inAdmin) {
    return (
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <button
            type="button"
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-3"
          >
            <div className="h-7 w-7 rounded-full border border-slate-900 flex items-center justify-center text-[11px] font-semibold">
              AK
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-slate-900 font-display tracking-wide text-lg">
                AK GARMENTS
              </span>
              <span className="text-[10px] text-slate-500">ADMIN</span>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-6 text-[13px] text-slate-800">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `pb-1 border-b-2 ${
                  isActive
                    ? "border-slate-900 font-semibold"
                    : "border-transparent hover:border-slate-400"
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/orders"
              className={({ isActive }) =>
                `pb-1 border-b-2 ${
                  isActive
                    ? "border-slate-900 font-semibold"
                    : "border-transparent hover:border-slate-400"
                }`
              }
            >
              Orders
            </NavLink>
            <NavLink
              to="/admin/products"
              className={({ isActive }) =>
                `pb-1 border-b-2 ${
                  isActive
                    ? "border-slate-900 font-semibold"
                    : "border-transparent hover:border-slate-400"
                }`
              }
            >
              Products
            </NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `pb-1 border-b-2 ${
                  isActive
                    ? "border-slate-900 font-semibold"
                    : "border-transparent hover:border-slate-400"
                }`
              }
            >
              Users
            </NavLink>
            <NavLink
              to="/admin/coupons"
              className={({ isActive }) =>
                `pb-1 border-b-2 ${
                  isActive
                    ? "border-slate-900 font-semibold"
                    : "border-transparent hover:border-slate-400"
                }`
              }
            >
              Coupons
            </NavLink>
            <NavLink
              to="/admin/settings"
              className={({ isActive }) =>
                `pb-1 border-b-2 ${
                  isActive
                    ? "border-slate-900 font-semibold"
                    : "border-transparent hover:border-slate-400"
                }`
              }
            >
              Settings
            </NavLink>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 text-xs text-slate-800">
              <button
                type="button"
                onClick={() => navigate("/admin/dashboard")}
                className="flex items-center gap-2"
              >
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-500">Admin</span>
                  <span className="font-semibold">
                    {user?.name?.split(" ")[0] || "Admin"}
                  </span>
                </div>
                <div className="h-7 w-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-semibold">
                  {(user?.name?.[0] || "A").toUpperCase()}
                </div>
              </button>
              <button
                type="button"
                onClick={logout}
                className="text-[11px] text-slate-600 hover:text-slate-900"
              >
                Logout
              </button>
            </div>

            <button
              type="button"
              className="md:hidden text-slate-900 ml-1"
              onClick={() => setOpen((v) => !v)}
            >
              <span className="sr-only">Toggle menu</span>
              <div className="space-y-1">
                <span className="block h-0.5 w-5 bg-slate-900" />
                <span className="block h-0.5 w-5 bg-slate-900" />
                <span className="block h-0.5 w-5 bg-slate-900" />
              </div>
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t border-slate-200 bg-white">
            <div className="max-w-6xl mx-auto px-6 py-3 space-y-2 text-sm text-slate-800">
              <NavLink
                to="/admin/dashboard"
                onClick={() => setOpen(false)}
                className="block py-1.5"
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/admin/orders"
                onClick={() => setOpen(false)}
                className="block py-1.5"
              >
                Orders
              </NavLink>
              <NavLink
                to="/admin/products"
                onClick={() => setOpen(false)}
                className="block py-1.5"
              >
                Products
              </NavLink>
              <NavLink
                to="/admin/users"
                onClick={() => setOpen(false)}
                className="block py-1.5"
              >
                Users
              </NavLink>
              <NavLink
                to="/admin/coupons"
                onClick={() => setOpen(false)}
                className="block py-1.5"
              >
                Coupons
              </NavLink>
              <NavLink
                to="/admin/settings"
                onClick={() => setOpen(false)}
                className="block py-1.5"
              >
                Settings
              </NavLink>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="text-xs text-rose-500 pt-2"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-3"
        >
          <div className="h-7 w-7 rounded-full border border-slate-900 flex items-center justify-center text-[11px] font-semibold">
            AK
          </div>
          <span className="text-slate-900 font-display tracking-wide text-lg">
            AK GARMENTS
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-6 text-[13px] text-slate-800">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `pb-1 border-b-2 ${
                isActive
                  ? "border-slate-900 font-semibold"
                  : "border-transparent hover:border-slate-400"
              }`
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `pb-1 border-b-2 ${
                isActive
                  ? "border-slate-900 font-semibold"
                  : "border-transparent hover:border-slate-400"
              }`
            }
          >
            Shop
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink
                to="/wishlist"
                className={({ isActive }) =>
                  `pb-1 border-b-2 ${
                    isActive
                      ? "border-slate-900 font-semibold"
                      : "border-transparent hover:border-slate-400"
                  }`
                }
              >
                Wishlist
              </NavLink>
              <NavLink
                to="/orders"
                className={({ isActive }) =>
                  `pb-1 border-b-2 ${
                    isActive
                      ? "border-slate-900 font-semibold"
                      : "border-transparent hover:border-slate-400"
                  }`
                }
              >
                Orders
              </NavLink>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/cart")}
            className="relative flex items-center gap-1 text-slate-800 hover:text-slate-900 text-xs"
          >
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-300 text-[11px]">
              🛒
            </span>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-slate-900 text-[10px] text-white rounded-full px-1.5 py-0.5">
                {itemCount}
              </span>
            )}
          </button>

          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-3 text-xs text-slate-800">
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2"
              >
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-slate-500">Account</span>
                  <span className="font-semibold">
                    {user?.name?.split(" ")[0] || "You"}
                  </span>
                </div>
                <div className="h-7 w-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-semibold">
                  {user?.name?.[0]?.toUpperCase() || "A"}
                </div>
              </button>
              <button
                type="button"
                onClick={logout}
                className="text-[11px] text-slate-600 hover:text-slate-900"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-3 text-xs">
              <Link
                to="/login"
                className="text-slate-800 hover:text-slate-900"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="border border-slate-900 text-slate-900 rounded-full px-3 py-1 font-semibold"
              >
                Join Us
              </Link>
            </div>
          )}

          <button
            type="button"
            className="md:hidden text-slate-900 ml-1"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">Toggle menu</span>
            <div className="space-y-1">
              <span className="block h-0.5 w-5 bg-slate-900" />
              <span className="block h-0.5 w-5 bg-slate-900" />
              <span className="block h-0.5 w-5 bg-slate-900" />
            </div>
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="max-w-6xl mx-auto px-6 py-3 space-y-2 text-sm text-slate-800">
            <NavLink to="/" onClick={() => setOpen(false)} className="block py-1.5">
              Home
            </NavLink>
            <NavLink
              to="/products"
              onClick={() => setOpen(false)}
              className="block py-1.5"
            >
              Shop
            </NavLink>
            {isAuthenticated && (
              <>
                <NavLink
                  to="/wishlist"
                  onClick={() => setOpen(false)}
                  className="block py-1.5"
                >
                  Wishlist
                </NavLink>
                <NavLink
                  to="/orders"
                  onClick={() => setOpen(false)}
                  className="block py-1.5"
                >
                  Orders
                </NavLink>
              </>
            )}
            {!isAuthenticated && (
              <div className="pt-2 flex gap-3">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="text-xs border border-slate-300 rounded-full px-3 py-1"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="text-xs bg-slate-900 text-white rounded-full px-3 py-1 font-semibold"
                >
                  Join Us
                </Link>
              </div>
            )}
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  logout();
                }}
                className="text-xs text-rose-500 pt-2"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;


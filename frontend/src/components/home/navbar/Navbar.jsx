import { useState, useContext } from "react";
import { FiMenu, FiX, FiSearch, FiUser, FiHeart, FiShoppingCart, FiChevronDown, FiLogOut, FiUserCheck } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";
import { CartContext } from "../../../context/CartContext";
import { WishlistContext } from "../../../context/WishlistContext";
import { useAuth } from "../../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
//import  getPublicSettings  from "../../../api/settingsApi.js";

const Navbar = () => {
  const { cart } = useContext(CartContext);
  const { wishlist } = useContext(WishlistContext);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const wishlistCount = wishlist.length;
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: siteSettings } = useQuery({
    queryKey: ["publicSettings"],
    //queryFn: getPublicSettings,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });
  const websiteName = siteSettings?.websiteName || "Khethomorr";
  const announcement = siteSettings?.announcement || "Free delivery across India on selected orders";

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Deals", path: "/deals" },
    { name: "Services", path: "/services" },
    { name: "About Us", path: "/aboutUs" },
    { name: "Contact Us", path: "/contactUs" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <style>
        {`
    @keyframes marquee {
      from {
        transform: translateX(0);
      }
      to {
        transform: translateX(-50%);
      }
    }

    .animate-marquee {
      animation: marquee 18s linear infinite;
      will-change: transform;
    }
  `}
      </style>
      {/* Top Offer Bar */}
      <div className="bg-black w-full h-10 flex items-center text-white text-xs md:text-sm overflow-hidden">
        {/* Marquee Area */}
        <div className="flex-1 overflow-hidden">
          <div className="flex w-max animate-marquee">
            {[0, 1].map((group) => (
              <div key={group} className="flex shrink-0 items-center">
                {[0, 1, 2].map((item) => <span key={item} className="px-8">✨ {announcement}</span>)}
              </div>
            ))}
            {false && <>
            {/* First Group */}
            <div className="flex shrink-0 items-center">
              <span className="px-8">✨ Flat 20% OFF on Rallys Fan | Free Delivery Across India</span>

              <span className="px-8">✨ Flat 20% OFF on Rallys Fan | Free Delivery Across India</span>

              <span className="px-8">✨ Flat 20% OFF on Rallys Fan | Free Delivery Across India</span>
            </div>

            {/* Exact Duplicate */}
            <div className="flex shrink-0 items-center">
              <span className="px-8">✨ Flat 20% OFF on Rallys Fan | Free Delivery Across India</span>

              <span className="px-8">✨ Flat 20% OFF on Rallys Fan | Free Delivery Across India</span>

              <span className="px-8">✨ Flat 20% OFF on Rallys Fan | Free Delivery Across India</span>
            </div>
            </>}
          </div>
        </div>

        {/* Shop Button */}
        <div className="shrink-0 bg-black px-3">
          <Link to="/shop" className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs">
            Shop Now
          </Link>
        </div>
      </div>
      {/* Main Navbar */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-20 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2">
              <div className="w-11 h-11 rounded bg-red-600 text-white flex items-center justify-center font-bold text-xl">K</div>
              <div>
                <h2 className="font-bold text-2xl tracking-wide">
                  {websiteName.toUpperCase()}
                </h2>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Lighting • Home • Beyond</p>
              </div>
            </Link>

            {/* Search */}
            <div className="hidden lg:flex flex-1 mx-10">
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search lights, fans, appliances..."
                  className="w-full border rounded-full h-11 pl-5 pr-12 outline-none focus:border-red-500"
                />
                <FiSearch className="absolute right-5 top-1/2 -translate-y-1/2 text-xl text-gray-500" />
              </div>
            </div>

            {/* Right Icons - Desktop */}
            <div className="hidden md:flex items-center gap-8">
              {/* User Section */}
              {isAuthenticated && user ?
                <div className="relative">
                  <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center gap-2 hover:text-red-600 transition">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <span className="text-xs">{user.name?.split(" ")[0] || "User"}</span>
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-2">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                      </div>

                      <Link
                        to="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiUserCheck size={18} />
                        My Profile
                      </Link>

                      <Link
                        to="/orders"
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiShoppingCart size={18} />
                        My Orders
                      </Link>

                      <Link
                        to="/wishlist"
                        className="flex items-center gap-3 px-4 py-2 text-sm hover:bg-gray-50 transition"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <FiHeart size={18} />
                        Wishlist
                      </Link>

                      <hr className="my-1" />

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition"
                      >
                        <FiLogOut size={18} />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              : <Link to="/login">
                  <div className="flex flex-col items-center cursor-pointer hover:text-red-600">
                    <FiUser size={22} />
                    <span className="text-xs">Login</span>
                  </div>
                </Link>
              }

              <Link to="/wishlist">
                <div className="relative flex flex-col items-center cursor-pointer hover:text-red-600">
                  <FiHeart size={22} />
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">
                    {wishlistCount}
                  </span>
                  <span className="text-xs">Wishlist</span>
                </div>
              </Link>

              <Link to="/cart">
                <div className="relative flex flex-col items-center cursor-pointer hover:text-red-600">
                  <FiShoppingCart size={22} />
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">
                    {cartCount}
                  </span>
                  <span className="text-xs">Cart</span>
                </div>
              </Link>
            </div>

            {/* Mobile Icons */}
            <div className="flex md:hidden items-center gap-5">
              <FiSearch size={22} />
              <Link to="/cart">
                <div className="relative">
                  <FiShoppingCart size={22} />
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px]">
                    {cartCount}
                  </span>
                </div>
              </Link>
              <button onClick={() => setMenuOpen(true)}>
                <FiMenu size={28} />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:block border-t">
          <div className="max-w-7xl mx-auto px-4">
            <ul className="flex justify-center gap-10 h-14 items-center text-sm font-semibold">
              {navLinks.map((item) => (
                <li key={item.name} className="cursor-pointer hover:text-red-600 transition flex items-center gap-1">
                  <Link to={item.path}>{item.name}</Link>
                  {item.name === "Shop" && <FiChevronDown />}
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer */}
      <div className={`fixed inset-0 z-50 transition ${menuOpen ? "visible" : "invisible"}`}>
        <div
          className={`absolute left-0 top-0 h-full w-72 bg-white shadow-xl transition-transform duration-300 ${
            menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex justify-between items-center p-5 border-b">
            <h2 className="font-bold text-xl">
              {websiteName.toUpperCase()}
            </h2>
            <button onClick={() => setMenuOpen(false)}>
              <FiX size={28} />
            </button>
          </div>

          {/* Mobile User Section */}
          <div className="p-5 border-b">
            {isAuthenticated && user ?
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
            : <Link to="/login" onClick={() => setMenuOpen(false)} className="block w-full bg-red-600 text-white text-center py-3 rounded-lg">
                Login / Sign Up
              </Link>
            }
          </div>

          <ul className="p-5 space-y-5 font-medium">
            {navLinks.map((item) => (
              <li key={item.name} className="border-b pb-3 cursor-pointer hover:text-red-600">
                <Link to={item.path} onClick={() => setMenuOpen(false)}>
                  {item.name}
                </Link>
              </li>
            ))}

            {/* Mobile Logout */}
            {isAuthenticated && (
              <li className="border-b pb-3 cursor-pointer text-red-600 hover:text-red-700">
                <button onClick={handleLogout} className="w-full text-left">
                  Logout
                </button>
              </li>
            )}
          </ul>
        </div>

        <div className="absolute inset-0 bg-black/40 -z-10" onClick={() => setMenuOpen(false)} />
      </div>

      {/* Click outside to close dropdown */}
      {dropdownOpen && <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />}
    </div>
  );
};

export default Navbar;

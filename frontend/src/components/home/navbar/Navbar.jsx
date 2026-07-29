import { useState } from "react";
import { FiMenu, FiX, FiSearch, FiUser, FiHeart, FiShoppingCart, FiChevronDown } from "react-icons/fi";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "Deals", path: "/deals" },
    { name: "Services", path: "/services" },
    { name: "About Us", path: "/aboutUs" },
    { name: "Contact Us", path: "/contactUs" },
  ];

  return (
    <>
      {/* Top Offer Bar */}
      <div className="bg-black text-white text-xs md:text-sm">
        <div className="max-w-7xl mx-auto px-4 h-10 flex items-center justify-center relative">
          <p className="font-medium">✨ Flat 20% OFF on Chandeliers | Free Delivery Across India</p>

          <button className="absolute right-4 bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs">Shop Now</button>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="h-20 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-11 h-11 rounded bg-red-600 text-white flex items-center justify-center font-bold text-xl">K</div>

              <div>
                <h2 className="font-bold text-2xl tracking-wide">
                  KHETHO<span className="text-red-600">MORR</span>
                </h2>

                <p className="text-[10px] text-gray-500 uppercase tracking-widest">Lighting • Home • Beyond</p>
              </div>
            </div>

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

            {/* Right Icons */}
            <div className="hidden md:flex items-center gap-8">
              <div className="flex flex-col items-center cursor-pointer hover:text-red-600">
                <FiUser size={22} />
                <span className="text-xs">Account</span>
              </div>

              <div className="flex flex-col items-center cursor-pointer hover:text-red-600">
                <FiHeart size={22} />
                <span className="text-xs">Wishlist</span>
              </div>

              <div className="relative flex flex-col items-center cursor-pointer hover:text-red-600">
                <FiShoppingCart size={22} />

                <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">0</span>

                <span className="text-xs">Cart</span>
              </div>
            </div>

            {/* Mobile */}
            <div className="flex md:hidden items-center gap-5">
              <FiSearch size={22} />

              <div className="relative">
                <FiShoppingCart size={22} />
                <span className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px]">0</span>
              </div>

              <button onClick={() => setMenuOpen(true)}>
                <FiMenu size={28} />
              </button>
            </div>
          </div>
        </div>

        {/* Menu */}
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
              KHETHO<span className="text-red-600">MORR</span>
            </h2>

            <button onClick={() => setMenuOpen(false)}>
              <FiX size={28} />
            </button>
          </div>

          <ul className="p-5 space-y-5 font-medium">
            {navLinks.map((item) => (
              <li key={item.name} className="border-b pb-3 cursor-pointer hover:text-red-600">
                <Link to={item.path} onClick={() => setMenuOpen(false)}>
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="absolute inset-0 bg-black/40 -z-10" onClick={() => setMenuOpen(false)} />
      </div>
    </>
  );
};

export default Navbar;

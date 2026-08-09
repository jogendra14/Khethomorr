// frontend/src/Admin/components/Topbar.jsx
import { 
  Bell, 
  Search, 
  Menu,
  X,
  User,
  Settings,
  LogOut,
  ChevronDown
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState, useRef, useEffect } from "react";

export default function Topbar({ toggleSidebar, isSidebarOpen }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);

  // Get current page title from path
  const getPageTitle = () => {
    const path = location.pathname.split("/").pop();
    return path.charAt(0).toUpperCase() + path.slice(1);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setShowUserMenu(false);
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
    }
  };

  // Demo notifications
  const notifications = [
    { id: 1, text: "New order received #1234", time: "5 min ago", unread: true },
    { id: 2, text: "Low stock alert: Product XYZ", time: "1 hour ago", unread: true },
    { id: 3, text: "New user registered", time: "3 hours ago", unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center gap-4 flex-1">
        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition lg:hidden"
        >
          {isSidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        {/* Page Title (Hidden on mobile) */}
        <h2 className="text-xl font-bold text-gray-800 hidden sm:block">
          {getPageTitle()}
        </h2>

        {/* Search Bar */}
        <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg px-4 py-2 flex-1 max-w-md ml-4">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent outline-none text-sm flex-1"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
          <kbd className="hidden lg:inline-block px-2 py-0.5 text-xs bg-gray-200 rounded text-gray-500 font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 rounded-lg hover:bg-gray-100 transition relative"
          >
            <Bell size={20} className="text-gray-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-fadeIn">
              <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100">
                <h3 className="font-semibold text-sm">Notifications</h3>
                <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                  Mark all read
                </button>
              </div>
              
              <div className="max-h-72 overflow-y-auto">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition ${
                      notif.unread ? "bg-blue-50/50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {notif.unread && (
                        <span className="mt-1.5 w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></span>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800">{notif.text}</p>
                        <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="px-4 py-2 border-t border-gray-100">
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium w-full text-center">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition"
          >
            <img
              src={user?.avatar || "https://i.pravatar.cc/100"}
              className="w-9 h-9 rounded-full object-cover ring-2 ring-blue-500 ring-offset-2"
              alt={user?.name || "Admin"}
            />
            <div className="hidden md:block text-left">
              <h3 className="text-sm font-semibold text-gray-800 leading-tight">
                {user?.name || "Admin"}
              </h3>
              <p className="text-xs text-gray-500 capitalize">{user?.role || "Admin"}</p>
            </div>
            <ChevronDown size={16} className="text-gray-400 hidden md:block" />
          </button>

          {/* User Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-fadeIn">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  to="/admin/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  <User size={16} />
                  My Profile
                </Link>
                <Link
                  to="/admin/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  <Settings size={16} />
                  Settings
                </Link>
              </div>

              <hr className="my-1" />

              <div className="py-1">
                <Link
                  to="/"
                  target="_blank"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  <Store size={16} />
                  Visit Store
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// Small helper component
const Store = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);
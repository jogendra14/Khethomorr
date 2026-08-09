// frontend/src/Admin/components/Sidebar.jsx
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  FolderTree, 
  TicketPercent, 
  Image, 
  Settings, 
  LogOut,
  ChevronLeft,
  X,
  Store,
  Star,
  CreditCard,
  BarChart3
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useState } from "react";

const Sidebar = ({ isOpen, toggleSidebar, isMobile }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/admin/dashboard",
      roles: ["admin", "superadmin"],
    },
    {
      name: "Products",
      icon: <Package size={20} />,
      path: "/admin/products",
      roles: ["admin", "superadmin", "vendor"],
    },
    {
      name: "Orders",
      icon: <ShoppingCart size={20} />,
      path: "/admin/orders",
      roles: ["admin", "superadmin"],
    },
    {
      name: "Users",
      icon: <Users size={20} />,
      path: "/admin/users",
      roles: ["admin", "superadmin"],
    },
    {
      name: "Categories",
      icon: <FolderTree size={20} />,
      path: "/admin/categories",
      roles: ["admin", "superadmin"],
    },
    {
      name: "Deals",
      icon: <TicketPercent size={20} />,
      path: "/admin/deals",
      roles: ["admin", "superadmin"],
    },
    {
      name: "Coupons",
      icon: <TicketPercent size={20} />,
      path: "/admin/coupons",
      roles: ["admin", "superadmin"],
    },
    {
      name: "Reviews",
      icon: <Star size={20} />,
      path: "/admin/reviews",
      roles: ["admin", "superadmin"],
    },
    {
      name: "Payments",
      icon: <CreditCard size={20} />,
      path: "/admin/payments",
      roles: ["admin", "superadmin"],
    },
    {
      name: "Banner",
      icon: <Image size={20} />,
      path: "/admin/banner",
      roles: ["admin", "superadmin"],
    },
    {
      name: "Analytics",
      icon: <BarChart3 size={20} />,
      path: "/admin/analytics",
      roles: ["admin", "superadmin"],
    },
    {
      name: "Settings",
      icon: <Settings size={20} />,
      path: "/admin/settings",
      roles: ["admin", "superadmin"],
    },
    {
      name: "Visit Store",
      icon: <Store size={20} />,
      path: "/",
      roles: ["admin", "superadmin", "vendor"],
      external: true,
    },
  ];

  // Filter menu based on user role
  const filteredMenu = menuItems.filter(
    item => user && item.roles.includes(user.role)
  );

  const handleLogout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      await logout();
    }
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-slate-900 text-white z-50 transition-all duration-300 ${
          isOpen ? "w-64" : "w-0 lg:w-20"
        } ${isMobile && !isOpen ? "-translate-x-full" : "translate-x-0"}`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard size={18} />
              </div>
              {(isOpen || (!isMobile && !isCollapsed)) && (
                <h1 className="text-lg font-bold whitespace-nowrap">
                  <span className="text-blue-400">Khetho</span>morr
                </h1>
              )}
            </div>
            
            {/* Close button - Mobile */}
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg hover:bg-slate-700 transition lg:hidden"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* User Info */}
          {isOpen && user && (
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <img
                  src={user.avatar || "https://i.pravatar.cc/100"}
                  alt={user.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-2 px-2">
            <ul className="space-y-1">
              {filteredMenu.map((item, index) => (
                <li key={index}>
                  {item.external ? (
                    <a
                      href={item.path}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
                      onClick={() => isMobile && toggleSidebar()}
                    >
                      {item.icon}
                      {isOpen && <span className="text-sm font-medium">{item.name}</span>}
                    </a>
                  ) : (
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                          isActive
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                            : "text-slate-300 hover:bg-slate-800 hover:text-white"
                        }`
                      }
                      onClick={() => isMobile && toggleSidebar()}
                    >
                      {item.icon}
                      {isOpen && <span className="text-sm font-medium">{item.name}</span>}
                      
                      {/* Active indicator */}
                      {location.pathname === item.path && !isOpen && (
                        <span className="absolute right-2 w-1.5 h-1.5 bg-white rounded-full"></span>
                      )}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout Button */}
          <div className="p-2 border-t border-slate-700">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition"
            >
              <LogOut size={20} />
              {isOpen && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
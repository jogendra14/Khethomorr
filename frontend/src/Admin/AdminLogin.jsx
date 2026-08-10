// frontend/src/Admin/AdminLogin.jsx
import { FaLock, FaEnvelope, FaEye, FaEyeSlash } from "react-icons/fa";
import { ShieldCheck } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import authApi from "../api/authApi";
import { useAuth } from "../context/AuthContext";

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isAuthenticated } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Get redirect path from location state
  const from = location.state?.from?.pathname || "/admin/dashboard";

  // ✅ Check if already authenticated and redirect immediately
  useEffect(() => {
    if (isAuthenticated && (user?.role === 'admin' || user?.role === 'superadmin')) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, user, navigate, from]);

  // ✅ React Query - Login Mutation
  const loginMutation = useMutation({
    mutationFn: (credentials) => authApi.login(credentials),
    
    onSuccess: (response) => {
      const { user: userData, token, refreshToken } = response.data.data || response.data;

      // Check if user is admin
      if (userData.role !== 'admin' && userData.role !== 'superadmin') {
        toast.error("Access denied! Admin only.");
        setError("This account doesn't have admin access.");
        return;
      }

      // ✅ Use AuthContext login
      login(userData, token, refreshToken);
      
      toast.success(`Welcome back, ${userData.name}! 👋`);
      
      // ✅ Set redirecting state
      setIsRedirecting(true);
      
      // ✅ Longer delay to ensure auth state is updated
      setTimeout(() => {
        navigate(from, { replace: true });
      }, 500); // Increased delay
    },
    
    onError: (error) => {
      let errorMessage = "Login failed. Please try again.";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 401) {
        errorMessage = "Invalid email or password";
      } else if (error.response?.status === 423) {
        errorMessage = "Account temporarily locked. Try again later.";
      } else if (error.response?.status === 403) {
        errorMessage = "Account deactivated. Contact administrator.";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const handleLogin = (e) => {
    e.preventDefault();
    
    const trimmedEmail = email.trim().toLowerCase();
    const passwordValue = password;
    
    if (!trimmedEmail || !passwordValue) {
      setError("Please fill in all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    setError("");
    loginMutation.mutate({ 
      email: trimmedEmail, 
      password: passwordValue 
    });
  };

  const { isPending } = loginMutation;

  // If already logged in as admin, show loading
  if (isRedirecting || (isAuthenticated && (user?.role === 'admin' || user?.role === 'superadmin'))) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4 text-lg">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-blue-600 to-blue-800 py-8 px-6 text-center text-white">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-4 ring-4 ring-white/30">
              <ShieldCheck size={45} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold">Admin Panel</h1>
            <p className="text-blue-100 mt-2 text-sm">Sign in to manage your store</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-8 space-y-5">
            {/* Email */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Email Address
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition disabled:bg-gray-100"
                  disabled={isPending}
                  autoComplete="email"
                  autoFocus
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Password
              </label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition disabled:bg-gray-100"
                  disabled={isPending}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                disabled={isPending}
                onClick={() => navigate("/forgot-password")}
              >
                Forgot Password?
              </button>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                <span>⚠️</span>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className={`w-full text-white font-semibold py-3 rounded-lg transition-all duration-200 ${
                isPending
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98] shadow-lg"
              }`}
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Back to Store */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-sm text-gray-500 hover:text-gray-700 transition"
                disabled={isPending}
              >
                ← Back to Store
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
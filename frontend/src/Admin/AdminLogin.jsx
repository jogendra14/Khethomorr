import API from "../api/axios";
import { FaLock, FaEnvelope } from "react-icons/fa";
import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

// ✅ Admin login API function
const adminLogin = async ({ email, password }) => {
  const { data } = await API.post("/admin/login", { email, password });
  
  // Validate admin role
  if (data.role !== "admin") {
    throw new Error("Access Denied. Admin only.");
  }
  
  return data;
};

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ✅ React Query - Admin Login Mutation
  const loginMutation = useMutation({
    mutationFn: adminLogin,
    
    onSuccess: (data) => {
      // Save admin data
      localStorage.setItem("token", data.token);
      localStorage.setItem("admin", JSON.stringify(data));
      
      toast.success("Welcome Admin! 🎉");
      
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 100);
    },
    
    onError: (error) => {
      console.error("Admin login error:", error);
      
      let errorMessage = "Login Failed";
      
      if (error.message === "Access Denied. Admin only.") {
        errorMessage = "Access Denied. Admin only.";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validate fields
    if (!email || !password) {
      setError("Please fill in all fields");
      toast.error("Please fill in all fields");
      return;
    }

    // Clear previous error
    setError("");

    // ✅ Trigger mutation
    loginMutation.mutate({ email, password });
  };

  const { isPending } = loginMutation;

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 py-8 flex flex-col items-center text-white">
          <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center">
            <ShieldCheck size={45} className="text-blue-600" />
          </div>

          <h1 className="text-3xl font-bold mt-4">Admin Panel</h1>

          <p className="text-blue-100 mt-2">Sign in to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="p-8 space-y-6">
          {/* Email */}
          <div>
            <label className="text-sm font-medium text-gray-700">Email</label>

            <div className="mt-2 flex items-center border rounded-lg px-4 focus-within:ring-2 focus-within:ring-blue-500 transition">
              <FaEnvelope className="text-gray-500" />

              <input 
                type="email" 
                placeholder="admin@gmail.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full p-3 outline-none"
                disabled={isPending}
                autoComplete="email"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>

            <div className="mt-2 flex items-center border rounded-lg px-4 focus-within:ring-2 focus-within:ring-blue-500 transition">
              <FaLock className="text-gray-500" />

              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 outline-none"
                disabled={isPending}
                autoComplete="current-password"
                required
              />
            </div>
          </div>

          {/* Remember & Forgot */}
          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                disabled={isPending}
              />
              Remember Me
            </label>

            <button 
              type="button" 
              className="text-blue-600 hover:underline transition"
              disabled={isPending}
              onClick={() => {
                toast.success("Password reset link sent to your email! 📧");
              }}
            >
              Forgot Password?
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
              ⚠️ {error}
            </div>
          )}

          {/* Button */}
          <button 
            type="submit" 
            disabled={isPending}
            className={`w-full text-white font-semibold py-3 rounded-lg transition ${
              isPending 
                ? "bg-blue-400 cursor-not-allowed" 
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
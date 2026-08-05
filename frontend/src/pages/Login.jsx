import { useState } from "react";
import { FaGoogle, FaFacebookF, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import Kethomorr from "../assets/Kethomorr.jpeg";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // ✅ React Query - Login Mutation
  const loginMutation = useMutation({
    mutationFn: (credentials) => loginUser(credentials),
    
    onSuccess: (response) => {
      console.log("📥 Login Response:", response);

      if (response && response.token) {
        // Use the login function from context
        login(response, response.token);
        toast.success("Welcome back! 🎉");
        
        setTimeout(() => {
          navigate("/");
        }, 100);
      } else {
        setError("Invalid credentials. Please try again.");
        toast.error("Invalid credentials ❌");
      }
    },
    
    onError: (error) => {
      console.error("Login error:", error);
      
      let errorMessage = "Login failed. Please try again.";
      
      if (error.response) {
        errorMessage = error.response.data?.message || 
                      error.response.data?.error || 
                      "Invalid email or password";
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message || "An unexpected error occurred";
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError("");
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      toast.error("Please fill in all fields");
      return;
    }

    // ✅ Trigger mutation
    loginMutation.mutate({
      email: formData.email,
      password: formData.password
    });
  };

  const { isPending } = loginMutation;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        <img src={Kethomorr} alt="logo" className="w-100 p-7" />
        <h1 className="text-2xl font-bold text-center text-gray-700">Welcome Back</h1>
        <p className="text-center text-gray-400 mt-2 mb-8">Please login to your account</p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email address"
            value={formData.email}
            onChange={handleChange}
            className="w-full bg-gray-100 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-400 mb-5"
            required
            disabled={isPending}
            autoComplete="email"
          />

          <div className="relative mb-2">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-gray-100 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-400"
              required
              disabled={isPending}
              autoComplete="current-password"
            />

            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer hover:text-gray-600 transition"
              disabled={isPending}
            >
              {showPassword ? <FaEye size={20} /> : <FaEyeSlash size={20} />}
            </button>
          </div>

          <div className="text-right mb-6">
            <button 
              type="button" 
              className="text-sm text-gray-400 hover:text-orange-500 transition"
              disabled={isPending}
              onClick={() => {
                toast.success("Password reset link sent to your email! 📧");
              }}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-semibold text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <div className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="flex items-center my-8">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-3 text-gray-400 text-sm">Or Login with</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            className="border rounded-xl py-3 flex justify-center items-center gap-3 hover:bg-gray-100 transition"
            disabled={isPending}
          >
            <FaGoogle className="text-red-500" />
            Google
          </button>
          <button 
            className="border rounded-xl py-3 flex justify-center items-center gap-3 hover:bg-gray-100 transition"
            disabled={isPending}
          >
            <FaFacebookF className="text-blue-600" />
            Facebook
          </button>
        </div>

        <p className="text-center text-gray-500 mt-8">
          Don't have an account?{" "}
          <Link to="/signUp" className="text-orange-500 font-semibold hover:underline">
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
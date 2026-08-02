import { FaGoogle, FaFacebookF, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Kethomorr from "../assets/Kethomorr.jpeg";
import { registerUser, checkUserExists } from "../api/authApi";
import { useState } from "react";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");

  // Check if email exists on blur or change
  const handleEmailCheck = async (email) => {
    if (!email) return;
    
    try {
      const response = await checkUserExists(email);
      if (response.exists) {
        setEmailError("This email is already registered. Please login instead.");
        return true; // Email exists
      } else {
        setEmailError("");
        return false; // Email is available
      }
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    }
  };

  const handleEmailChange = async (e) => {
    const email = e.target.value;
    setFormData({...formData, email});
    
    // Check if email exists (debounced)
    if (email) {
      await handleEmailCheck(email);
    } else {
      setEmailError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validate email again before submitting
    const emailExists = await handleEmailCheck(formData.email);
    if (emailExists) {
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match ❌");
      setLoading(false);
      return;
    }

    try {
      const data = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      alert("Registration Successful ✅");

      // Save token and user data to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user || data.data?.user));

      console.log("Registration Data:", data);

      // Redirect to dashboard or home page
      navigate("/dashboard");
      
    } catch (err) {
      // Handle specific error cases from backend
      const errorMessage = err.response?.data?.message || "Registration Failed ❌";
      
      if (errorMessage.includes("already") || errorMessage.includes("exists")) {
        setEmailError("This email is already registered. Please login instead.");
      } else {
        alert(errorMessage);
      }
      
      console.error("Registration Error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        {/* Logo */}
        <img src={Kethomorr} alt="logo" className="w-60 mx-auto mb-6" />

        {/* Heading */}
        <h1 className="text-2xl font-bold text-center text-gray-700">Create Account</h1>

        <p className="text-center text-gray-400 mt-2 mb-8">Create your account to get started</p>

        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <input 
            type="text" 
            placeholder="Full Name" 
            className="w-full bg-gray-100 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-400 mb-5" 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
          />

          {/* Email with validation */}
          <div className="relative mb-5">
            <input
              type="email"
              placeholder="Email Address"
              className={`w-full bg-gray-100 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-400 ${
                emailError ? "border-2 border-red-500" : ""
              }`}
              value={formData.email}
              onChange={handleEmailChange}
              onBlur={() => handleEmailCheck(formData.email)}
              required
            />
            {emailError && (
              <div className="flex items-center mt-1 text-red-500 text-sm">
                <span className="mr-1">⚠️</span>
                {emailError}
              </div>
            )}
          </div>

          {/* Password */}
          <div className="relative mb-5">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              className="w-full bg-gray-100 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-400 pr-12" 
              value={formData.password}  
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              minLength={6}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative mb-6">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full bg-gray-100 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-400 pr-12"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
              minLength={6}
            />

            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>

          {/* Signup Button */}
          <button 
            type="submit" 
            className={`w-full text-white py-4 rounded-xl font-semibold text-lg transition ${
              emailError 
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-orange-500 hover:bg-orange-600"
            }`}
            disabled={loading || !!emailError}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-8">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-3 text-gray-400 text-sm">Or Sign Up with</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-4">
          <button className="border rounded-xl py-3 flex justify-center items-center gap-3 hover:bg-gray-100 transition">
            <FaGoogle className="text-red-500" />
            Google
          </button>

          <button className="border rounded-xl py-3 flex justify-center items-center gap-3 hover:bg-gray-100 transition">
            <FaFacebookF className="text-blue-600" />
            Facebook
          </button>
        </div>

        {/* Login Link */}
        <p className="text-center text-gray-500 mt-8">
          Already have an account?{" "}
          <Link to="/login" className="text-orange-500 font-semibold hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;
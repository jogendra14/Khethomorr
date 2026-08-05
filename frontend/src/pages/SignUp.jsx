import { FaGoogle, FaFacebookF, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import Kethomorr from "../assets/Kethomorr.jpeg";
import { useState, useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { registerUser, checkUserExists } from "../api/authApi";
import toast from "react-hot-toast";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  
  const emailInputRef = useRef(null);
  const [isEmailChecked, setIsEmailChecked] = useState(false);
  const [emailCheckLoading, setEmailCheckLoading] = useState(false);

  // ✅ React Query - Register Mutation
  const registerMutation = useMutation({
    mutationFn: (userData) => registerUser(userData),
    
    onSuccess: (response) => {
      console.log("📥 Registration Response:", response);
      
      // Handle different response structures
      const token = response.token || response.data?.token || response.accessToken;
      const user = response.user || response.data?.user || response.data;

      if (!token) {
        toast.error("Registration successful but no token received. Please login.");
        navigate("/login");
        return;
      }

      // Save token and user data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user || { 
        email: formData.email, 
        name: formData.name 
      }));

      toast.success("Registration Successful ✅");
      
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 100);
    },
    
    onError: (err) => {
      console.error("❌ Registration Error:", err);
      
      let errorMessage = "Registration Failed ❌";
      
      if (err.response) {
        console.error("Server Error:", err.response.data);
        errorMessage = err.response.data?.message || 
                      err.response.data?.error || 
                      "Server error occurred";
                      
        if (errorMessage.toLowerCase().includes("already") || 
            errorMessage.toLowerCase().includes("exists")) {
          setEmailError("This email is already registered. Please login instead.");
          toast.error("Email already registered");
          return;
        }
      } else if (err.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = err.message || "An unexpected error occurred";
      }
      
      toast.error(errorMessage);
    },
  });

  // ✅ Handle email check
  const handleEmailCheck = async (email) => {
    if (!email) return false;
    
    setEmailCheckLoading(true);
    try {
      const response = await checkUserExists(email);
      if (response.exists) {
        setEmailError("This email is already registered. Please login instead.");
        return true;
      } else {
        setEmailError("");
        return false;
      }
    } catch (error) {
      console.error("Error checking email:", error);
      return false;
    } finally {
      setEmailCheckLoading(false);
    }
  };

  // ✅ Handle autofill
  useEffect(() => {
    if (emailInputRef.current && emailInputRef.current.value) {
      const autofilledEmail = emailInputRef.current.value;
      if (autofilledEmail !== formData.email) {
        setFormData(prev => ({ ...prev, email: autofilledEmail }));
        if (!isEmailChecked) {
          handleEmailCheck(autofilledEmail);
          setIsEmailChecked(true);
        }
      }
    }
  }, []);

  // ✅ Handle email change
  const handleEmailChange = async (e) => {
    const email = e.target.value;
    setFormData({...formData, email});
    setIsEmailChecked(false);
    
    if (email) {
      await handleEmailCheck(email);
    } else {
      setEmailError("");
    }
  };

  // ✅ Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if email exists
    const emailExists = await handleEmailCheck(formData.email);
    if (emailExists) return;

    // Validate passwords
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match ❌");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters ❌");
      return;
    }

    // Submit registration
    registerMutation.mutate({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });
  };

  const { isPending } = registerMutation;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        <img src={Kethomorr} alt="logo" className="w-60 mx-auto mb-6" />
        <h1 className="text-2xl font-bold text-center text-gray-700">Create Account</h1>
        <p className="text-center text-gray-400 mt-2 mb-8">Create your account to get started</p>

        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            placeholder="Full Name" 
            className="w-full bg-gray-100 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-400 mb-5" 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            autoComplete="name"
            disabled={isPending}
          />

          <div className="relative mb-5">
            <input
              ref={emailInputRef}
              type="email"
              placeholder="Email Address"
              autoComplete="off"
              className={`w-full bg-gray-100 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-400 ${
                emailError ? "border-2 border-red-500" : ""
              }`}
              value={formData.email}
              onChange={handleEmailChange}
              onBlur={() => handleEmailCheck(formData.email)}
              required
              disabled={isPending}
            />
            {emailCheckLoading && (
              <div className="flex items-center mt-1 text-gray-500 text-sm">
                <span className="animate-spin mr-2">⏳</span>
                Checking email...
              </div>
            )}
            {emailError && (
              <div className="flex items-center mt-1 text-red-500 text-sm">
                <span className="mr-1">⚠️</span>
                {emailError}
              </div>
            )}
          </div>

          <div className="relative mb-5">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              className="w-full bg-gray-100 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-400 pr-12" 
              value={formData.password}  
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
              minLength={6}
              autoComplete="new-password"
              disabled={isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              {showPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>

          <div className="relative mb-6">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full bg-gray-100 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-400 pr-12"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              required
              minLength={6}
              autoComplete="new-password"
              disabled={isPending}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
            >
              {showConfirmPassword ? <FaEye /> : <FaEyeSlash />}
            </button>
          </div>

          <button 
            type="submit" 
            className={`w-full text-white py-4 rounded-xl font-semibold text-lg transition ${
              emailError || isPending
                ? "bg-gray-400 cursor-not-allowed" 
                : "bg-orange-500 hover:bg-orange-600"
            }`}
            disabled={isPending || !!emailError}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin">⏳</span>
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <div className="flex items-center my-8">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-3 text-gray-400 text-sm">Or Sign Up with</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

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
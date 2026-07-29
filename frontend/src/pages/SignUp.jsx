import { FaGoogle, FaFacebookF, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import Kethomorr from "../assets/Kethomorr.jpeg";
import { registerUser } from "../api/authApi";
import { useState } from "react";

const SignUp = () => {
  const [formData, setFormData] = useState({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    return alert("Passwords do not match");
  }

  try {
    const data = await registerUser({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });

    alert("Registration Successful");

    localStorage.setItem("token", data.token);

    console.log(data);
  } catch (err) {
    alert(err.response?.data?.message || "Registration Failed");
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
        <input type="text" placeholder="Full Name" className="w-full bg-gray-100 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-400 mb-5" 
          value={formData.name} onChange={(e)=> setFormData({...formData,name: e.target.value})}/>

        {/* Email */}
        <input
          type="email"
          placeholder="Email Address"
          className="w-full bg-gray-100 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-400 mb-5"
          value={formData.email}
          onChange={(e)=> setFormData({...formData, email: e.target.value})}
          />

        {/* Password */}
        <div className="relative mb-5">
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full bg-gray-100 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-400" 
            value={formData.password}  
            onChange={(e)=> setFormData({...formData, password: e.target.value})}
            />


          <FaEyeSlash className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" />
        </div>

        {/* Confirm Password */}
        <div className="relative mb-6">
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full bg-gray-100 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-400"
            value={formData.confirmPassword}
            onChange={(e)=> setFormData({...formData, confirmPassword: e.target.value})}
            />

          <FaEyeSlash className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" />
        </div>

        {/* Signup Button */}
        <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-semibold text-lg transition">Create Account</button>
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

        {/* Login */}
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

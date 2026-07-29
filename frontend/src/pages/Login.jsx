import { FaGoogle, FaFacebookF, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import Kethomorr from "../assets/Kethomorr.jpeg";

const Login = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        {/* Logo */}
        <img src={Kethomorr} alt="logo" className="w-100 p-7" />

        {/* Heading */}

        <h1 className="text-2xl font-bold text-center text-gray-700">Welcome Back</h1>

        <p className="text-center text-gray-400 mt-2 mb-8">Please login to your account</p>

        {/* Email */}

        <input
          type="email"
          placeholder="Email address"
          className="w-full bg-gray-100 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-400 mb-5"
        />

        {/* Password */}

        <div className="relative mb-2">
          <input type="password" placeholder="Password" className="w-full bg-gray-100 rounded-xl px-5 py-4 outline-none focus:ring-2 focus:ring-orange-400" />

          <FaEyeSlash className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer" />
        </div>

        {/* Forgot */}

        <div className="text-right mb-6">
          <button className="text-sm text-gray-400 hover:text-orange-500">Forgot password?</button>
        </div>

        {/* Login Button */}

        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-semibold text-lg transition">Login</button>

        {/* Divider */}

        <div className="flex items-center my-8">
          <div className="flex-1 h-px bg-gray-300"></div>

          <span className="px-3 text-gray-400 text-sm">Or Login with</span>

          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Social Buttons */}

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

        {/* Signup */}

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

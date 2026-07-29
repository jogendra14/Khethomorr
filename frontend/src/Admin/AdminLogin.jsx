import API from "../api/axios";
import { FaLock, FaEnvelope } from "react-icons/fa";
import { ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    try {
      const { data } = await API.post("/auth/login", {
  email,
  password,
});

      if (data.role !== "admin") {
        setError("Access Denied. Admin only.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("admin", JSON.stringify(data));

      navigate("/admin/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Login Failed");
    }
  };

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

            <div className="mt-2 flex items-center border rounded-lg px-4">
              <FaEnvelope className="text-gray-500" />

              <input type="email" placeholder="admin@gmail.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-3 outline-none" />
            </div>
          </div>

          {/* Password */}

          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>

            <div className="mt-2 flex items-center border rounded-lg px-4">
              <FaLock className="text-gray-500" />

              <input
                type="password"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 outline-none"
              />
            </div>
          </div>

          {/* Remember */}

          <div className="flex justify-between items-center text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" />
              Remember Me
            </label>

            <button type="button" className="text-blue-600 hover:underline">
              Forgot Password?
            </button>
          </div>

          {/* error */}

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {/* Button */}

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition text-white font-semibold py-3 rounded-lg">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;

import { useState } from "react";
import { FaGoogle, FaGithub } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password });
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[#0f0e18] via-[#1a1830] to-[#0f0e18] p-4">
      <div className="bg-[#1c1b29] p-8 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md">
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-[#0f0e18] text-white border border-gray-600 focus:outline-none focus:border-purple-500"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-[#0f0e18] text-white border border-gray-600 focus:outline-none focus:border-purple-500"
            required
          />
          <button
            type="submit"
            className="w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 text-center text-gray-400">or sign in with</div>
        <Link
          to="/register"
          className="flex justify-center mt-2 hover:text-purple-400"
        >
          don't have an account yet?
        </Link>

        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button className="flex-1 py-2 flex items-center justify-center gap-2 bg-[#0f0e18] text-white border border-gray-600 rounded-lg hover:bg-gray-800 transition">
            <FaGoogle /> Google
          </button>
          <button className="flex-1 py-2 flex items-center justify-center gap-2 bg-[#0f0e18] text-white border border-gray-600 rounded-lg hover:bg-gray-800 transition">
            <FaGithub /> GitHub
          </button>
        </div>
      </div>
    </div>
  );
}

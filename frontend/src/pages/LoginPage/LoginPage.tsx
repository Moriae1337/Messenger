import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../components/ToastProvider";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  useEffect(() => {
    localStorage.clear();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const response = await fetch("http://localhost:8000/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData,
    });

    if (!response.ok) {
      setLoading(false);
      const errorData = await response.json();
      showToast(errorData.detail || "Something went wrong", "error");
      throw new Error(errorData.detail || "Login failed");
    }

    const data = await response.json();
    console.log(data);
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("username", data.username);
    setLoading(false);
    showToast("User login successfull!", "success");
    navigate("/");
  };

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[#0f0e18] via-[#1a1830] to-[#0f0e18] p-4">
      <div className="bg-[#1c1b29] p-8 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md">
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            className="flex justify-center items-center w-full py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:opacity-90 transition"
            disabled={loading}
          >
            {loading ? (
              <div className="flex space-x-1">
                <span className="w-3 h-3 bg-white rounded-full animate-bounce delay-0"></span>
                <span className="w-3 h-3 bg-white rounded-full animate-bounce delay-150"></span>
                <span className="w-3 h-3 bg-white rounded-full animate-bounce delay-300"></span>
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        <Link
          to="/register"
          className="flex justify-center mt-2 hover:text-purple-400"
        >
          Don't have an account yet?
        </Link>
      </div>
    </div>
  );
}

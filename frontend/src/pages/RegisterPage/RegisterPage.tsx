import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../components/ToastProvider";

interface UserCreate {
  username: string;
  email: string;
  password: string;
}

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.clear();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    setLoading(true);
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};
    if (password.length > 0 && password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      showToast(newErrors.password, "error");
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      showToast(newErrors.confirmPassword, "error");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    setErrors({});

    const credentials: UserCreate = {
      username: username,
      email: email,
      password: password,
    };
    const response = await fetch("http://localhost:8000/users/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    if (!response.ok) {
      let errorMessage = "";
      setLoading(false);
      try {
        const errorData = await response.json();
        if (Array.isArray(errorData.detail)) {
          errorMessage = errorData.detail[0].msg;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        }
      } catch {
        errorMessage = "Something went wrong";
      }
      showToast(errorMessage, "error");
      return;
    }
    setLoading(false);
    showToast("User registered successfully!", "success");
    navigate("/login");
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-[#0f0e18] via-[#1a1830] to-[#0f0e18] p-4">
      <div className="bg-[#1c1b29] p-8 rounded-2xl shadow-2xl w-full max-w-sm sm:max-w-md">
        <h2 className="text-2xl font-bold text-center text-white mb-6">
          Create an account
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg bg-[#0f0e18] text-white border ${
              errors.username ? "border-red-500" : "border-gray-600"
            } focus:outline-none focus:border-purple-500`}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg bg-[#0f0e18] text-white border ${
              errors.email ? "border-red-500" : "border-gray-600"
            } focus:outline-none focus:border-purple-500`}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg bg-[#0f0e18] text-white border ${
              errors.password ? "border-red-500" : "border-gray-600"
            } focus:outline-none focus:border-purple-500`}
            required
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`w-full px-4 py-2 rounded-lg bg-[#0f0e18] text-white border ${
              errors.confirmPassword ? "border-red-500" : "border-gray-600"
            } focus:outline-none focus:border-purple-500`}
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
              "Sign Up"
            )}
          </button>
        </form>
        <Link
          to="/login"
          className="flex justify-center mt-2 hover:text-purple-400"
        >
          Already have an account?
        </Link>
      </div>
    </div>
  );
}

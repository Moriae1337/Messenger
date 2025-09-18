import { Route, Routes } from "react-router-dom";
import Homepage from "../pages/Homepage";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Homepage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/login" element={<LoginPage />} />
    {/* Catch-all for incorrect URLs */}
    <Route
      path="*"
      element={
        <div className="h-screen w-screen flex items-center justify-center bg-[#0f0e18] text-white flex-col">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-lg">The URL you entered is incorrect.</p>
        </div>
      }
    />
  </Routes>
);

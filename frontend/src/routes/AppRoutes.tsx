import { Route, Routes } from "react-router-dom";
import Homepage from "../pages/Homepage";
import RegisterPage from "../pages/RegisterPage";
import LoginPage from "../pages/LoginPage";
import IncorrectUrl from "../components/IncorrectUrl";

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Homepage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/login" element={<LoginPage />} />
    {/* Catch-all for incorrect URLs */}
    <Route path="*" element={<IncorrectUrl />} />
  </Routes>
);

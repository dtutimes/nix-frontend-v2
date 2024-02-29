import Login from "@/pages/auth/Login/index.js";
import ForgotPassword from "@/pages/auth/ForgotPassword/index.js";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute.js";
import ErrorCtxProvider from "@/contexts/error.js";
import PermErrCtxProvider from "@/contexts/permission_error.js";
import CurrUserCtxProvider from "@/contexts/current_user.js";
import HomePage from "@/pages/HomePage.js";
import ResetPassword from "@/pages/auth/ResetPassword/index.js";

const AppRoute = () => {
  return (
    <ErrorCtxProvider>
      <PermErrCtxProvider>
        <CurrUserCtxProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<HomePage />} />
            <Route path="/*" element={<ProtectedRoute />} />
          </Routes>
        </CurrUserCtxProvider>
      </PermErrCtxProvider>
    </ErrorCtxProvider>
  );
};

export default AppRoute;

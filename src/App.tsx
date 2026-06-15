/**
 * @copyright 2025 Marcell Ferreira - Advocacia
 * @license Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MotionConfig } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";
import { BaseLayout } from "./layout/BaseLayout";
import { DashboardScreen, DashboardJurimetricsScreen, DashboardScreen3, DashboardCRMScreen } from "./screens/Dashboard";
import { Home } from "./pages/home";
import { ThemeProvider } from "@/components/themeProvider";
import { Toaster } from "@/components/ui/sonner";
import { Login } from "./components/login";
import { Signup } from "./components/signup";
import { NewPassword } from "./components/newPassword";
import { BaseLayoutDashboard } from "./layout/BaseLayoutDashboard";
import { Users } from "./components/users";
import { Rules } from "./components/rule";
import { Areas } from "./components/areas";
import { Courts } from "./components/courts";
import { Profiles } from './components/profiles';
import { Stages } from "./components/stages";
import { Status } from "./components/status";
import { Outcomes } from "./components/outcomes";
import { Cities } from "./components/cities";
import { Causes } from "./components/causes";
import { Divisions } from './components/divisions';
import { Checklists } from './components/checklists';
import { ProtectedRoute } from "./components/ProtectedRoute/ProtectedRoute";
import { useIdleTimeout } from "./hooks/useIdleTimeout";

const queryClient = new QueryClient();

// Inner component rendered inside <Router> so useNavigate() context is available
const AppRoutes = () => {
  useIdleTimeout();

  return (
    <Routes>
      <Route path="/" element={<BaseLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="new-password" element={<NewPassword />} />
        <Route
          path="/Dashboard"
          element={
            <ProtectedRoute>
              <BaseLayoutDashboard />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardCRMScreen />} />
          <Route path="exploratoria" element={<DashboardScreen />} />
          <Route path="jurimetria" element={<DashboardJurimetricsScreen />} />
          <Route path="rede" element={<DashboardScreen3 />} />
          <Route path="signup" element={<Signup />} />
          <Route path="users" element={<Users />} />
          <Route path="causes" element={<Causes />} />
          <Route path="cities" element={<Cities />} />
          <Route path="divisions" element={<Divisions />} />
          <Route path="rule" element={<Rules />} />
          <Route path="areas" element={<Areas />} />
          <Route path="courts" element={<Courts />} />
          <Route path="profiles" element={<Profiles />} />
          <Route path="stages" element={<Stages />} />
          <Route path="status" element={<Status />} />
          <Route path="checklists" element={<Checklists />} />
          <Route path="outcomes" element={<Outcomes />} />
        </Route>
      </Route>
    </Routes>
  );
};

export const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <MotionConfig reducedMotion="user">
            <Router>
              <AppRoutes />
              <Toaster position="top-right" richColors />
            </Router>
          </MotionConfig>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

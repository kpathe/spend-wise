import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import AllExpenses from "../pages/expenses/AllExpenses";
import DailyExpenses from "../pages/expenses/DailyExpenses";
import MonthlyExpenses from "../pages/expenses/MonthlyExpenses";
import YearlyExpenses from "../pages/expenses/YearlyExpenses";
import Categories from "../pages/categories/Categories";
import CategoryBreakdown from "../pages/categories/CategoryBreakdown";
import Settings from "../pages/settings/Settings";
import Charts from "../pages/charts/Charts";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";

const ProtectedRoute = () => {
  const isAuthenticated = localStorage.getItem("userLoggedIn") === "true";
  return isAuthenticated ? <Outlet /> : <Navigate to="/auth/login" replace />;
};

const PublicRoute = () => {
  const isAuthenticated = localStorage.getItem("userLoggedIn") === "true";
  return isAuthenticated ? <Navigate to="/expenses/daily-expenses" replace /> : <Outlet />;
};

const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: "/auth/login",
            element: <Login />,
          },
          {
            path: "/auth/signup",
            element: <Signup />,
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { path: "/", element: <Navigate to="/expenses/daily-expenses" replace /> },
          { path: "/dashboard", element: <Navigate to="/expenses/daily-expenses" replace /> },
          { path: "/expenses/daily-expenses", element: <DailyExpenses /> },
          { path: "/expenses/all-expenses", element: <AllExpenses /> },
          { path: "/expenses/monthly-expenses", element: <MonthlyExpenses /> },
          { path: "/expenses/yearly-expenses", element: <YearlyExpenses /> },
          { path: "/categories", element: <Categories /> },
          { path: "/categories/breakdown", element: <CategoryBreakdown /> },
          { path: "/settings", element: <Settings /> },
          { path: "/charts", element: <Charts /> },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/auth/login" replace />,
  },
]);

function AppRoutes() {
  return <RouterProvider router={router} />;
}

export default AppRoutes;

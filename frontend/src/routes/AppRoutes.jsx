import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";
import Dashboard from "../pages/dashboard/Dashboard";
import AllExpenses from "../pages/expenses/AllExpenses";
import DailyExpenses from "../pages/expenses/DailyExpenses";
import WeeklyExpenses from "../pages/expenses/WeeklyExpenses";
import MonthlyExpenses from "../pages/expenses/MonthlyExpenses";
import YearlyExpenses from "../pages/expenses/YearlyExpenses";
import Categories from "../pages/categories/Categories";
import CategoryBreakdown from "../pages/categories/CategoryBreakdown";
import AuthLayout from "../layouts/AuthLayout";
import MainLayout from "../layouts/MainLayout";

const router = createBrowserRouter([
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
  {
    element: <MainLayout />,
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      { path: "/expenses/daily-expenses", element: <DailyExpenses /> },
      { path: "/expenses/all-expenses", element: <AllExpenses /> },
      { path: "/expenses/weekly-expenses", element: <WeeklyExpenses /> },
      { path: "/expenses/monthly-expenses", element: <MonthlyExpenses /> },
      { path: "/expenses/yearly-expenses", element: <YearlyExpenses /> },
      { path: "/categories/", element: <Categories /> },
      { path: "/categories/breakdown", element: <CategoryBreakdown /> },
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

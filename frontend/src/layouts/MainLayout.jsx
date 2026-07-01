import { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import { getCookie } from "../utils/cookie";

function MainLayout() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const avatarRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  // Theme State & Persistence in Navbar
  const [theme, setTheme] = useState(
    () => localStorage.getItem("spendwiseTheme") || "light"
  );

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("spendwiseTheme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Get User initials from cookie name
  const getUserInitials = () => {
    const fullName = getCookie("spendwiseUserName") || "User";
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase();
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isExpensePage =
    location.pathname === "/expenses/daily-expenses" ||
    location.pathname === "/expenses/monthly-expenses" ||
    location.pathname === "/expenses/yearly-expenses";

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 flex justify-center transition-colors duration-200">
      {/* Mobile-only Viewport Wrapper */}
      <div className="w-full max-w-md h-dvh bg-[#f4f2f8] dark:bg-zinc-900 flex flex-col border-x border-slate-200 dark:border-zinc-800 shadow-2xl relative overflow-hidden bg-doodles">

        {/* Header */}
        <header className="sticky top-0 z-40 bg-[#378c34] dark:bg-zinc-900 border-b border-[#2c7229] dark:border-zinc-800 px-4 py-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => navigate("/expenses/daily-expenses")}>
              {/* Spendwise Logo SVG */}
              <div className="w-8 h-8 rounded-xl bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold tracking-tight text-white dark:text-zinc-100 font-sans">
                Spendwise
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Search Icon */}
            <NavLink
              to="/expenses/all-expenses"
              className={({ isActive }) =>
                `p-2 rounded-full active:scale-95 transition-all ${isActive
                  ? "bg-[#2c7229] dark:bg-indigo-950/40 text-white dark:text-indigo-400"
                  : "text-emerald-100 dark:text-zinc-400 hover:bg-[#2c7229]/60 dark:hover:bg-zinc-800/60 hover:text-white"
                }`
              }
            >
              <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </NavLink>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-emerald-100 dark:text-zinc-400 hover:bg-[#2c7229]/60 dark:hover:bg-zinc-800/60 hover:text-white active:scale-95 transition-all cursor-pointer"
              title="Toggle theme"
            >
              {theme === "light" ? (
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5.5 h-5.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-11.314l.707.707m11.314 11.314l.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
                </svg>
              )}
            </button>

            {/* Profile Avatar Trigger */}
            <div className="relative">
              <button
                ref={avatarRef}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-9 h-9 rounded-full bg-[#2c7229] dark:bg-zinc-800 border border-[#235b20] dark:border-zinc-700 flex items-center justify-center text-white dark:text-zinc-300 hover:ring-2 hover:ring-indigo-500/20 active:scale-95 transition-all overflow-hidden"
              >
                {/* User Profile Initials */}
                <span className="font-semibold text-xs tracking-wider">{getUserInitials()}</span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-zinc-800 shadow-xl border border-slate-100 dark:border-zinc-700/80 py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  <NavLink
                    to="/settings"
                    onClick={() => setIsDropdownOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors ${isActive
                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20"
                        : "text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700/50"
                      }`
                    }
                  >
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </NavLink>

                  <NavLink
                    to="/charts"
                    onClick={() => setIsDropdownOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium transition-colors ${isActive
                        ? "text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20"
                        : "text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-700/50"
                      }`
                    }
                  >
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.003 9.003 0 1020.945 13H11V3.055z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
                    </svg>
                    Charts
                  </NavLink>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tab Navigation (Daily, Monthly, Yearly) - Rendered only on Main Expense views */}
        {isExpensePage && (
          <nav className="bg-[#4fae4c] dark:bg-zinc-900 border-b border-[#40943d] dark:border-zinc-800 flex text-center">
            <NavLink
              to="/expenses/daily-expenses"
              className={({ isActive }) =>
                `flex-1 py-3 text-sm font-semibold tracking-wide border-b-2 transition-all ${isActive
                  ? "text-white dark:text-emerald-400 border-white dark:border-emerald-500 bg-[#40943d]/50 dark:bg-zinc-950/40"
                  : "text-emerald-50 dark:text-zinc-400 border-transparent hover:text-white dark:hover:text-zinc-200 hover:bg-[#40943d]/20 dark:hover:bg-zinc-800/30"
                }`
              }
            >
              Daily
            </NavLink>
            <NavLink
              to="/expenses/monthly-expenses"
              className={({ isActive }) =>
                `flex-1 py-3 text-sm font-semibold tracking-wide border-b-2 transition-all ${isActive
                  ? "text-white dark:text-emerald-400 border-white dark:border-emerald-500 bg-[#40943d]/50 dark:bg-zinc-950/40"
                  : "text-emerald-50 dark:text-zinc-400 border-transparent hover:text-white dark:hover:text-zinc-200 hover:bg-[#40943d]/20 dark:hover:bg-zinc-800/30"
                }`
              }
            >
              Monthly
            </NavLink>
            <NavLink
              to="/expenses/yearly-expenses"
              className={({ isActive }) =>
                `flex-1 py-3 text-sm font-semibold tracking-wide border-b-2 transition-all ${isActive
                  ? "text-white dark:text-emerald-400 border-white dark:border-emerald-500 bg-[#40943d]/50 dark:bg-zinc-950/40"
                  : "text-emerald-50 dark:text-zinc-400 border-transparent hover:text-white dark:hover:text-zinc-200 hover:bg-[#40943d]/20 dark:hover:bg-zinc-800/30"
                }`
              }
            >
              Yearly
            </NavLink>
          </nav>
        )}

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col bg-[#f4f2f8] dark:bg-zinc-950 overflow-hidden bg-doodles min-h-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;

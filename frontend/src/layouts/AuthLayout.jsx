import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div className="min-h-screen bg-slate-100 dark:bg-zinc-950 flex justify-center items-center transition-colors duration-200">
      {/* Mobile-only Viewport Wrapper */}
      <div className="w-full max-w-md min-h-screen sm:min-h-[85vh] sm:rounded-3xl bg-[#f4f2f8] dark:bg-zinc-900 flex flex-col border border-slate-200/60 dark:border-zinc-800/80 shadow-2xl overflow-hidden bg-doodles">
        <main className="flex-1 flex flex-col justify-center px-6 pt-6 pb-10 sm:py-12 bg-[#f4f2f8] dark:bg-zinc-950 overflow-y-auto bg-doodles">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AuthLayout;

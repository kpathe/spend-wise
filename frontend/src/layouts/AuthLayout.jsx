import { Outlet } from "react-router-dom";

function AuthLayout() {
  return (
    <div>
      <nav></nav>
      <Outlet />
    </div>
  );
}

export default AuthLayout;

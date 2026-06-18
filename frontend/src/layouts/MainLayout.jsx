import { Outlet } from "react-router-dom";

function MainLayout() {
  return (
    <div>
      <nav></nav>
      <Outlet />
    </div>
  );
}

export default MainLayout;

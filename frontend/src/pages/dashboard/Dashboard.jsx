import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../api/auth.api";

function Dashboard() {
  const navigate = useNavigate();
  const handleClick = async () => {
    try {
      const data = await logoutUser();
      console.log("Backend response", data);

      navigate("/auth/login");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Something went wrong";

      alert(errorMessage);
    }
  };

  return (
    <div>
      <h1>Dashboard Page</h1>
      <button onClick={handleClick}>Logout</button>
    </div>
  );
}

export default Dashboard;

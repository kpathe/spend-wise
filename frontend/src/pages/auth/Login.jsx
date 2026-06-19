import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/auth.api";

function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = await loginUser(formData);
      console.log("Backend response", data);

      navigate("/dashboard");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Something went wrong";

      alert(errorMessage);
    }
  };

  return (
    <>
      <div>
        <h1>Login</h1>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email: </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              id=""
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              id=""
            />
          </div>

          <button type="submit">Submit</button>
        </form>
      </div>
    </>
  );
}

export default Login;

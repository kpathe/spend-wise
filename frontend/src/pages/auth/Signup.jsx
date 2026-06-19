import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../api/auth.api.js";

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
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
      const data = await registerUser(formData);
      console.log("Backend response", data);

      navigate("/login");
      
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Something went wrong";

      alert(errorMessage);
    }
  };

  return (
    <>
      <div>
        <h1>Signup</h1>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="name">Name : </label>
            <input
              type="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              id=""
              required
            />
          </div>

          <div>
            <label htmlFor="username">Username : </label>
            <input
              type="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              id=""
              required
            />
          </div>

          <div>
            <label htmlFor="email">Email : </label>
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
            <label htmlFor="password">Password : </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              id=""
              required
            />
          </div>

          <button type="submit">Submit</button>
        </form>
      </div>
    </>
  );
}

export default Signup;

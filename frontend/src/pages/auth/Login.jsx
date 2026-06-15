import React from "react";

function Login() {
  return (
    <div>
      <form action="">
        <label htmlFor="email">Email : </label>
        <input type="email" name="email" id="" />

        <label htmlFor="password">Password :</label>
        <input type="password" name="password" />

        <button type="submit">Log In</button>
      </form>
    </div>
  );
}

export default Login;

import React from "react";

function Signup() {
  return (
    <div>
      <form action="">
        <label htmlFor="email">Email : </label>
        <input type="email" name="email" id="" />

        <label htmlFor="username">Username : </label>
        <input type="username" name="username" id="" />

        <label htmlFor="password">Password :</label>
        <input type="password" name="password" />

        <button type="submit">Signup</button>
      </form>
    </div>
  );
}

export default Signup;

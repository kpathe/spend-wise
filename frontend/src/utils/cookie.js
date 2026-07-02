/**
 * Helper to get a cookie value by name.
 * @param {string} name - Name of the cookie.
 * @returns {string|null} - Cookie value or null if not found.
 */
export const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift());
  return null;
};

/**
 * Helper to delete a cookie by name.
 * @param {string} name - Name of the cookie.
 */
export const deleteCookie = (name) => {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`;
  // Also clear with Secure if we are on HTTPS
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=None; Secure`;
};

export const clearAuthState = () => {
  deleteCookie("userLoggedIn");
  deleteCookie("spendwiseUserName");
};

export const isAuthenticated = () => {
  return getCookie("userLoggedIn") === "true";
};

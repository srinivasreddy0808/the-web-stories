import { useState, useEffect } from "react";
import { UserContext } from "./userContext";
import PropTypes from "prop-types";
import { jwtDecode } from "jwt-decode";
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if there's a token in localStorage on initial load
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUser({ token, userId: decodedToken.id });
      } catch (error) {
        localStorage.removeItem("token"); // Remove invalid token
      }
      // You might want to decode the token to get user info
    }
  }, []);

  const login = (token) => {
    localStorage.setItem("token", token);
    try {
      const decodedToken = jwtDecode(token);
      setUser({ token, userId: decodedToken.id });
    } catch (error) {
      localStorage.removeItem("token"); // Remove invalid token
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Define prop types for UserProvider
UserProvider.propTypes = {
  children: PropTypes.node.isRequired, // Ensures 'children' prop is passed and is of the correct type
};

export default UserProvider;

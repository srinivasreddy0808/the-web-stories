import { useState } from "react";
import Modal from "./Modal";
import InputField from "./InputField";
import styles from "./Modal.module.css";
import { useUser } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/Toastify";

const LoginModal = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useUser();
  const navigate = useNavigate();
  const onClose = () => navigate("/");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    console.log(error);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName: username, password }),
        }
      );

      if (response.ok) {
        const { token } = await response.json();
        login(token);
        onClose();
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  if (error) {
    showToast("error", error);
  }

  return (
    <Modal onClose={onClose} title="Login">
      <form onSubmit={handleLogin} className={styles.form}>
        <InputField
          label="Username"
          type="text"
          placeholder="Enter username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <InputField
          label="Password"
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className={styles.submitButton}>
          Login
        </button>
      </form>
    </Modal>
  );
};

export default LoginModal;

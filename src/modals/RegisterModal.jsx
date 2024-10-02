import { useState } from "react";
import Modal from "./Modal";
import InputField from "./InputField";
import styles from "./Modal.module.css";
import { useNavigate } from "react-router-dom";
import { showToast } from "../components/Toastify";

const RegisterModal = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const onClose = () => navigate("/");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/users/signup`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userName: username, password }),
        }
      );

      if (response.ok) {
        await response.json();
        showToast("Registration successful");
        onClose();
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  if (error) {
    showToast(error);
  }

  return (
    <Modal onClose={onClose} title="Register">
      <form onSubmit={handleRegister} className={styles.form}>
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
          Register
        </button>
      </form>
    </Modal>
  );
};

export default RegisterModal;

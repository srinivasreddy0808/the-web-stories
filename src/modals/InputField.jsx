import { useState } from "react";
import styles from "./Modal.module.css";
import PropTypes from "prop-types";

const InputField = ({ label, type, placeholder, value, onChange }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.inputField}>
      <label className={styles.inputLabel}>{label}</label>
      <div className={styles.inputWrapper}>
        <input
          type={type === "password" && showPassword ? "text" : type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className={styles.input}
        />
        {type === "password" && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={styles.passwordToggle}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        )}
      </div>
    </div>
  );
};

InputField.propTypes = {
  label: PropTypes.string.isRequired, // Label is required and must be a string
  type: PropTypes.oneOf(["text", "password", "email"]).isRequired, // Type must be one of these strings
  placeholder: PropTypes.string, // Optional string for placeholder
  value: PropTypes.string.isRequired, // Value is required and must be a string
  onChange: PropTypes.func.isRequired, // onChange is required and must be a function
};
export default InputField;

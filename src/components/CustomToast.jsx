import { CheckCircle } from "lucide-react";
import PropTypes from "prop-types";

const CustomToast = ({ message }) => (
  <div style={{ display: "flex", alignItems: "center" }}>
    <CheckCircle color="#b91010" size={24} style={{ marginRight: "12px" }} />
    <span style={{ color: "#1F2937", fontWeight: 500 }}>{message}</span>
  </div>
);

CustomToast.propTypes = {
  message: PropTypes.string.isRequired,
};

export default CustomToast;

import { toast } from "react-toastify";
import CustomToast from "./CustomToast";

// Function to show the toast
export const showToast = (message) => {
  toast(<CustomToast message={message} />, {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    style: {
      background: "#FFFFFF",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      borderRadius: "8px",
      padding: "12px 16px",
      minWidth: "200px",
    },
  });
};

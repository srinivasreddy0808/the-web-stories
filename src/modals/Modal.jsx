import { XCircle } from "lucide-react";
import styles from "./Modal.module.css";
import PropTypes from "prop-types";

const Modal = ({ onClose, title, children }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.modalXContainer}>
            <button onClick={onClose} className={styles.closeButton}>
              <XCircle size={38} color="red" />
            </button>
          </div>
          <h2 className={title ? styles.modalTitle : styles.noTitle}>
            {title || ""}
          </h2>
        </div>
        {children}
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node,
};

export default Modal;

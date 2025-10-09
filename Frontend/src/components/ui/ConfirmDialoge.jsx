import styles from "../../styles/ConfirmDialog/ConfirmDialog.module.css";
import Button from "./Button";

const ConfirmDialog = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.dialog}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <Button className={styles.confirmBtn} onClick={onConfirm}>
            Confirm
          </Button>
          <Button className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

import styles from "../../styles/UserManagementButton/UserManagementButton.module.css";

const UserManagementButton = ({ userEmail, userRole, onOpenModal }) => {
  if (userRole !== "admin") {
    return null;
  }

  return (
    <button
      className={styles.managementButton}
      onClick={onOpenModal}
    >
      <i className={`fas fa-users-cog ${styles.icon}`}></i>
      Manage Users
    </button>
  );
};

export default UserManagementButton;
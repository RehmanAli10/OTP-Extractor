import styles from "../../styles/SuccessScreen/Success.module.css"

const SuccessScreen = ({ onRestart }) => {
  return (
    <div id="success-screen" className={`${styles.authCard} ${styles.active}`}>
      <div className={styles.cardHeader}>
        <div className={`${styles.securityIcon}${styles.success}`}>
          <i className="fas fa-check-circle"></i>
        </div>
        <h2>Login Successful</h2>
        <p>You have been successfully authenticated</p>
      </div>

      <div className={styles.successContent}>
        <div className={styles.welcomeMessage}>
          <h3>Welcome back!</h3>
          <p>You can now access your secure dashboard</p>
        </div>

        <button className={styles.primaryBtn} onClick={onRestart}>
          <i className="fas fa-home"></i>
          Go to Dashboard
        </button>
      </div>
    </div>
  )
}

export default SuccessScreen
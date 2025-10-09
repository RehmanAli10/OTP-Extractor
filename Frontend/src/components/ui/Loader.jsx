import styles from "../../styles/Loading/Loading.module.css";

const Loader = ({ isLoading, children, overlay = true, size = "medium" }) => {
  if (!isLoading) return children;

  return (
    <div className={styles.loaderContainer}>
      {overlay && <div className={styles.overlay} />}
      <div className={styles.content}>
        {children}
      </div>
      <div className={`${styles.spinner} ${styles[size]}`}>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
        <div className={styles.spinnerRing}></div>
      </div>
    </div>
  );
};

export default Loader;
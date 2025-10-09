import { useState } from "react";
import Loader from "../ui/Loader";
import OtpInput from "../ui/OtpInput";
import styles from "../../styles/ForgotPassOTP/PassOTp.module.css";
import Button from "../ui/Button";

const ForgotPasswordOtpScreen = ({ onVerifyOTP, onBack, showToast }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (code) => {
    setIsLoading(true);
    try {
      await onVerifyOTP(code);
    } catch (error) {
      showToast("Verification failed. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="forgot-password-otp-screen"
      className={`${styles.authCard}${styles.active}`}
    >
      <div className={styles.cardHeader}>
        <Button className={styles.backBtn} onClick={onBack}>
          <i className="fas fa-arrow-left"></i>
          Back
        </Button>

        <div className={styles.securityIcon}>
          <i className="fas fa-shield-alt"></i>
        </div>
        <h2>Verify Reset Code</h2>
        <p>Enter the 6-digit code sent to your email</p>
      </div>

      <Loader isLoading={isLoading}>
        <form className={styles.authForm} onSubmit={(e) => e.preventDefault()}>
          <OtpInput onComplete={handleSubmit} />

          <Button
            type="submit"
            className={styles.primaryBtn}
            isLoading={isLoading}
          >
            <i className="fas fa-check"></i>
            Verify Code
          </Button>

          <div className={styles.formFooter}>
            <p>
              Didn't receive code?
              <a
                href="#"
                onClick={() =>
                  showToast("Reset code resent successfully!", "success")
                }
              >
                Resend
              </a>
            </p>
          </div>
        </form>
      </Loader>
    </div>
  );
};

export default ForgotPasswordOtpScreen;

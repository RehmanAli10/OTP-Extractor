import { useState, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import Loader from "../ui/Loader";
import OtpInput from "../ui/OtpInput";
import { API_ENDPOINTS, apiRequest } from "../../config/api";
import styles from "../../styles/TOTPVerification/TOTP.module.css";
import Button from "../ui/Button";

const TotpVerificationScreen = ({ userEmail, onVerify, onBack }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationAttempted, setVerificationAttempted] = useState(false);
  const otpInputRef = useRef();

  const handleSubmit = useCallback(
    async (code) => {
      if (verificationAttempted || isLoading) return;

      if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
        toast.error("Please enter a valid 6-digit code");
        return;
      }

      setIsLoading(true);
      setVerificationAttempted(true);

      try {
        await apiRequest(API_ENDPOINTS.VERIFY_OTP, {
          method: "POST",
          body: JSON.stringify({ email: userEmail, token: code }),
        });

        toast.success("TOTP verified successfully!");
        onVerify(code);
      } catch (error) {
        toast.error(error.message || "Verification failed. Please try again.");
        setVerificationAttempted(false);

        if (otpInputRef.current) {
          otpInputRef.current.clearInputs();
        }
      } finally {
        setIsLoading(false);
      }
    },
    [userEmail, onVerify, verificationAttempted, isLoading]
  );

  return (
    <div
      id="totp-verification-screen"
      className={`${styles.authCard} ${styles.active}`}
    >
      <div className={styles.cardHeader}>
        <Button type="button" className={styles.backBtn} onClick={onBack}>
          <i className="fas fa-arrow-left"></i>
          Back to Login
        </Button>

        <div className={styles.securityIcon}>
          <i className="fas fa-shield-alt"></i>
        </div>
        <h2>Two-Factor Verification</h2>
        <p>Enter the 6-digit code from your authenticator app</p>
      </div>

      <Loader isLoading={isLoading}>
        <div className={styles.authForm}>
          <OtpInput onComplete={handleSubmit} ref={otpInputRef} length={6} />
        </div>
      </Loader>
    </div>
  );
};

export default TotpVerificationScreen;

import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Loader from "../ui/Loader";
import styles from "../../styles/GHLForm/GHLForm.module.css";
import Button from "../ui/Button";
import FormInputField from "../ui/FormInputField";
import UserManagementModal from "../modals/UserManagementModal";
import UserManagementButton from "../ui/UserManagementButton";

const GhlEmailScreen = ({
  onRequestOTP,
  otp,
  onCopyOTP,
  userEmail,
  userRole,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);
  const methods = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      await onRequestOTP(data.email);
      methods.reset();
    } catch (error) {
      toast.error(error.message || "Failed to fetch OTP");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.screenContainer}>
      {userRole === "admin" && (
        <UserManagementButton
          userEmail={userEmail}
          userRole={userRole}
          onOpenModal={() => setIsUserManagementOpen(true)}
        />
      )}

      <div
        id="ghl-email-screen"
        className={`${styles.authCard} ${styles.active}`}
      >
        <div className={styles.cardHeader}>
          <div className={styles.securityIcon}>
            <i className="fas fa-lock"></i>
          </div>
          <h2>Secure OTP Verification</h2>
          <p>Enter your GHL email to fetch OTP from your inbox</p>
        </div>

        <Loader isLoading={isLoading}>
          <FormProvider {...methods}>
            <form
              className={styles.authForm}
              onSubmit={methods.handleSubmit(onSubmit)}
            >
              <FormInputField
                label={"Email Address"}
                icon="fas fa-envelope"
                name={"email"}
                id={"ghl-email"}
                placeholder="Enter GHL email (without @etc.com)"
                rules={{
                  required: "Email without @example.com required",
                  pattern: {
                    value: /^[a-zA-Z0-9+._-]+(@gmail\.com)?$/,
                    message: "Enter without @example.com",
                  },
                }}
              />

              {otp && (
                <div className={styles.otpSection}>
                  <div className={styles.otpDisplay}>
                    <span>
                      Your OTP: <strong>{otp}</strong>
                    </span>
                    <Button
                      type={"button"}
                      className={styles.copyBtn}
                      onClick={onCopyOTP}
                    >
                      <i className="fas fa-copy"></i> Copy
                    </Button>
                  </div>
                </div>
              )}

              <Button
                type="submit"
                className={styles.primaryBtn}
                disabled={isLoading}
              >
                <i className="fas fa-key"></i>
                {otp ? "Fetch New OTP" : "Get OTP from Email"}
              </Button>

              <div className={styles.formFooter}>
                <div className={styles.termsNotice}>
                  This will search your Gmail for the latest OTP email
                </div>
              </div>
            </form>
          </FormProvider>
        </Loader>
      </div>

      {isUserManagementOpen && (
        <UserManagementModal
          adminEmail={userEmail}
          onClose={() => setIsUserManagementOpen(false)}
        />
      )}
    </div>
  );
};

export default GhlEmailScreen;

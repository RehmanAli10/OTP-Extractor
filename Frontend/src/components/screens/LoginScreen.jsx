import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Loader from "../ui/Loader";
import { API_ENDPOINTS, apiRequest } from "../../config/api";
import styles from "../../styles/LoginForm/Login.module.css";
import Button from "../ui/Button";
import FormInputField from "../ui/FormInputField";

const LoginScreen = ({ onLogin, onShowTOTP, onShowQR }) => {
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm();

  const handleAutoRegister = async (email, password) => {
    const response = await apiRequest(API_ENDPOINTS.REGISTER, {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        name: email.split("@")[0],
        role: "user",
      }),
    });
    return response;
  };

  const onSubmit = async ({ email, password }) => {
    if (!email || !password) return;
    setIsLoading(true);

    try {
      const response = await apiRequest(API_ENDPOINTS.LOGIN, {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const userRole = response.role || response.user?.role || "user";

      if (response.requiresOtp) {
        toast.success("Password valid. Please enter your TOTP code");
        onShowTOTP(email, response.requiresOtp, userRole);
      } else {
        toast.success("Login successful");
        onLogin(email, "", response.requiresOtp, userRole);
        onShowQR(email, response.qrCode, userRole);
      }
    } catch (error) {
      if (error.message === "User not found") {
        try {
          const registerResponse = await handleAutoRegister(email, password);
          const newuserRole = "user";
          toast.success("Account created! Please scan the QR code for 2FA");
          onShowQR(email, registerResponse.qrCode, newuserRole);
        } catch (registerError) {
          toast.error(registerError);
        }
      } else if (error.message === "Invalid email or password") {
        toast.error("Invalid email or password");
      }else {
        toast.error("Invalid request");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="login-screen" className={`${styles.authCard} ${styles.active}`}>
      <div className={styles.cardHeader}>
        <div className={styles.securityIcon}>
          <i className="fas fa-lock"></i>
        </div>
        <h2>Secure Login Portal</h2>
        <p>Sign in to access your dashboard</p>
      </div>

      <Loader isLoading={isLoading} className={styles.loading}>
        <FormProvider {...methods}>
          <form
            className={styles.authForm}
            onSubmit={methods.handleSubmit(onSubmit)}
          >
            <FormInputField
              name="email"
              label="Email Address"
              type="email"
              placeholder="user@example.com"
              icon="fas fa-envelope"
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Please enter a valid email address",
                },
              }}
            />

            <FormInputField
              name="password"
              label="Password"
              type="password"
              placeholder="•••••••••"
              icon="fas fa-lock"
              rules={{
                required: "Password is required",
                minLength: {
                  value: 9,
                  message: "Password must be at least 9 characters",
                },
              }}
            />

            <Button
              type="submit"
              className={styles.primaryBtn}
              disabled={isLoading}
            >
              <i className="fas fa-sign-in-alt"></i>
              Sign In / Register
            </Button>

            <div className={styles.formFooter}>
              <a
                href="#"
                className={styles.forgotLink}
                onClick={() => toast.info("Password reset not implemented yet")}
              >
                Forgot your password?
              </a>
              <div className={styles.securityNotice}>
                <i className="fas fa-shield-alt"></i>
                Protected by end-to-end encryption
              </div>
            </div>
          </form>
        </FormProvider>
      </Loader>
    </div>
  );
};

export default LoginScreen;

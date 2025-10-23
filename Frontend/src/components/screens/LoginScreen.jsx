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

  // const handleAutoRegister = async (email, password) => {
  //   const response = await apiRequest(API_ENDPOINTS.REGISTER, {
  //     method: "POST",
  //     body: JSON.stringify({
  //       email,
  //       password,
  //       name: email.split("@")[0],
  //       role: "user",
  //     }),
  //   });
  //   return response;
  // };

  // const onSubmit = async ({ email, password }) => {
  //   if (!email || !password) return;
  //   setIsLoading(true);

  //   try {
  //     const response = await apiRequest(API_ENDPOINTS.LOGIN, {
  //       method: "POST",
  //       body: JSON.stringify({ email, password }),
  //     });

  //     const userRole = response.role || "user";
  //     const requiresOtp = response.requiresOTP ?? response.requiresOtp ?? false;

  //     if (response.isAuthenticated && response.isRegistered && requiresOtp) {
  //       toast.success("Password valid. Please enter your OTP");
  //       onShowTOTP(email, requiresOtp, userRole);
  //     } else if (response.isAuthenticated && response.isRegistered) {
  //       toast.success("Login successful");
  //       onLogin(email, response.requiresOtp, userRole);
  //     } else if (response.message?.includes("User registered successfully")) {
  //       toast.success("Account created successfully! Please scan the QR code");
  //       if(response.qrCode){
  //         onShowQR(email,response.qrCode,userRole);
  //       }
  //     } else if (
  //       !response.isAuthenticated &&
  //       response.isRegistered&&
  //       response.message?.includes("account is no longer active")
  //     ) {
  //       toast.error("Your account is no longer active. Please contact support if this is a mistake.");
  //     } else if (
  //       !response.isAuthenticated &&
  //       response.isRegistered&&
  //       response.message === "Invalid password"
  //     ) {
  //       toast.error("Invalid password. Please try again");
  //     } else {
  //       toast.error(response.message || "Unexpected error");
  //     }
  //   } catch (error) {
  //     if (error.status === 400) {
  //       if (error.message === "Password must be 9 characters") {
  //         toast.error("Password must be exactly 9 characters long");
  //       } else {
  //         toast.error("Invalid request");
  //       }
  //     } else if (error.status === 401) {
  //       if (error.message === "Email and Password are required fields") {
  //         toast.error("Email and password are required");
  //       } else {
  //         toast.error("Authentication failed");
  //       }
  //     } else if (error.status === 404) {
  //       toast.error("User not found");
  //     } else if (error.status === 500) {
  //       toast.error("Server error. Please try again later");
  //     } else {
  //       toast.error(error.message || "An unexpected error occured");
  //     }
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };


  const onSubmit = async ({ email, password }) => {
  if (!email || !password) return;
  setIsLoading(true);

  try {
    const response = await apiRequest(API_ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const userRole = response.role || "user";
    const requiresOtp = response.requiresOtp ?? false;

    if (response.message?.includes("User registered successfully") && !response.isAuthenticated) {
      toast.success("Account created successfully! Please scan the QR code");
      onShowQR(email, response.qrCode, userRole);
    }
    else if (response.isAuthenticated && response.isRegistered && !requiresOtp && response.qrCode) {
      toast.success("Please scan the QR code to setup 2FA");
      onShowQR(email, response.qrCode, userRole);
    }
    else if (response.isAuthenticated && response.isRegistered && requiresOtp) {
      toast.success("Password valid. Please enter your OTP");
      onShowTOTP(email, requiresOtp, userRole);
    }
    else if (response.isAuthenticated && response.isRegistered && !requiresOtp) {
      toast.success("Login successful");
      onLogin(email, requiresOtp, userRole);
    }
    else if (!response.isAuthenticated && response.isRegistered && response.message?.includes("account is no longer active")) {
      toast.error("Your account is no longer active. Please contact support if this is a mistake.");
    }
    else if (!response.isAuthenticated && response.isRegistered && response.message === "Invalid password") {
      toast.error("Invalid password. Please try again");
    }
    else {
      toast.error(response.message || "Unexpected response");
    }

  } catch (error) {
    if (error.status === 400) {
      if (error.message === "Password must be 9 characters") {
        toast.error("Password must be exactly 9 characters long");
      } else {
        toast.error("Invalid request");
      }
    } else if (error.status === 401) {
      if (error.message === "Email and Password are required fields") {
        toast.error("Email and password are required");
      } else {
        toast.error("Authentication failed");
      }
    } else if (error.status === 404) {
      toast.error("User not found");
    } else if (error.status === 500) {
      toast.error("Server error. Please try again later");
    } else {
      toast.error(error.message || "An unexpected error occurred");
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

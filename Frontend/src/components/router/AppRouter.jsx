import { useState } from "react";
import toast from "react-hot-toast";
import LoginScreen from "../screens/LoginScreen";
import QrSetupScreen from "../screens/QrSetupScreen";
import TotpVerificationScreen from "../screens/TotpVerificationScreen";
import GhlEmailScreen from "../screens/GhlEmailScreen";
import { API_ENDPOINTS, apiRequest } from "../../config/api";

const AppRouter = () => {
  const [currentScreen, setCurrentScreen] = useState("login");
  const [userData, setUserData] = useState(null);
  const [currentEmail, setCurrentEmail] = useState("");
  const [qrCodeData, setQrCodeData] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  const showScreen = (screenName) => setCurrentScreen(screenName);

  const handleLogin = async (email, password, requiresOtp,role) => {
    if (!email) return;
    setCurrentEmail(email);
    setUserData({ email, password, role: role || "user" });
    setIsVerified(requiresOtp);
    showScreen("qrSetup");
  };

  const handleShowTOTP = (email, requiresOtp, role) => {
    setCurrentEmail(email);
    setUserData((prev) => ({ ...prev, role: role || "user" }));
    setIsVerified(requiresOtp);
    showScreen("qrSetup");
  };

  const handleShowQR = (email, qrCode,role) => {
    setCurrentEmail(email);
    setQrCodeData(qrCode);
    setUserData((prev) => ({ ...prev, role: role || "role" }));
    showScreen("qrSetup");
  };

  const handleTOTPVerification = async (code) => {
    try {
      toast.loading("Verifying TOTP code...");

      await apiRequest(API_ENDPOINTS.VERIFY_OTP, {
        method: "POST",
        body: JSON.stringify({
          email: currentEmail,
          token: code,
        }),
      });

      toast.dismiss();
      toast.success("TOTP verified successfully!");
      showScreen("ghlEmail");
    } catch (error) {
      toast.dismiss();
      toast.error(error.message || "TOTP verification failed");
    }
  };

  const handleGHLRequest = async (ghlEmail) => {
    toast.loading("Fetching OTP from your email...");

    try {
      const response = await apiRequest(API_ENDPOINTS.GHL_OTP, {
        method: "POST",
        body: JSON.stringify({ email: ghlEmail }),
      });

      toast.dismiss();
      if (response.success && response.otp) {
        setUserData((prev) => ({
          ...prev,
          ghlEmail,
          generatedOtp: response.otp,
        }));
        toast.success(`OTP fetched successfully: ${response.otp}`);
      } else {
        toast.error(response.message || "No OTP found in your email");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("Failed to fetch OTP from backend");
      console.error("Error fetching OTP:", error);
    }
  };

  const copyOTP = () => {
    const otpCode = userData?.generatedOtp || "";
    if (!otpCode) return;

    navigator.clipboard
      .writeText(otpCode)
      .then(() => {
        toast.success("OTP copied to clipboard!");
      })
      .catch(() => {
        const textArea = document.createElement("textarea");
        textArea.value = otpCode;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        toast.success("OTP copied to clipboard!");
      });
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case "login":
        return (
          <LoginScreen
            onLogin={handleLogin}
            onShowTOTP={handleShowTOTP}
            onShowQR={handleShowQR}
          />
        );
      case "qrSetup":
        return (
          <QrSetupScreen
            userEmail={currentEmail}
            qrCodeData={qrCodeData}
            onContinue={() => showScreen("totpVerification")}
            onVerify={handleTOTPVerification}
            isVerified={isVerified}
            onBack={() => {
              showScreen("login");
              setQrCodeData("");
            }}
          />
        );
      case "totpVerification":
        return (
          <TotpVerificationScreen
            userEmail={currentEmail}
            onVerify={handleTOTPVerification}
            onBack={() => showScreen("login")}
          />
        );
      case "ghlEmail":
        return (
          <GhlEmailScreen
            onRequestOTP={handleGHLRequest}
            otp={userData?.generatedOtp}
            onCopyOTP={copyOTP}
            userEmail={currentEmail}
            userRole={userData?.role || "user"}
          />
        );
      default:
        return (
          <LoginScreen
            onLogin={handleLogin}
            onShowTOTP={handleShowTOTP}
            onShowQR={handleShowQR}
          />
        );
    }
  };

  return renderScreen();
};

export default AppRouter;

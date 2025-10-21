const bcrypt = require("bcrypt");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
require("dotenv").config();

const EMAIL_ADMIN = process.env.ADMIN_EMAIL;

const logger = require("../utils/logger");
const {
  readUsers,
  writeUsers,
  invalidateUsersCache,
  getCacheDiagnostics,
} = require("../utils/userHelpers");
const { getClientIp } = require("../utils/helpers");

// REGISTER
// async function register(req, res) {
//   try {
//     const { email, password, name } = req.body;

//     if (!email || !password) {
//       logger.logRegister(email, "failure", "missing_credentials", {
//         ip: getClientIp(req),
//       });
//       return res.status(400).json({
//         message: "Email and password required",
//         isAuthenticated: false,
//       });
//     }

//     if (password.length < 9) {
//       logger.logRegister(email, "failure", "password_must_be_9_characters", {
//         ip: getClientIp(req),
//       });
//       return res.status(400).json({
//         message: "Password must be 9 characters",
//         isAuthenticated: false,
//       });
//     }

//     const users = readUsers();

//     // ISSUE HERE KINDLY CHECK, HERE WE CHECK USER BASE ON EMAIL IF
//     if (users.users[email]) {
//       logger.logRegister(email, "failure", "user_already_exists", {
//         ip: getClientIp(req),
//       });
//       return res.status(400).json({
//         message: "Failed to register user already exist, kindly signin!",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     const secret = speakeasy.generateSecret({ name: `OTP-App (${email})` });
//     const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);

//     // check if email is of admin then return admin otherwise user
//     const role = email === EMAIL_ADMIN ? "admin" : "user";

//     users.users[email] = {
//       id: email,
//       name: name || email,
//       password: hashedPassword,
//       secret: secret.base32,
//       qrCode: qrCodeDataUrl,
//       is_verified: false,
//       is_deleted: false,
//       role,
//     };

//     writeUsers(users);

//     logger.logRegister(email, "success", "new_user_created", {
//       ip: getClientIp(req),
//       has_2fa: true,
//     });

//     res.status(200).json({
//       message: "User registered successfully",
//       qrCode: qrCodeDataUrl,
//       email,
//       role,
//     });
//   } catch (err) {
//     invalidateUsersCache();

//     logger.logRegister(req.body.email, "error", "internal_server_error", {
//       ip: getClientIp(req),
//       error: err.message,
//     });

//     res
//       .status(500)
//       .json({ message: "Internal server error", error: err.message });
//   }
// }

// LOGIN
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(401).json({
        message: "Email and Password are required fields",
        isAuthenticated: false,
      });
    }

    if (password.length < 9) {
      logger.logLogin(email, "failure", "password_must_be_9_characters", {
        ip: getClientIp(req),
      });
      return res.status(400).json({
        message: "Password must be 9 characters",
        isAuthenticated: false,
      });
    }

    const users = readUsers();
    const user = users.users[email];

    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const secret = speakeasy.generateSecret({ name: `OTP-App (${email})` });
      const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);
      const role = email === EMAIL_ADMIN ? "admin" : "user";

      user = {
        id: email,
        name: name || email,
        password: hashedPassword,
        secret: secret.base32,
        qrCode: qrCodeDataUrl,
        is_verified: false,
        is_deleted: false,
        role,
      };

      users.users[email] = user;
      writeUsers(users);

      await logger.logLogin(email, "success", "auto_user_created", {
        ip: getClientIp(req),
      });

      return res.status(201).json({
        message: "User registered successfully",
        qrCode: qrCodeDataUrl,
        email,
        role,
        isAuthenticated: false,
        isRegistered: true,
      });
    }

    if (user.is_deleted) {
      await logger.logLogin(email, "failure", "User is deleted", {
        ip: getClientIp(req),
      });

      return res.status(404).json({
        message:
          "Your account is no longer active. Please reach out to our support team if you believe this is a mistake.",
        isAuthenticated: false,
        isRegistered: true,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await logger.logLogin(email, "failure", "invalid_password", {
        ip: getClientIp(req),
      });
      return res.status(404).json({
        message: "Invalid password",
        isAuthenticated: false,
        isRegistered: true,
      });
    }

    await logger.logLogin(email, "success", "password_valid", {
      ip: getClientIp(req),
      requires_otp: true,
    });

    res.json({
      message: "Password valid, enter OTP",
      requiresOtp: user.is_verified,
      qrCode: user.qrCode,
      role: user.role,
      isAuthenticated: true,
      isRegistered: true,
    });
  } catch (err) {
    await logger.logLogin(req.body.email, "error", "internal_server_error", {
      ip: getClientIp(req),
      error: err.message,
    });

    res.status(500).json({
      message: "Internal server error",
      error: err.message,
      isAuthenticated: false,
    });
  }
}

// VERIFY TOTP
async function verifyTotp(req, res) {
  try {
    const { email, token } = req.body;
    const users = readUsers();
    const user = users.users[email];

    if (!user) {
      logger.logVerifyTotp(email, "failure", "user_not_found", {
        ip: getClientIp(req),
        method: "totp",
      });
      return res.status(401).json({ message: "Invalid user" });
    }

    const isValid = speakeasy.totp.verify({
      secret: user.secret,
      encoding: "base32",
      token: token,
      window: 6,
      step: 30,
    });

    if (!isValid) {
      logger.logVerifyTotp(email, "failure", "invalid_or_expired_totp", {
        ip: getClientIp(req),
        method: "totp",
        provided_token: token,
      });

      return res.status(401).json({
        message:
          "Invalid or expired TOTP. Please make sure your device time is synchronized.",
      });
    }

    user.is_verified = true;
    writeUsers(users);

    logger.logVerifyTotp(email, "success", "otp_verified", {
      ip: getClientIp(req),
      method: "totp",
    });

    res.json({
      message: "Login successful ✅",
      user: {
        email,
        name: user.name,
      },
    });
  } catch (err) {
    invalidateUsersCache();
    logger.logVerifyTotp(req.body.email, "error", "internal_server_error", {
      ip: getClientIp(req),
      method: "totp",
      error: err.message,
    });

    res.status(500).json({
      message: "Server error during verification",
      error: err.message,
    });
  }
}

// CACHE DIAGNOSTICS (thin wrapper)
async function cacheDiagnostics(req, res) {
  try {
    const { action, iterations = 100 } = req.query;
    const result = getCacheDiagnostics(iterations, action);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  // register,
  login,
  verifyTotp,
  cacheDiagnostics,
};

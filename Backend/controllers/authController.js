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
async function register(req, res) {
  try {
    const ADMIN_EMAIL = "umar.vamatters@gmail.com";

    const { email, password, name } = req.body;

    if (!email || !password) {
      logger.logRegister(email, "failure", "missing_credentials", {
        ip: getClientIp(req),
      });
      return res.status(400).json({ message: "Email and password required" });
    }

    const users = readUsers();

    // ISSUE HERE KINDLY CHECK, HERE WE CHECK USER BASE ON EMAIL IF
    if (users.users[email]) {
      logger.logRegister(email, "failure", "user_already_exists", {
        ip: getClientIp(req),
      });
      return res.status(400).json({ message: "Invalid Password!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const secret = speakeasy.generateSecret({ name: `OTP-App (${email})` });
    const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);

    // If its admin create user with role admin other wise with role user
    if (email === EMAIL_ADMIN) {
      users.users[email] = {
        id: email,
        name: email,
        password: hashedPassword,
        secret: secret.base32,
        qrCode: qrCodeDataUrl,
        is_verified: false,
        role: "admin",
      };
    } else {
      users.users[email] = {
        id: email,
        name: email,
        password: hashedPassword,
        secret: secret.base32,
        qrCode: qrCodeDataUrl,
        is_verified: false,
        role: "user",
      };
    }

    writeUsers(users);

    logger.logRegister(email, "success", "new_user_created", {
      ip: getClientIp(req),
      has_2fa: true,
    });

    res.json({
      message: "User registered successfully",
      qrCode: qrCodeDataUrl,
      email,
      role,
    });
  } catch (err) {
    invalidateUsersCache();
    logger.logRegister(req.body.email, "error", "internal_server_error", {
      ip: getClientIp(req),
      error: err.message,
    });

    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
}

// LOGIN
async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(401)
        .json({ message: "Email and Paswword are required fields" });
    }
    const users = readUsers();
    const user = users.users[email];

    if (!user) {
      await logger.logLogin(email, "failure", "user_not_found", {
        ip: getClientIp(req),
      });
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // const role = users.user[role];

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await logger.logLogin(email, "failure", "invalid_password", {
        ip: getClientIp(req),
      });
      return res.status(401).json({ message: "Invalid email or password" });
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
    });
  } catch (err) {
    await logger.logLogin(req.body.email, "error", "internal_server_error", {
      ip: getClientIp(req),
      error: err.message,
    });

    res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
}

// VERIFY TOTP
async function verifyTotp(req, res) {
  try {
    const { email, token } = req.body;
    const users = readUsers();
    const user = users.users[email];

    console.log("user in verifyTotp", user);

    if (!user) {
      console.log("if block working");
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
  register,
  login,
  verifyTotp,
  cacheDiagnostics,
};

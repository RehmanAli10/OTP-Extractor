const { readUsers, writeUsers, userExists } = require("../utils/userHelpers");
const bcrypt = require("bcrypt");
const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const logger = require("../utils/logger");
const { getClientIp } = require("../utils/helpers");

exports.getAllUserController = async (req, res) => {
  try {
    // read users
    const users = readUsers();

    // if users not found
    if (!users || !users.users || Object.keys(users.users).length === 0) {
      logger.logGetUsers("", "failed", "no users found", {
        ip: getClientIp(req),
      });
      return res.status(404).json({ message: "No users found" });
    }

    logger.logGetUsers("", "success", "get all users", {
      ip: getClientIp(req),
      count: Object.keys(users.users).length,
    });

    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      users: users.users,
    });
  } catch (err) {
    await logger.logGetUsers("", "error", "internal_server_error", {
      ip: getClientIp(req),
      error: err.message,
    });

    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

exports.createUserController = async (req, res) => {
  try {
    const { email, password, role, name } = req.body;

    if (!email || !password || !role) {
      logger.logCreateUser(email, "failure", "missing_credentials", {
        ip: getClientIp(req),
      });

      return res
        .status(400)
        .json({ message: "Email, Password and Role fields are required" });
    }

    if (password.length !== 9) {
      logger.logCreateUser(
        email,
        "failure",
        "password_must_be_9_characters_long",
        {
          ip: getClientIp(req),
        }
      );

      return res
        .status(400)
        .json({ message: "Password must be 9 characters long" });
    }

    // validate roles
    const validRoles = ["admin", "user"];
    if (!validRoles.includes(role)) {
      logger.logCreateUser(email, "failure", "invalid_role");
      return res.status(400).json({ message: "Invalid role provided!" });
    }

    // read users
    const users = readUsers();

    // check if user with same email exist
    if (users.users[email]) {
      logger.logCreateUser(email, "failure", "user_already_exists", {
        ip: getClientIp(req),
      });
      return res.status(409).json({ message: "User Already Exist!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const secret = speakeasy.generateSecret({ name: `OTP-App (${email})` });
    const qrCodeDataUrl = await qrcode.toDataURL(secret.otpauth_url);

    // if not create new user
    users.users[email] = {
      id: email,
      name: name || email,
      password: hashedPassword,
      secret: secret.base32,
      qrCode: qrCodeDataUrl,
      is_verified: false,
      role: role,
      is_deleted: false,
    };

    writeUsers(users);
    logger.logCreateUser(email, "success", "new_user_created", {
      ip: getClientIp(req),
      has_2fa: true,
    });

    res.json({
      message: "User created successfully",
      qrCode: qrCodeDataUrl,
      email,
      role,
    });
  } catch (err) {
    await logger.logCreateUser(
      req.body.email,
      "error",
      "internal_server_error",
      {
        ip: getClientIp(req),
        error: err.message,
      }
    );

    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

exports.updateUserController = async (req, res) => {
  try {
    const { email } = req.params;
    const { password, role } = req.body;

    if (!email) {
      logger.logUpdateUser(email, "failure", "missing_required_params", {
        ip: getClientIp(req),
      });
      return res.status(400).json({ message: "Required param is missing!" });
    }

    // check if user exist on base of email
    const users = readUsers();

    // get specific user
    const user = users.users[email];

    // if user deosnt exist
    if (!user) {
      logger.logUpdateUser(email, "failure", "user_not_found", {
        ip: getClientIp(req),
      });
      return res.status(404).json({ message: "User not found" });
    }

    // if user exist check what if password is chnaged
    if (password) {
      const isSame = await bcrypt.compare(password, user.password);
      if (!isSame) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
      }
    }

    // check if role changed
    if (role && user.role !== role) {
      user.role = role;
    }

    users.users[email] = user;

    writeUsers(users);

    logger.logUpdateUser(email, "success", "new_user_created", {
      ip: getClientIp(req),
      has_2fa: true,
    });

    return res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    logger.logUpdateUser(req.params?.email, "error", "internal_server_error", {
      ip: getClientIp(req),
      error: err.message,
    });

    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

exports.deleteUserController = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      logger.logDeleteUser(email, "failure", "missing_required_params", {
        ip: getClientIp(req),
      });
      return res.status(400).json({ message: "Missing required param" });
    }

    // check if user exist that needs to be deleted
    const users = readUsers();
    const user = users.users[email];

    if (!user) {
      logger.logDeleteUser(email, "failure", "user_not_found", {
        ip: getClientIp(req),
      });
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (user.is_deleted) {
      logger.logDeleteUser(email, "failure", "user_already_removed", {
        ip: getClientIp(req),
      });
      return res.status(400).json({ message: "User is already removed" });
    }

    user.is_deleted = true;
    users.users[email] = user;

    const newObj = { ...users, user };

    writeUsers(newObj);

    logger.logDeleteUser(email, "success", "user_deleted_successfully", {
      ip: getClientIp(req),
    });

    return res.status(200).json({
      message: "User deleted successfully",
      is_deleted: user.is_deleted,
    });
  } catch (err) {
    logger.logDeleteUser(req.params?.email, "error", "internal_server_error", {
      ip: getClientIp(req),
      error: err.message,
    });

    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

exports.resetUserController = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      logger.logResetUser(email, "failure", "missing_required_params", {
        ip: getClientIp(req),
      });
      return res.status(400).json({ message: "Missing required param" });
    }

    const users = readUsers();

    const user = users.users[email];

    if (!user) {
      logger.logResetUser(email, "failure", "user_not_found", {
        ip: getClientIp(req),
      });
      return res.status(404).json({ message: "User not found " });
    }

    // generate new secret
    const newSecret = speakeasy.generateSecret({ name: `OTP-App (${email})` });
    const qrCodeDataUrl = await qrcode.toDataURL(newSecret.otpauth_url);

    user.qrCode = qrCodeDataUrl;
    user.secret = newSecret.base32;
    user.is_verified = false;

    users.users[email] = user;

    writeUsers(users);

    logger.logResetUser(email, "success", "user_reset", {
      ip: getClientIp(req),
    });

    return res.status(200).json({
      message:
        "User OTP has been reset. User must reconfigure authenticator on next login.",
    });
  } catch (err) {
    logger.logResetUser(req.params?.email, "error", "internal_server_error", {
      ip: getClientIp(req),
      error: err.message,
    });

    return res
      .status(500)
      .json({ message: "Internal server error", error: err.message });
  }
};

import crypto from "crypto";
import { validationResult } from "express-validator";
import User from "../models/User.js";
import { generateToken, generateOTP, addMinutes } from "../utils/tokenUtils.js";
import { sendOtpEmail, sendPasswordResetEmail } from "../utils/emailService.js";

export const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Email already registered" });
    }

    user = new User({ name, email, password, phone });
    const otp = generateOTP();
    user.otpCode = otp;
    user.otpExpiresAt = addMinutes(new Date(), 10);
    await user.save();

    // Fire-and-forget email so slow/failed SMTP doesn't block signup
    sendOtpEmail(user, otp).catch((emailErr) => {
      // eslint-disable-next-line no-console
      console.error("Failed to send OTP email:", emailErr.message || emailErr);
    });

    res.status(201).json({
      message:
        "Registered successfully. If email is configured, an OTP was sent to your inbox.",
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (!user.otpCode || !user.otpExpiresAt) {
      return res.status(400).json({ message: "OTP not requested" });
    }
    if (user.otpCode !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (user.otpExpiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }
    user.isVerified = true;
    user.otpCode = undefined;
    user.otpExpiresAt = undefined;
    await user.save();

    const token = generateToken(user._id);
    res.json({
      message: "Account verified successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(200)
        .json({ message: "If that email exists, a reset link was sent." });
    }

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpiresAt = addMinutes(new Date(), 30);
    await user.save();

    // Fire-and-forget password reset email to avoid blocking on SMTP
    sendPasswordResetEmail(user, token).catch((emailErr) => {
      // eslint-disable-next-line no-console
      console.error(
        "Failed to send password reset email:",
        emailErr.message || emailErr
      );
    });

    res.json({
      message: "If that email exists, a reset link was sent.",
    });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiresAt: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (err) {
    next(err);
  }
};


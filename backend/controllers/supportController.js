import { sendSupportMessageEmail } from "../utils/supportEmail.js";

export const createSupportRequest = async (req, res, next) => {
  try {
    const { email, message } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message is required" });
    }

    const safeEmail = (email || "").trim();

    await sendSupportMessageEmail({
      email: safeEmail || null,
      message: message.trim(),
      user: req.user || null,
    });

    res.status(201).json({ message: "Support request submitted" });
  } catch (err) {
    next(err);
  }
};


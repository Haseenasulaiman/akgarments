import { validationResult } from "express-validator";
import User from "../models/User.js";

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, phone } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (name) user.name = name;
    if (phone) user.phone = phone;
    await user.save();

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      addresses: user.addresses,
    });
  } catch (err) {
    next(err);
  }
};

export const upsertAddress = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      id,
      label,
      line1,
      line2,
      city,
      state,
      pincode,
      landmark,
      isDefault,
    } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    let targetAddress = null;

    if (id) {
      const addr = user.addresses.id(id);
      if (!addr) return res.status(404).json({ message: "Address not found" });
      addr.label = label ?? addr.label;
      addr.line1 = line1 ?? addr.line1;
      addr.line2 = line2 ?? addr.line2;
      addr.city = city ?? addr.city;
      addr.state = state ?? addr.state;
      addr.pincode = pincode ?? addr.pincode;
      addr.landmark = landmark ?? addr.landmark;
      if (typeof isDefault === "boolean") addr.isDefault = isDefault;
      targetAddress = addr;
    } else {
      user.addresses.push({
        label,
        line1,
        line2,
        city,
        state,
        pincode,
        landmark,
        isDefault: !!isDefault,
      });
      targetAddress = user.addresses[user.addresses.length - 1];
    }

    if (isDefault && targetAddress) {
      user.addresses.forEach((addr) => {
        addr.isDefault =
          addr._id && targetAddress._id
            ? addr._id.equals(targetAddress._id)
            : addr === targetAddress;
      });
    }

    await user.save();
    res.json(user.addresses);
  } catch (err) {
    next(err);
  }
};

export const deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const addr = user.addresses.id(addressId);
    if (!addr) return res.status(404).json({ message: "Address not found" });

    addr.deleteOne();
    await user.save();
    res.json(user.addresses);
  } catch (err) {
    next(err);
  }
};


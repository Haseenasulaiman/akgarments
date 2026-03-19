import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

export const addMinutes = (date, minutes) =>
  new Date(date.getTime() + minutes * 60000);


import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const main = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  const email = "admin@akgarments.com";
  const password = "Admin@123";

  let admin = await User.findOne({ email });

  if (!admin) {
    admin = new User({
      name: "AK GARMENTS Admin",
      email,
      password,
      phone: "9999999999",
      role: "admin",
      isVerified: true,
    });
    await admin.save();
    // eslint-disable-next-line no-console
    console.log("Admin user created:", email);
  } else {
    admin.role = "admin";
    admin.isVerified = true;
    await admin.save();
    // eslint-disable-next-line no-console
    console.log("Existing user promoted to admin:", email);
  }

  await mongoose.disconnect();
};

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


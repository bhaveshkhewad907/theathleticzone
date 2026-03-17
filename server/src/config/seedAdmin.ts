import bcrypt from "bcrypt";
import User from "../modules/user/user.model";

const seedAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME;

  if (!adminEmail || !adminPassword || !adminName) {
    throw new Error("Admin environment variables not set");
  }

  const existingAdmin = await User.findOne({
    email: adminEmail,
    role: "ADMIN",
  });

  if (existingAdmin) {
    console.log("👑 Admin already exists");

    // 1. 👇 Force verify the existing admin if they are locked out
    if (!existingAdmin.isVerified) {
      existingAdmin.isVerified = true;
      await existingAdmin.save();
      console.log("✅ Admin forcefully verified for login.");
    }
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 12);

  await User.create({
    name: adminName,
    email: adminEmail,
    password: hashedPassword,
    role: "ADMIN",
    provider: "LOCAL",
    // 2. 👇 Ensure any newly seeded admins are verified
    isVerified: true,
  });

  console.log("👑 Admin seeded successfully & verified");
};

export default seedAdmin;

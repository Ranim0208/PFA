import mongoose from "mongoose";
import User from "./models/User.js";
import dotenv from "dotenv";
dotenv.config();

const rolesToSeed = [
  "admin",
  "mentor",
  "projectHolder",
  "IncubationCoordinator",
  "ComponentCoordinator",
  "RegionalCoordinator",
];

const createUsers = async () => {
  for (let role of rolesToSeed) {
    // On génère un email unique pour chaque rôle
    const email = `tacir_${role.toLowerCase()}@yopmail.com`;

    const userExists = await User.findOne({ email });

    if (!userExists) {
      const user = new User({
        firstName: `Tacir`,
        lastName: role,
        email,
        password: "Password123*/", // ⚠️ penser à hasher si pas fait dans le model
        roles: [role],
        isConfirmed: true,
      });

      await user.save();
      console.log(`✅ ${role} account created!`);
    } else {
      console.log(`⚠️ ${role} already exists.`);
    }
  }
};

// Connect to MongoDB and run the seeding process
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URI);
    console.log("MongoDB connected");

    await createUsers();

    await mongoose.disconnect();
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
};

connectDB();

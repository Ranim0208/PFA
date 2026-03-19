// controllers/userController.js
import User from "../models/User.js";
import RegionalCoordinator from "../models/RegionalCoordinator.js";
import ComponentCoordinator from "../models/ComponentCoordinator.js";
import mongoose from "mongoose";

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Only select necessary fields
    const user = await User.findById(id).select("firstName lastName email");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
    });
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    // console.log("Fetching current user...", req.user._id);
    // User ID comes from auth middleware that verifies the JWT
    const user = await User.findById(req.user._id).select(
      "firstName lastName email roles"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Prepare user response
    const userInfo = {
      id: user._id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      roles: user.roles,
    };

    // If user is a RegionalCoordinator, attach region info
    if (user.roles.includes("RegionalCoordinator")) {
      const coordinator = await RegionalCoordinator.findOne({
        user: new mongoose.Types.ObjectId(user._id),
      }).populate("region");

      if (coordinator && coordinator.region) {
        userInfo.region = {
          id: coordinator.region._id.toString(),
          name: coordinator.region.name,
        };
      }
    }

    // If user is a ComponentCoordinator, attach component info
    if (user.roles.includes("ComponentCoordinator")) {
      const coordinator = await ComponentCoordinator.findOne({
        user: new mongoose.Types.ObjectId(user._id),
      });

      if (coordinator && coordinator.component) {
        userInfo.component = {
          composant: coordinator.component,
        };
      }
    }

    res.status(200).json({
      success: true,
      user: userInfo,
    });
  } catch (error) {
    console.error("Error fetching current user:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
export const getIncubationCoordinators = async (req, res) => {
  try {
    const coordinators = await User.find({
      roles: "IncubationCoordinator",
      isArchived: false,
    }).select("firstName lastName email");

    res.status(200).json(coordinators);
  } catch (error) {
    console.error("Error fetching incubation coordinators:", error);
    res.status(500).json({ message: "Server error" });
  }
};

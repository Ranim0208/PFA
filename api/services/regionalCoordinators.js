// services/regionalCoordinators.js
import RegionalCoordinator from "../models/RegionalCoordinator.js";

export const getRegionalCoordinators = async () => {
  return RegionalCoordinator.find().populate("user").populate("region");
};

export const getRegionalCoordinatorByUserId = async (userId) => {
  return RegionalCoordinator.findOne({ user: userId }).populate("region");
};

export const getRegionalCoordinatorByRegionId = async (regionId) => {
  return RegionalCoordinator.findOne({ region: regionId }).populate("user");
};

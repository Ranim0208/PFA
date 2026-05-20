// middleware/verifyRegion.js
import RegionalCoordinator from "../models/RegionalCoordinator.js";
export const verifyRegion = async (req, res, next) => {
  const { user } = req;
  if (user.roles.includes("RegionalCoordinator")) {
    const coordinator = await RegionalCoordinator.findOne({
      user: user.id,
    }).populate("region");
    if (!coordinator)
      return res.status(403).json({ message: "No region access" });
    req.user.region = coordinator.region._id;
  }
  next();
};

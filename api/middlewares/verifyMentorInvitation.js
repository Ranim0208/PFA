import Mentor from "../models/Mentor.js";
import { verifyInvitationToken } from "../utils/generateTokens.js";
export const verifyMentorInvitation = async (req, res, next) => {
  try {
    const token = req.query.token || req.body.token;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = verifyInvitationToken(token);
    if (!decoded) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const mentor = await Mentor.findOne({
      user: decoded.userId,
      creathon: decoded.creathonId,
      invitationToken: token,
      status: "invited",
    });

    if (!mentor) {
      return res.status(401).json({ message: "Invalid mentor invitation" });
    }

    // Check if token is expired
    if (mentor.tokenExpires && new Date() > new Date(mentor.tokenExpires)) {
      return res.status(401).json({ message: "Invitation token has expired" });
    }

    req.mentor = mentor;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

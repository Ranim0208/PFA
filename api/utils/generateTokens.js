import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const { sign } = jwt;
const INVITATION_TOKEN_SECRET = process.env.INVITATION_TOKEN_SECRET;
const INVITATION_TOKEN_EXPIRY = "7d"; // 7 days
const generateAccessToken = (user) => {
  const accessToken = sign(
    { userId: user._id, email: user.email, roles: user.roles },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRATION }
  );

  return accessToken;
};

const generateRefreshToken = (user) => {
  const refreshToken = sign(
    { userId: user._id, email: user.email },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRATION }
  );

  return refreshToken;
};
const generateInvitationToken = (userId, creathonId) => {
  return jwt.sign({ userId, creathonId }, INVITATION_TOKEN_SECRET, {
    expiresIn: INVITATION_TOKEN_EXPIRY,
  });
};
const verifyInvitationToken = (token) => {
  try {
    return jwt.verify(token, INVITATION_TOKEN_SECRET);
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
};
export {
  generateAccessToken,
  generateRefreshToken,
  generateInvitationToken,
  verifyInvitationToken,
};

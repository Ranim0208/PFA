import User from "../models/User.js";

export const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

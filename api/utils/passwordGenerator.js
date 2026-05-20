// utils/passwordGenerator.js
import crypto from "crypto";

const generatePassword = (length = 10) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  while (password.length < length) {
    const byteArray = crypto.randomBytes(length);
    for (let i = 0; i < byteArray.length && password.length < length; i++) {
      const randomIndex = byteArray[i] % chars.length;
      password += chars[randomIndex];
    }
  }
  return password.slice(0, length);
};
export default generatePassword;

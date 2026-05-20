import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_MAIL,
        pass: process.env.ADMIN_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Plateforme Tacir" <${process.env.ADMIN_MAIL}>`,
      to,
      subject,
      text, // fallback plain text (optional)
      html, // actual HTML body
    });

    console.log("✅ Email sent to:", to);
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw new Error("Failed to send the email");
  }
};

export default sendEmail;

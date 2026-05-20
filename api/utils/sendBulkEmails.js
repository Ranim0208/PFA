import sendEmail from "./emailSender.js";
// Fonction pour envoyer des emails en masse
export const sendBulkEmails = async (recipients) => {
  const results = [];

  for (const recipient of recipients) {
    try {
      const info = await sendEmail(recipient); // 👈 Fix here
      results.push({
        email: recipient.to,
        status: "sent",
        messageId: info.messageId,
      });
    } catch (error) {
      results.push({
        email: recipient.to || recipient.email || "unknown",
        status: "failed",
        error: error.message,
      });
    }
  }

  return results;
};

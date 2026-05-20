import sendEmail from "../utils/emailSender.js";
import {
  generateUserAcceptanceEmail,
  generateRegionalCoordinatorEmail,
  generateGeneralCoordinatorEmail,
  getEventDatesText,
} from "../utils/emailTemplates.js";

export const sendAcceptanceEmails = async (form, submissions) => {
  const eventDatesText = getEventDatesText(form.eventDates);

  for (const submission of submissions) {
    const emailData = generateUserAcceptanceEmail(
      submission.user,
      form,
      eventDatesText
    );
    await sendEmail(emailData);
  }
};

export const sendCoordinatorNotifications = async (
  form,
  submissions,
  coordinators
) => {
  const eventDatesText = getEventDatesText(form.eventDates);

  for (const coordinator of coordinators) {
    let emailData;

    if (coordinator.roles.includes("RegionalCoordinator")) {
      emailData = generateRegionalCoordinatorEmail(
        coordinator,
        form,
        submissions,
        eventDatesText
      );
    } else {
      emailData = generateGeneralCoordinatorEmail(
        coordinator,
        form,
        submissions,
        eventDatesText
      );
    }

    await sendEmail(emailData);
  }
};

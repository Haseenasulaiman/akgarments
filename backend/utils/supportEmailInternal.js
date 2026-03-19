import { sendEmail as coreSendEmail } from "./emailService.js";

export const sendEmail = async ({ to, subject, html, attachments }) => {
  await coreSendEmail({ to, subject, html, attachments });
};


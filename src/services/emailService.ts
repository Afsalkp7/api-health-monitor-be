import nodemailer from "nodemailer";

// 1. Configure Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER, // Your Gmail
    pass: process.env.MAIL_PASS, // Your App Password
  },
});

// 2. Generic Send Function
export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const info = await transporter.sendMail({
      from: `"CloudStack Monitor" <${process.env.MAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send to ${to}:`, error);
    return false;
  }
};
import { Resend } from "resend";
import { logger } from "../utils/logger";

const resend = new Resend(process.env.RESEND_API_KEY);
const senderEmail = process.env.EMAIL_FROM || "operations@theathleticzone.in";

const sendEmailSafe = async (payload: any) => {
  try {
    await resend.emails.send(payload);
  } catch (error: unknown) {
    logger.error("Email Dispatch Failed", {
      error: (error as Error).message,
      subject: payload.subject,
    });
  }
};

export const sendPasswordResetEmail = async (email: string, otp: string) => {
  await sendEmailSafe({
    from: `The Athletic Zone Security <${senderEmail}>`,
    to: email,
    subject: "Reset Your Performance Credentials • The Athletic Zone",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 40px; background-color: #0B0F14; color: white;">
        <div style="max-width: 500px; margin: auto; background: #121821; padding: 40px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); text-align: center;">
          <h1 style="color: #F59E0B; font-style: italic; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;">Security Alert</h1>
          <p style="color: rgba(255,255,255,0.6); font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Password Reset Request Detected</p>
          <div style="margin: 40px 0; background: #0B0F14; padding: 20px; border-radius: 16px; border: 1px dashed rgba(245,158,11,0.3);">
            <p style="color: rgba(255,255,255,0.4); font-size: 10px; text-transform: uppercase; margin-bottom: 10px;">Your 6-Digit Entry Code</p>
            <h2 style="color: #F59E0B; font-size: 42px; font-weight: 900; letter-spacing: 12px; margin: 0;">${otp}</h2>
          </div>
          <p style="color: rgba(255,255,255,0.5); font-size: 12px; line-height: 1.6;">
            If you did not request this, please secure your account immediately. This code will expire in 10 minutes.
          </p>
        </div>
      </div>
    `,
  });
};

export const sendVerificationEmail = async (email: string, otp: string) => {
  await sendEmailSafe({
    from: `The Athletic Zone <${senderEmail}>`,
    to: email,
    subject: "Activate Your Performance Account • The Athletic Zone",
    html: `
      <div style="font-family: sans-serif; background-color: #0B0F14; color: white; padding: 40px; text-align: center;">
        <h1 style="color: #F59E0B; font-style: italic;">WELCOME TO THE ZONE</h1>
        <p style="color: rgba(255,255,255,0.6);">Prove your identity to unlock technical deployments.</p>
        <div style="margin: 30px 0; background: #121821; padding: 20px; border-radius: 12px; border: 1px solid #F59E0B;">
          <span style="font-size: 32px; font-weight: 900; letter-spacing: 10px; color: #F59E0B;">${otp}</span>
        </div>
        <p style="font-size: 10px; color: rgba(255,255,255,0.3);">This activation code expires in 24 hours.</p>
      </div>
    `,
  });
};

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// 🛡️ Dynamically pull the verified domain from your .env file
const senderEmail = process.env.EMAIL_FROM || "operations@theathleticzone.in";

export const sendCoachInviteEmail = async (
  email: string,
  inviteLink: string,
) => {
  await resend.emails.send({
    from: `The Athletic Zone <${senderEmail}>`,
    to: email,
    subject: "You’ve been invited to join The Athletic Zone as a Coach",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 40px; background-color: #0f0f1a; color: white;">
        <div style="max-width: 500px; margin: auto; background: #141427; padding: 30px; border-radius: 12px;">
          <h2 style="margin-bottom: 20px;">Coach Invitation</h2>
          
          <p>You’ve been invited to join <strong>The Athletic Zone</strong> as a Coach.</p>
          
          <p>Click the button below to activate your account:</p>
          
          <a href="${inviteLink}" 
             style="display: inline-block; margin-top: 20px; padding: 12px 20px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 8px;">
             Accept Invitation
          </a>

          <p style="margin-top: 30px; font-size: 12px; opacity: 0.6;">
            This invitation expires in 24 hours.
          </p>
        </div>
      </div>
    `,
  });
};

export const sendPasswordResetEmail = async (email: string, otp: string) => {
  await resend.emails.send({
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
  await resend.emails.send({
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

export const sendLiveDeploymentEmail = async (
  email: string,
  sportName: string,
  scheduledTime: string,
  scheduledDate: string,
) => {
  await resend.emails.send({
    from: `The Athletic Zone Deployments <${senderEmail}>`,
    to: email,
    subject: `LIVE DEPLOYMENT: ${sportName} • The Athletic Zone`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 40px; background-color: #0B0F14; color: white;">
        <div style="max-width: 500px; margin: auto; background: #121821; padding: 40px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05); text-align: center;">
          <h1 style="color: #F59E0B; font-style: italic; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;">Next Deployment</h1>
          <p style="color: rgba(255,255,255,0.6); font-size: 12px; text-transform: uppercase; letter-spacing: 2px;">Technical Training Cluster Assigned</p>
          
          <div style="margin: 40px 0; background: #0B0F14; padding: 30px; border-radius: 16px; border: 1px solid rgba(245,158,11,0.2);">
            <p style="color: rgba(255,255,255,0.4); font-size: 10px; text-transform: uppercase; margin-bottom: 5px;">Sport Sector</p>
            <h2 style="color: white; font-size: 24px; font-weight: 800; margin: 0 0 20px 0;">${sportName}</h2>
            
            <p style="color: rgba(255,255,255,0.4); font-size: 10px; text-transform: uppercase; margin-bottom: 5px;">Deployment Time (IST)</p>
            <h2 style="color: #F59E0B; font-size: 32px; font-weight: 900; margin: 0;">${scheduledTime}</h2>
            <p style="color: rgba(255,255,255,0.4); font-size: 12px; margin-top: 5px;">${new Date(scheduledDate).toLocaleDateString()}</p>
          </div>

          <a href="${process.env.CLIENT_URL}/athlete" 
             style="display: inline-block; background-color: #F59E0B; color: black; padding: 15px 35px; border-radius: 12px; text-decoration: none; font-weight: 900; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">
             Access Performance Hub
          </a>

          <p style="color: rgba(255,255,255,0.4); font-size: 11px; line-height: 1.6; margin-top: 30px;">
            Connection window opens 10 minutes prior to deployment. Ensure your hardware is ready for live telemetry.
          </p>
        </div>
      </div>
    `,
  });
};

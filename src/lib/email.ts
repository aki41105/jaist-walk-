import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.FROM_EMAIL || 'JAIST Walk <onboarding@resend.dev>';

export async function sendRegistrationEmail(
  to: string,
  name: string
): Promise<void> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set, skipping email to', to);
    return;
  }
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'JAIST Walk - 登録完了 / Registration Complete',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #16a34a; font-size: 24px;">🦎 JAIST Walk</h1>
        <p>ご登録ありがとうございます！<br/>Thank you for registering!</p>
        <div style="background: #f0fdf4; border: 2px solid #16a34a; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">あなたのアカウント名 / Your Account Name</p>
          <p style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #16a34a;">${name}</p>
        </div>
        <p style="color: #666; font-size: 14px;">
          このアカウント名でログインしてください。<br/>
          Please use this account name to log in.
        </p>
      </div>
    `,
  });
}

export async function sendRecoveryEmail(
  to: string,
  name: string
): Promise<void> {
  if (!resend) {
    console.warn('[email] RESEND_API_KEY not set, skipping recovery email to', to);
    return;
  }
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: 'JAIST Walk - アカウント名復旧 / Account Recovery',
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <h1 style="color: #16a34a; font-size: 24px;">🦎 JAIST Walk</h1>
        <p>アカウント名復旧のリクエストを受け付けました。<br/>We received your account recovery request.</p>
        <div style="background: #f0fdf4; border: 2px solid #16a34a; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
          <p style="margin: 0 0 8px 0; font-size: 14px; color: #666;">あなたのアカウント名 / Your Account Name</p>
          <p style="margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #16a34a;">${name}</p>
        </div>
        <p style="color: #666; font-size: 14px;">
          このアカウント名でログインしてください。<br/>
          Please use this account name to log in.
        </p>
      </div>
    `,
  });
}

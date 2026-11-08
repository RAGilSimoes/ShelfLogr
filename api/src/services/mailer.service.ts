import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

const getResetPasswordEmailHtml = (code: string): string => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ShelfLogr - Password Reset</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
    <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 40px 16px;">
      <tr>
        <td align="center">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 460px; background-color: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            <!-- Logótipo / Cabeçalho -->
            <tr>
              <td style="padding: 32px 32px 16px 32px; text-align: center;">
                <h1 style="margin: 0; color: #0f172a; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">ShelfLogr</h1>
              </td>
            </tr>

            <!-- Conteúdo Principal -->
            <tr>
              <td style="padding: 0 32px 28px 32px; text-align: center;">
                <h2 style="margin: 0 0 12px 0; color: #1e293b; font-size: 18px; font-weight: 600;">Reset your password</h2>
                <p style="margin: 0 0 24px 0; color: #64748b; font-size: 14px; line-height: 1.5;">
                  We received a request to reset the password for your ShelfLogr account. Use the verification code below to proceed:
                </p>
                
                <!-- Caixa de Destaque do Código OTP -->
                <div style="background-color: #f1f5f9; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 16px 28px; margin: 0 auto 24px auto; display: inline-block;">
                  <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; color: #2563eb; letter-spacing: 6px;">${code}</span>
                </div>

                <p style="margin: 0 0 12px 0; color: #64748b; font-size: 13px; line-height: 1.5;">
                  This code will expire in <strong>15 minutes</strong>.
                </p>
                <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.5;">
                  If you didn't request a password reset, you can safely ignore this email. Your account remains secure.
                </p>
              </td>
            </tr>

            <!-- Rodapé -->
            <tr>
              <td style="padding: 20px 32px; background-color: #f8fafc; border-top: 1px solid #f1f5f9; text-align: center;">
                <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                  © ${new Date().getFullYear()} ShelfLogr. All rights reserved.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
};

export const sendEmail = async (to: string, code: string): Promise<boolean> => {
  try {
    const { data, error } = await resend.emails.send({
      from: `ShelfLogr Support <${process.env.SENDER_EMAIL}>`,
      to: [to],
      subject: 'ShelfLogr - Password Reset Code',
      html: getResetPasswordEmailHtml(code),
      text: `Your ShelfLogr password reset code is: ${code}. This code is valid for 15 minutes. If you did not request this code, please ignore this email.`,
    });

    if (error) {
      console.error('Error sending email with Resend:', error);
      return false;
    }

    return Boolean(data && data.id);
  } catch (error) {
    console.error('Exception caught while sending email:', error);
    return false;
  }
};

interface VerifyEmailTemplateProps {
  logoUrl: string;
  verificationUrl: string;
  companyName: string;
  expiryHours?: number;
}

export function buildVerifyEmailHtml({
  logoUrl,
  verificationUrl,
  companyName,
  expiryHours = 24,
}: VerifyEmailTemplateProps): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify Your Account</title>
</head>

<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:Segoe UI,Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table width="100%" cellpadding="0" cellspacing="0" role="presentation"
          style="max-width:600px;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 4px rgba(0,0,0,0.1);">

          <!-- Header -->
          <tr>
            <td align="center"
              style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:40px 20px;">
              <img src="${logoUrl}" alt="${companyName} Logo" width="120" style="display:block;" />
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px 30px;text-align:center;">
              <h1 style="margin:0 0 20px;font-size:28px;color:#333;">
                Verify Your Account
              </h1>

              <p style="margin:15px 0;font-size:16px;color:#666;line-height:1.6;">
                Thank you for signing up! To get started, please verify your email address by clicking the button below.
              </p>

              <p style="margin:30px 0 0;font-size:16px;color:#666;">
                This link will expire in ${expiryHours} hours.
              </p>

              <!-- Button -->
              <div style="margin:40px 0;">
                <a href="${verificationUrl}"
                  style="display:inline-block;background:#667eea;color:#ffffff;
                  text-decoration:none;padding:14px 40px;border-radius:5px;
                  font-size:16px;font-weight:bold;">
                  Verify My Account
                </a>
              </div>

              <!-- Fallback link -->
              <p style="font-size:14px;color:#999;margin-top:30px;">
                Or copy and paste this link in your browser:<br />
                <a href="${verificationUrl}" style="color:#667eea;word-break:break-all;">
                  ${verificationUrl}
                </a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;padding:20px;text-align:center;border-top:1px solid #e0e0e0;">
              <p style="margin:0;font-size:12px;color:#999;line-height:1.5;">
                If you didn’t create this account, you can safely ignore this email.
              </p>
              <p style="margin:8px 0 0;font-size:12px;color:#999;">
                © ${new Date().getFullYear()} ${companyName}. All rights reserved.
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
}

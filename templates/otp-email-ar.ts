const BRAND = {
  name: "اعرفني",
  primary: "#7c3aed",
  primarySoft: "#f5f3ff",
  primaryBorder: "#ddd6fe",
  text: "#18181b",
  muted: "#52525b",
  subtle: "#a1a1aa",
  border: "#e4e4e7",
  bg: "#f4f4f5",
};

const FONT =
  "Tahoma,'Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Arial,sans-serif";

export interface OtpEmailOptions {
  otp: string;
  name?: string;
  expiresInMinutes?: number;
  purpose?: string;
  logoUrl?: string;
  supportEmail?: string;
  secureAccountUrl?: string;
}

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

export const otpEmailSubject = () =>
  `رمز التحقق الخاص بك من ${BRAND.name} (Verification code)`;

export const otpEmailTemplate = (opts: OtpEmailOptions | string) => {
  const o: OtpEmailOptions = typeof opts === "string" ? { otp: opts } : opts;
  const otp = esc(o.otp);
  const minutes = o.expiresInMinutes ?? 5;
  const purpose = esc(o.purpose ?? "لإتمام عملية التسجيل");
  const name = o.name ? esc(o.name) : "";
  const year = new Date().getFullYear();

  const logo = o.logoUrl
    ? `<img src="${esc(o.logoUrl)}" width="40" height="40" alt="${BRAND.name}" style="display:block;border:0;border-radius:10px;" />`
    : `<span style="font-family:${FONT};font-size:22px;font-weight:800;color:#ffffff;">${BRAND.name}</span>`;

  const secureLink = o.secureAccountUrl
    ? ` <a href="${esc(o.secureAccountUrl)}" style="color:${BRAND.primary};font-weight:700;text-decoration:underline;">تأمين الحساب</a>`
    : "";

  const support = o.supportEmail
    ? `<a href="mailto:${esc(o.supportEmail)}" style="color:${BRAND.primary};text-decoration:none;">${esc(o.supportEmail)}</a>`
    : "";

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no" />
  <title>رمز التحقق - ${BRAND.name}</title>
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
    table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}
    img{-ms-interpolation-mode:bicubic;border:0;outline:none;text-decoration:none;}
    body{margin:0!important;padding:0!important;width:100%!important;}
    @media only screen and (max-width:520px){
      .container{width:100%!important;}
      .px{padding-left:20px!important;padding-right:20px!important;}
      .otp{font-size:34px!important;letter-spacing:6px!important;}
    }
  </style>
</head>
<body dir="rtl" style="margin:0;padding:0;background:${BRAND.bg};direction:rtl;-webkit-font-smoothing:antialiased;">

  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:#f4f4f5;opacity:0;">
    رمز التحقق الخاص بك هو ${otp}. صالح لمدة ${minutes} دقائق. Your verification code is ${otp}.
    &#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.bg};">
    <tr>
      <td align="center" style="padding:32px 12px;">

        <table role="presentation" class="container" width="560" cellpadding="0" cellspacing="0" border="0"
          style="width:560px;max-width:560px;background:#ffffff;border:1px solid ${BRAND.border};border-radius:16px;">

          <tr>
            <td class="px" align="right" bgcolor="${BRAND.primary}"
              style="background:${BRAND.primary};padding:24px 36px;border-radius:16px 16px 0 0;">
              ${logo}
            </td>
          </tr>

          <tr>
            <td class="px" align="right" style="padding:36px 36px 8px;font-family:${FONT};">
              <h1 style="margin:0;font-size:22px;line-height:1.4;font-weight:700;color:${BRAND.text};font-family:${FONT};text-align:right;">
                رمز التحقق الخاص بك
              </h1>
            </td>
          </tr>

          <tr>
            <td class="px" align="right" style="padding:8px 36px 0;font-family:${FONT};font-size:15px;line-height:1.9;color:${BRAND.muted};text-align:right;">
              ${name ? `مرحباً <strong style="color:${BRAND.text};">${name}</strong>،<br />` : ""}
              استخدم الرمز التالي ${purpose} في ${BRAND.name}:
            </td>
          </tr>

          <tr>
            <td class="px" align="center" style="padding:24px 36px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" bgcolor="${BRAND.primarySoft}"
                    style="background:${BRAND.primarySoft};border:1px solid ${BRAND.primaryBorder};border-radius:12px;padding:26px 12px;">
                    <div dir="ltr" class="otp"
                      style="direction:ltr;text-align:center;font-family:'SF Mono','Roboto Mono',Consolas,'Courier New',monospace;font-size:42px;line-height:1.1;font-weight:700;letter-spacing:10px;color:${BRAND.primary};">${otp}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="px" align="right" style="padding:12px 36px 0;font-family:${FONT};font-size:13px;line-height:1.8;color:${BRAND.muted};text-align:right;">
              ينتهي هذا الرمز خلال <strong style="color:${BRAND.text};">${minutes} دقائق</strong> ويُستخدم مرة واحدة فقط.
            </td>
          </tr>

          <tr>
            <td class="px" style="padding:28px 36px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="4" bgcolor="${BRAND.primary}" style="background:${BRAND.primary};font-size:0;line-height:0;border-radius:0 4px 4px 0;">&nbsp;</td>
                  <td align="right" bgcolor="#fafafa"
                    style="background:#fafafa;padding:14px 18px;font-family:${FONT};text-align:right;border-radius:4px 0 0 4px;">
                    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:${BRAND.text};font-family:${FONT};">🔒 حافظ على أمان حسابك</p>
                    <p style="margin:0;font-size:12.5px;line-height:1.8;color:${BRAND.muted};font-family:${FONT};">
                      لن يطلب منك فريق ${BRAND.name} هذا الرمز عبر الهاتف أو الرسائل أبداً. لا تشاركه مع أي شخص.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td class="px" align="right" style="padding:16px 36px 32px;font-family:${FONT};font-size:13px;line-height:1.9;color:${BRAND.muted};text-align:right;">
              إذا لم تطلب هذا الرمز، يمكنك تجاهل هذه الرسالة بأمان.${secureLink}
            </td>
          </tr>

          <tr>
            <td class="px" align="right" bgcolor="#fafafa"
              style="background:#fafafa;border-top:1px solid ${BRAND.border};padding:20px 36px;border-radius:0 0 16px 16px;font-family:${FONT};text-align:right;">
              <p style="margin:0 0 4px;font-size:12px;line-height:1.7;color:${BRAND.subtle};font-family:${FONT};">
                هذه رسالة أمان تلقائية، يرجى عدم الرد عليها.${support ? ` للمساعدة: ${support}` : ""}
              </p>
              <p style="margin:0;font-size:12px;color:${BRAND.subtle};font-family:${FONT};">
                &copy; ${year} ${BRAND.name}. جميع الحقوق محفوظة.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const otpEmailText = (opts: OtpEmailOptions | string) => {
  const o: OtpEmailOptions = typeof opts === "string" ? { otp: opts } : opts;
  const minutes = o.expiresInMinutes ?? 5;
  return [
    BRAND.name,
    "",
    o.name ? `مرحباً ${o.name}،` : "مرحباً،",
    "",
    `رمز التحقق الخاص بك هو: ${o.otp}`,
    `Your verification code is: ${o.otp}`,
    "",
    `ينتهي خلال ${minutes} دقائق ويُستخدم مرة واحدة فقط.`,
    "لا تشاركه مع أي شخص. إذا لم تطلبه، تجاهل هذه الرسالة.",
    "",
    `© ${new Date().getFullYear()} ${BRAND.name}`,
  ].join("\n");
};
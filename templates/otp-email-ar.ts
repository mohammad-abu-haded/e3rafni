const otpEmailTemplate = (otp: string) => `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>رمز التحقق الخاص بك</title>
</head>
<body dir="rtl" style="margin:0;padding:0;background:#f4f4f5;-webkit-font-smoothing:antialiased;direction:rtl;">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;line-height:1px;color:transparent;">
    رمز التسجيل الخاص بك: ${otp} — صالح لمدة 5 دقائق. لا تشاركه مع أحد.&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;&#847;
  </div>
  <table width="100%" cellpadding="0" cellspacing="0" border="0" dir="rtl"
    style="background:#f4f4f5;padding:48px 16px;min-width:320px;direction:rtl;">
    <tr>
      <td align="center" valign="top">
        <table width="480" cellpadding="0" cellspacing="0" border="0" dir="rtl"
          style="max-width:480px;width:100%;background:#ffffff;border-radius:16px;
                 border:1px solid #e4e4e7;overflow:hidden;direction:rtl;">
          <tr>
            <td style="height:3px;background:linear-gradient(90deg, #8B5CF6FF 0%, #04B6D4FF 100%);font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="padding:28px 36px 24px;border-bottom:1px solid #f4f4f5;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" dir="rtl">
                <tr>
                  <td align="right">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="
                          background:#f5f3ff;
                          border:1px solid #c4b5fd;
                          border-radius:6px;
                          padding:5px 12px;
                        ">
                          <span style="
                            font-size:12px;font-weight:700;color:#7c3aed;
                            letter-spacing:0.02em;
                            font-family:'Tahoma','Segoe UI',-apple-system,BlinkMacSystemFont,Arial,sans-serif;
                          ">اعرفني</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <td align="left">
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="
                          background:#ecfeff;
                          border:1px solid #67e8f9;
                          border-radius:99px;
                          padding:4px 10px;
                        ">
                          <span style="
                            font-size:11px;font-weight:600;color:#0e7490;
                            font-family:'Tahoma','Segoe UI',-apple-system,BlinkMacSystemFont,Arial,sans-serif;
                          ">&#9203; 5 دقائق</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 36px 28px;text-align:right;">
              <p style="
                margin:0 0 6px;font-size:22px;font-weight:700;color:#09090b;line-height:1.35;text-align:right;
                font-family:'Tahoma','Segoe UI',-apple-system,BlinkMacSystemFont,Arial,sans-serif;
              ">تحقق من هويتك</p>
              <p style="
                margin:0 0 28px;font-size:14px;color:#71717a;line-height:1.8;text-align:right;
                font-family:'Tahoma','Segoe UI',-apple-system,BlinkMacSystemFont,Arial,sans-serif;
              ">
                أدخل هذا الرمز لإتمام عملية التسجيل. لا تشاركه مع أي شخص.
              </p>
              <table cellpadding="0" cellspacing="0" border="0" width="100%" dir="rtl">
                <tr>
                  <td style="
                    background:#fafafa;
                    border:2px solid transparent;
                    border-radius:12px;
                    padding:24px;
                    text-align:center;
                    background-image: linear-gradient(#fafafa, #fafafa), linear-gradient(90deg, #8B5CF6FF 0%, #04B6D4FF 100%);
                    background-origin: border-box;
                    background-clip: padding-box, border-box;
                  ">
                    <p style="
                      margin:0 0 10px;
                      font-size:10px;font-weight:600;color:#a1a1aa;
                      letter-spacing:0.05em;text-align:center;
                      font-family:'Tahoma','Segoe UI',-apple-system,BlinkMacSystemFont,Arial,sans-serif;
                    ">رمز التسجيل الخاص بك</p>
                    <span dir="ltr" style="
                      direction:ltr;unicode-bidi:embed;
                      display:block;
                      font-size:46px;
                      font-weight:800;
                      color:#09090b;
                      letter-spacing:0.2em;
                      font-family:'SF Mono','Fira Code','Fira Mono','Roboto Mono',
                                  'Courier New',Courier,monospace;
                      line-height:1;
                      text-align:center;
                    ">${otp}</span>
                    <div style="margin-top:18px;height:3px;background:#e4e4e7;border-radius:99px;">
                      <div style="width:100%;height:3px;background:linear-gradient(90deg, #8B5CF6FF 0%, #04B6D4FF 100%);border-radius:99px;"></div>
                    </div>
                    <p style="
                      margin:8px 0 0;font-size:11px;color:#a1a1aa;text-align:center;
                      font-family:'Tahoma','Segoe UI',-apple-system,BlinkMacSystemFont,Arial,sans-serif;
                    ">تنتهي صلاحيته خلال 5 دقائق</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:0 36px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" dir="rtl" style="
                background:#fafafa;
                border:1px solid #e4e4e7;
                border-right:3px solid #8B5CF6;
                border-radius:0 8px 8px 0;
              ">
                <tr>
                  <td style="padding:12px 16px;text-align:right;">
                    <p style="
                      margin:0 0 2px;font-size:12px;font-weight:600;color:#09090b;text-align:right;
                      font-family:'Tahoma','Segoe UI',-apple-system,BlinkMacSystemFont,Arial,sans-serif;
                    ">لم تطلب هذا؟</p>
                    <p style="
                      margin:0;font-size:12px;color:#71717a;line-height:1.75;text-align:right;
                      font-family:'Tahoma','Segoe UI',-apple-system,BlinkMacSystemFont,Arial,sans-serif;
                    ">
                      تجاهل هذه الرسالة — سينتهي صلاحية الرمز تلقائياً.
                      إذا تكرر الأمر، يرجى تأمين حسابك.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="
              padding:16px 36px;
              background:#fafafa;
              border-top:1px solid #f4f4f5;
              border-radius:0 0 16px 16px;
              text-align:right;
            ">
              <p style="
                margin:0;font-size:11px;color:#a1a1aa;text-align:right;
                font-family:'Tahoma','Segoe UI',-apple-system,BlinkMacSystemFont,Arial,sans-serif;
              ">
                &copy; ${new Date().getFullYear()} اعرفني &middot; رسالة أمان تلقائية
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
export { otpEmailTemplate };
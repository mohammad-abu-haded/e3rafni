import { otpEmailTemplate, otpEmailSubject } from "@/templates/otp-email-ar";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (
  email: string,
  otp: string,
  purpose = "لإتمام عملية التسجيل",
) => {
  await transporter.sendMail({
    from: `"E3rafni" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: otpEmailSubject(),
    html: otpEmailTemplate({
      otp,
      purpose,
      expiresInMinutes: 5,
    }),
  });
};

export { sendOtpEmail };

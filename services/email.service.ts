'use server';
import { otpEmailTemplate } from "@/templates/otp-email-ar";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOtpEmail = async (email: string, otp: string) => {
  await transporter.sendMail({
    from: `"E3rafni" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Email Verification",
    html: otpEmailTemplate(otp),
  });
};

export { sendOtpEmail };
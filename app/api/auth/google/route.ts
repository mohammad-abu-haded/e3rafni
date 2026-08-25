import { NextResponse } from "next/server";

const GET = async () => {
  const clientId = process.env.AUTH_GOOGLE_ID;

  if (!clientId) {
    throw new Error("AUTH_GOOGLE_ID is not configured");
  }

  const redirectUri =
    "http://localhost:3000/api/auth/callback/google";

  const googleUrl = new URL(
    "https://accounts.google.com/o/oauth2/v2/auth"
  );

  googleUrl.searchParams.set("client_id", clientId);
  googleUrl.searchParams.set("redirect_uri", redirectUri);
  googleUrl.searchParams.set("response_type", "code");
  googleUrl.searchParams.set("scope", "openid email profile");
  googleUrl.searchParams.set("access_type", "offline");
  googleUrl.searchParams.set("prompt", "select_account");

  return NextResponse.redirect(googleUrl);
}

export { GET }
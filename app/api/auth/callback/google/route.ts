import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import {
  getUserByEmail,
  getUserByGoogleId,
  signupWithGoogle,
} from "@/services/auth.service";
import { generateJWT } from "@/utils/auth";
import { User } from "@/types";
import { cookies } from "next/headers";

const client = new OAuth2Client(process.env.AUTH_GOOGLE_ID);

const GET = async (request: NextRequest) => {
  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json(
      { success: false, message: "Authorization code is missing" },
      { status: 400 },
    );
  }

  const clientId = process.env.AUTH_GOOGLE_ID;
  const clientSecret = process.env.AUTH_GOOGLE_SECRET;

  if (!clientId || !clientSecret) {
    return NextResponse.json(
      {
        success: false,
        message: "Google credentials are not configured",
      },
      { status: 500 },
    );
  }

  const redirectUri = "http://localhost:3000/api/auth/callback/google";

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenResponse.json();

  if (!tokenResponse.ok) {
    return NextResponse.json(
      {
        success: false,
        message: "Failed to exchange authorization code",
      },
      { status: 400 },
    );
  }

  if (!tokenData.id_token) {
    return NextResponse.json(
      {
        success: false,
        message: "Google did not return an ID token",
      },
      { status: 400 },
    );
  }

  const ticket = await client.verifyIdToken({
    idToken: tokenData.id_token,
    audience: clientId,
  });

  const payload = ticket.getPayload();

  if (!payload) {
    return NextResponse.json(
      {
        success: false,
        message: "Invalid Google ID token",
      },
      { status: 401 },
    );
  }

  const googleId = payload.sub;
  const email = payload.email;
  const name = payload.name;

  if (!googleId || !email || !name) {
    return NextResponse.json(
      {
        success: false,
        message: "Required Google user information is missing",
      },
      { status: 400 },
    );
  }

  let user: User | null = await getUserByGoogleId(googleId);
  if (!user) {
    user = await getUserByEmail(email);
    if (user) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to sign in with Google. Please try another sign-in method",
        },
        { status: 400 },
      );
    }
    const newUser = await signupWithGoogle(email, googleId, name);
    if (!newUser) {
      return NextResponse.json(
        { success: false, message: "Failed to create user" },
        { status: 400 },
      );
    }
    user = newUser;
  }

  const token = await generateJWT(user);
  (await cookies()).set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return NextResponse.json(
    { success: true, message: "Login successful" },
    { status: 200 },
  );
};

export { GET };

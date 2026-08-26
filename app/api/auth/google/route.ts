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

const POST = async (request: NextRequest) => {
  try {
    const { credential } = (await request.json()) as {
      credential?: string;
    };

    if (!credential) {
      return NextResponse.json(
        {
          success: false,
          message: "Google credential is required",
        },
        { status: 400 },
      );
    }

    const clientId = process.env.AUTH_GOOGLE_ID;

    if (!clientId) {
      return NextResponse.json(
        {
          success: false,
          message: "Google credentials are not configured",
        },
        { status: 500 },
      );
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Google credential",
        },
        { status: 401 },
      );
    }

    const googleId = payload.sub;
    const email = payload.email;
    const name = payload.name;
    const picture = payload.picture;

    if (!googleId || !email || !name) {
      return NextResponse.json(
        {
          success: false,
          message: "Required Google user information is missing",
        },
        { status: 400 },
      );
    }

    let isSignup = false;
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

      const newUser = await signupWithGoogle(email, googleId, name, picture);

      if (!newUser) {
        return NextResponse.json(
          {
            success: false,
            message: "Failed to create user",
          },
          { status: 400 },
        );
      }

      user = newUser;
      isSignup = true;
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
      {
        success: true,
        message: isSignup
          ? "Account created and logged in successfully"
          : "Logged in successfully",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Google authentication error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to complete Google sign-in",
      },
      { status: 401 },
    );
  }
};

export { POST };

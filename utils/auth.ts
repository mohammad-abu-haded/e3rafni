import { Room, User } from "@/types";
import { compareSync, hashSync } from "bcryptjs";
import { NextRequest } from "next/server";

import * as jose from "jose";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured");
}

const compareHash = (value: string, hashValue: string): boolean => {
  return compareSync(value, hashValue);
};

const hashValue = (value: string): string => {
  return hashSync(value);
};

const generateJWT = async (user: User): Promise<string> => {
  const token = await new jose.SignJWT({
    id: user.id,
    role: user.role,
    name: user.name,
  })
    .setExpirationTime("1m")
    .setProtectedHeader({ alg: "HS256" })
    .sign(new TextEncoder().encode(JWT_SECRET));

  return token;
};

const verifyToken = async (token: string): Promise<User | null> => {
  try {
    const { payload } = await jose.jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET),
    );
    return payload as User;
  } catch (error) {
    return null;
  }
};

const getAuthUser = async (request: NextRequest) => {
  const token = request.cookies.get("token")?.value;

  if (!token) {
    return null;
  }

  const user = await verifyToken(token);

  if (!user) {
    return null;
  }

  return user;
};

export { compareHash, hashValue, generateJWT, verifyToken, getAuthUser };

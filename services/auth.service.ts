'use server';
import prisma from "@/lib/prisma";
import { User } from "@/types";
import { compareHash, hashValue } from "@/utils/auth";

const login = async (email: string, password: string): Promise<User | null> => {
  const user = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (!user || !user.password) {
    return null;
  }

  const isValid = compareHash(password, user.password);
  if (!isValid) {
    return null;
  }

  return user;
};

const signup = async (
  email: string,
  password: string,
  name: string,
  { passwordIsHashed }: { passwordIsHashed: boolean },
): Promise<User | null> => {
  try {
    const user = await prisma.users.create({
      data: {
        email,
        password: passwordIsHashed ? password : hashValue(password),
        name,
        googleId: null,
      },
    });

    return user;
  } catch (error) {
    return null;
  }
};

const signupWithGoogle = async (
  email: string,
  googleId: string,
  name: string,
  picture: string | undefined,
): Promise<User | null> => {
  try {
    const user = await prisma.users.create({
      data: {
        email,
        googleId,
        name,
        password: null,
        picture: picture || null,
      },
    });

    return user;
  } catch (error) {
    return null;
  }
};

const getUserByEmail = async (email: string): Promise<User | null> => {
  return await prisma.users.findUnique({
    where: {
      email,
    },
  });
};

const getUserByGoogleId = async (googleId: string): Promise<User | null> => {
  return await prisma.users.findUnique({
    where: {
      googleId,
    },
  });
};


export { login, signup, getUserByEmail, signupWithGoogle, getUserByGoogleId };

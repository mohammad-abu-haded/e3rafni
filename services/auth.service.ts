import prisma from "@/lib/prisma";
import { User } from "@/types";
import { compareHash, hashValue } from "@/utils/auth";

const login = async (email: string, password: string): Promise<User | null> => {
  const user = await prisma.users.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
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
  {passwordIsHashed}: {passwordIsHashed: boolean},
): Promise<User | null> => {
  try {
    const user = await prisma.users.create({
      data: {
        email,
        password: passwordIsHashed ? password : hashValue(password),
        name,
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

export { login, signup, getUserByEmail };

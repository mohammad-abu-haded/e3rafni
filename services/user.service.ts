import prisma from "@/lib/prisma";

export const getUserEmail = async (userId: number) => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
    });

    return user?.email;
  } catch (error) {
    return null;
  }
};

export const getUserData = async (userId: number) => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: userId,
      },
    });

    return user;
  } catch (error) {
    return null;
  }
};

export const changeUserName = async (userId: number, newUserName: string) => {
  try {
    const user = await prisma.users.update({
      where: {
        id: userId,
      },
      data: {
        name: newUserName.trim(),
      },
    });

    return user;
  } catch (error) {
    return null;
  }
};

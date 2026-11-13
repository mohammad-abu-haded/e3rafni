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

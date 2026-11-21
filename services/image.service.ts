import prisma from "@/lib/prisma";
import { unlink } from "fs/promises";
import path from "path";

const updateProfilePicture = async (id: number, imageUrl: string) => {
  const user = await prisma.users.findUnique({
    where: { id },
    select: { picture: true },
  });

  const oldImageUrl = user?.picture;

  const updatedUser = await prisma.users.update({
    where: { id },
    data: { picture: imageUrl },
  });

  if (
    oldImageUrl &&
    oldImageUrl.startsWith("/uploads/profiles/") &&
    oldImageUrl !== imageUrl
  ) {
    const oldImagePath = path.join(
      process.cwd(),
      "public",
      oldImageUrl.slice(1),
    );

    try {
      await unlink(oldImagePath);
    } catch (error) {
      return null;
    }
  }

  return updatedUser.picture;
};

const getProfilePictureURL = async (id: number) => {
  const profilePictureURL = await prisma.users.findUnique({
    where: {
      id,
    },
    select: {
      picture: true,
    },
  });

  return profilePictureURL?.picture;
};

export { updateProfilePicture, getProfilePictureURL };

/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `Users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Users` ADD COLUMN `googleId` VARCHAR(191) NULL,
    MODIFY `password` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Users_googleId_key` ON `Users`(`googleId`);

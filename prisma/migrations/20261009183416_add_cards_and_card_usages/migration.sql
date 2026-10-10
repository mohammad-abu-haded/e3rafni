/*
  Warnings:

  - You are about to drop the column `cards` on the `Rooms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Rooms` DROP COLUMN `cards`;

-- CreateTable
CREATE TABLE `Cards` (
    `id` VARCHAR(191) NOT NULL,
    `roomId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `color` VARCHAR(191) NOT NULL,
    `maxPerPlayer` INTEGER NOT NULL,

    INDEX `Cards_roomId_idx`(`roomId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoundCardUsages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roundId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `cardId` VARCHAR(191) NOT NULL,
    `usedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RoundCardUsages_roundId_userId_cardId_idx`(`roundId`, `userId`, `cardId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Cards` ADD CONSTRAINT `Cards_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoundCardUsages` ADD CONSTRAINT `RoundCardUsages_roundId_userId_fkey` FOREIGN KEY (`roundId`, `userId`) REFERENCES `RoundMembers`(`roundId`, `userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoundCardUsages` ADD CONSTRAINT `RoundCardUsages_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `Cards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

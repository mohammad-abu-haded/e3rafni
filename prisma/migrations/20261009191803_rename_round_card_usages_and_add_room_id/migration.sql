/*
  Warnings:

  - You are about to drop the `RoundCardUsages` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `RoundCardUsages` DROP FOREIGN KEY `RoundCardUsages_cardId_fkey`;

-- DropForeignKey
ALTER TABLE `RoundCardUsages` DROP FOREIGN KEY `RoundCardUsages_roundId_userId_fkey`;

-- DropTable
DROP TABLE `RoundCardUsages`;

-- CreateTable
CREATE TABLE `PlayerCardUsages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER NOT NULL,
    `roundId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `cardId` VARCHAR(191) NOT NULL,
    `usedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `PlayerCardUsages_roomId_userId_cardId_idx`(`roomId`, `userId`, `cardId`),
    INDEX `PlayerCardUsages_roundId_userId_cardId_idx`(`roundId`, `userId`, `cardId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PlayerCardUsages` ADD CONSTRAINT `PlayerCardUsages_roundId_userId_fkey` FOREIGN KEY (`roundId`, `userId`) REFERENCES `RoundMembers`(`roundId`, `userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PlayerCardUsages` ADD CONSTRAINT `PlayerCardUsages_cardId_fkey` FOREIGN KEY (`cardId`) REFERENCES `Cards`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

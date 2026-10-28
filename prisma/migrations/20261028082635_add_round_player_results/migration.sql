-- CreateTable
CREATE TABLE `RoundPlayerResults` (
    `roundId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `result` ENUM('WIN', 'LOSS', 'DRAW') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `RoundPlayerResults_userId_result_idx`(`userId`, `result`),
    PRIMARY KEY (`roundId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RoundPlayerResults` ADD CONSTRAINT `RoundPlayerResults_roundId_userId_fkey` FOREIGN KEY (`roundId`, `userId`) REFERENCES `RoundMembers`(`roundId`, `userId`) ON DELETE CASCADE ON UPDATE CASCADE;

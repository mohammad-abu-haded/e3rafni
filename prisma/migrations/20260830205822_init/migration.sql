-- CreateTable
CREATE TABLE `Users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NULL,
    `googleId` VARCHAR(191) NULL,
    `picture` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Users_email_key`(`email`),
    UNIQUE INDEX `Users_googleId_key`(`googleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rooms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `totalRounds` INTEGER NOT NULL,
    `currentRound` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ownerId` INTEGER NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `isPrivate` BOOLEAN NOT NULL DEFAULT false,
    `capacity` INTEGER NOT NULL DEFAULT 10,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `status` ENUM('WAITING', 'PLAYING', 'FINISHED') NOT NULL DEFAULT 'WAITING',

    UNIQUE INDEX `Rooms_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoomMembers` (
    `roomId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,

    INDEX `RoomMembers_userId_idx`(`userId`),
    PRIMARY KEY (`roomId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rounds` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roomId` INTEGER NOT NULL,
    `roundNumber` INTEGER NOT NULL,
    `roundDuration` INTEGER NOT NULL,
    `startedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `mode` ENUM('SINGLE_QUESTION', 'CONTINUOUS_QUESTIONS') NOT NULL DEFAULT 'SINGLE_QUESTION',

    INDEX `Rounds_roomId_idx`(`roomId`),
    UNIQUE INDEX `Rounds_id_roomId_key`(`id`, `roomId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoundMembers` (
    `roundId` INTEGER NOT NULL,
    `roomId` INTEGER NOT NULL,
    `userId` INTEGER NOT NULL,
    `type` ENUM('PLAYER', 'VIEWER', 'RULER') NOT NULL,

    INDEX `RoundMembers_roundId_type_idx`(`roundId`, `type`),
    PRIMARY KEY (`roundId`, `userId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RoundWords` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `roundId` INTEGER NOT NULL,
    `playerId` INTEGER NOT NULL,
    `word` VARCHAR(191) NOT NULL,

    INDEX `RoundWords_roundId_idx`(`roundId`),
    UNIQUE INDEX `RoundWords_roundId_playerId_key`(`roundId`, `playerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Rooms` ADD CONSTRAINT `Rooms_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomMembers` ADD CONSTRAINT `RoomMembers_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoomMembers` ADD CONSTRAINT `RoomMembers_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `Users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rounds` ADD CONSTRAINT `Rounds_roomId_fkey` FOREIGN KEY (`roomId`) REFERENCES `Rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoundMembers` ADD CONSTRAINT `RoundMembers_roundId_roomId_fkey` FOREIGN KEY (`roundId`, `roomId`) REFERENCES `Rounds`(`id`, `roomId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoundMembers` ADD CONSTRAINT `RoundMembers_roomId_userId_fkey` FOREIGN KEY (`roomId`, `userId`) REFERENCES `RoomMembers`(`roomId`, `userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoundWords` ADD CONSTRAINT `RoundWords_roundId_fkey` FOREIGN KEY (`roundId`) REFERENCES `Rounds`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RoundWords` ADD CONSTRAINT `RoundWords_roundId_playerId_fkey` FOREIGN KEY (`roundId`, `playerId`) REFERENCES `RoundMembers`(`roundId`, `userId`) ON DELETE CASCADE ON UPDATE CASCADE;

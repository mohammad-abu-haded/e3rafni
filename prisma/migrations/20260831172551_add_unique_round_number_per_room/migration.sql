/*
  Warnings:

  - A unique constraint covering the columns `[roomId,roundNumber]` on the table `Rounds` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Rounds_roomId_roundNumber_key` ON `Rounds`(`roomId`, `roundNumber`);

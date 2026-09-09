/*
  Warnings:

  - Added the required column `cards` to the `Rooms` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Rooms` ADD COLUMN `cards` JSON NOT NULL;

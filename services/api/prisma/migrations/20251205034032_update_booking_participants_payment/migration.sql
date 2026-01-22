/*
  Warnings:

  - You are about to drop the column `guestEmail` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `guestName` on the `bookings` table. All the data in the column will be lost.
  - You are about to drop the column `guestPhone` on the `bookings` table. All the data in the column will be lost.
  - Added the required column `contactEmail` to the `bookings` table without a default value. This is not possible if the table is not empty.
  - Added the required column `participants` to the `bookings` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('SUBSCRIPTION', 'ON_SITE');

-- AlterTable
ALTER TABLE "bookings" DROP COLUMN "guestEmail",
DROP COLUMN "guestName",
DROP COLUMN "guestPhone",
ADD COLUMN     "contactEmail" TEXT NOT NULL,
ADD COLUMN     "participants" JSONB NOT NULL,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'ON_SITE';
